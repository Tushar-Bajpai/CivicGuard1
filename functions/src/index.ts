import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import * as admin from "firebase-admin";

admin.initializeApp();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const systemPrompt = `You are an expert Civic Infrastructure Assessor AI. Analyze images uploaded by citizens, identify public infrastructure issues, assess severity, and strictly categorize them. Act as a spam filter — if the image is a selfie, meme, screenshot, indoor photo, or doesn't depict a public infrastructure issue, reject it.

ALLOWED CATEGORIES: pothole_or_road_damage, water_leak_or_flooding, streetlight_broken, waste_or_garbage_dump, fallen_tree_or_debris, other_infrastructure

SEVERITY SCALE: low, medium, high, critical

Return ONLY raw JSON, no markdown, no explanation:
{ is_valid_issue: boolean, rejection_reason: string|null, category: string|null, severity: string|null, confidence_score: number, brief_description: string }`;

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/^```\s*/, "");
    cleaned = cleaned.replace(/```$/, "");
  }
  return cleaned.trim();
}

async function getInlineData(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.buffer();
  const base64 = buffer.toString("base64");
  return { data: base64, mimeType: contentType };
}

async function runAnalysis(inlineData: { data: string; mimeType: string }, retryPrompt = ""): Promise<any> {
  const contents: any[] = [
    { inlineData },
    { text: retryPrompt ? `${retryPrompt}\nAnalyze the image again.` : "Analyze this image and output the civic report JSON." }
  ];

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json"
    }
  });

  const text = result.text || "";
  const cleaned = cleanJson(text);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    if (retryPrompt) {
      throw err;
    }
    const retryInstruction = "Your previous response was not valid JSON. Return only the JSON object.";
    return runAnalysis(inlineData, retryInstruction);
  }
}

export const analyzeIssueImage = onRequest({ cors: true }, async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    res.status(400).send({ error: "imageUrl is required" });
    return;
  }

  try {
    const inlineData = await getInlineData(imageUrl);
    const result = await runAnalysis(inlineData);
    res.status(200).send(result);
  } catch (error: any) {
    console.error("Analysis failed:", error);
    res.status(500).send({ error: error.message || "Failed to analyze image" });
  }
});

/**
 * Firestore trigger: When confirmCount reaches 3, automatically
 * promote status from 'pending' to 'verified'.
 */
export const verifyIssueOnConfirm = onDocumentUpdated("issues/{issueId}", async (event) => {
  const newValue = event.data?.after.data();
  if (!newValue) {
    console.log("No new value found in after snapshot.");
    return;
  }

  const confirmCount = newValue.confirmCount || 0;
  const status = newValue.status || "pending";

  console.log(`Document updated: confirmCount is ${confirmCount}, status is ${status}`);

  if (confirmCount >= 3 && status === "pending") {
    console.log(`Promoting issue ${event.params.issueId} to verified status.`);
    await event.data?.after.ref.update({
      status: "verified",
      updatedAt: new Date().toISOString()
    });

    const reporterId = newValue.reporterId;
    if (reporterId && reporterId !== "demo-user-123") {
      console.log(`Awarding +20 bonus civicScore to reporter ${reporterId}`);
      await admin.firestore().collection("users").doc(reporterId).update({
        civicScore: admin.firestore.FieldValue.increment(20)
      });
    }
  }
});

/**
 * Firestore trigger: When a new issue is created,
 * award +10 civicScore to the reporter.
 */
export const onIssueCreated = onDocumentCreated("issues/{issueId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  
  const reporterId = data.reporterId;
  if (reporterId && reporterId !== "demo-user-123") {
    console.log(`Awarding +10 civicScore for new report to ${reporterId}`);
    try {
      await admin.firestore().collection("users").doc(reporterId).update({
        civicScore: admin.firestore.FieldValue.increment(10),
        reportsCount: admin.firestore.FieldValue.increment(1)
      });
    } catch (err) {
      console.error("Failed to update user score:", err);
    }
  }
});

/**
 * Firestore trigger: When a verification (vote) is created,
 * increment the issue's confirmCount and award +5 civicScore to the voter.
 */
export const onVerificationCreated = onDocumentCreated("verifications/{docId}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  
  const issueId = data.issueId;
  const voterId = data.voterId;

  if (issueId) {
    try {
      await admin.firestore().collection("issues").doc(issueId).update({
        confirmCount: admin.firestore.FieldValue.increment(1),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to update issue confirmCount:", err);
    }
  }

  if (voterId && voterId !== "demo-user-123") {
    console.log(`Awarding +5 civicScore for verification to ${voterId}`);
    try {
      await admin.firestore().collection("users").doc(voterId).update({
        civicScore: admin.firestore.FieldValue.increment(5),
        verifiedCount: admin.firestore.FieldValue.increment(1)
      });
    } catch (err) {
      console.error("Failed to update voter score:", err);
    }
  }
  }
});

/**
 * Core Escalation Logic
 * Finds verified issues older than 3 days and generates an escalation note via Gemini.
 */
async function processEscalations() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const cutoffIso = threeDaysAgo.toISOString();

  console.log(`Running Escalation Agent for verified issues updated before ${cutoffIso}`);

  const snapshot = await admin.firestore().collection("issues")
    .where("status", "==", "verified")
    .where("updatedAt", "<", cutoffIso)
    .get();

  if (snapshot.empty) {
    console.log("No stale verified issues found to escalate.");
    return { status: "success", escalatedCount: 0 };
  }

  let escalatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.escalationNote) {
      continue; // Already escalated
    }

    const issueContext = `
      Category: ${data.category || 'Unknown'}
      Description: ${data.description || 'No description provided'}
      Votes/Confirmations: ${data.confirmCount || 0}
      Days Stale: Since ${data.updatedAt}
    `;

    const prompt = `You are a Municipal Escalation Agent. A civic issue has been verified by the community but has remained unresolved for several days.
Generate a short, plain-language urgency note (1 sentence max) to escalate this to priority dispatch.
Example format: "This water leak has been unresolved for 4 days, confirmed by 8 residents — recommend priority dispatch"

Issue details:
${issueContext}`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const note = (result.text || "").trim().replace(/^"|"$/g, ""); // Strip quotes if any

      if (note) {
        await doc.ref.update({
          escalationNote: note,
          escalatedAt: new Date().toISOString()
        });
        escalatedCount++;
        console.log(`Escalated issue ${doc.id}: ${note}`);
      }
    } catch (err) {
      console.error(`Failed to escalate issue ${doc.id}:`, err);
    }
  }

  return { status: "success", escalatedCount };
}

/**
 * Scheduled trigger for Escalation Agent (runs daily at midnight).
 */
export const scheduledEscalation = onSchedule("every day 00:00", async (event) => {
  await processEscalations();
});

/**
 * HTTP trigger for manual testing of the Escalation Agent.
 */
export const manualEscalation = onRequest({ cors: true }, async (req, res) => {
  try {
    const result = await processEscalations();
    res.status(200).send(result);
  } catch (error: any) {
    console.error("Manual escalation failed:", error);
    res.status(500).send({ error: error.message || "Escalation failed" });
  }
});
