import { onRequest } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

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
  }
});
