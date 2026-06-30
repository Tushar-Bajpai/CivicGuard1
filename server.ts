import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Increase body limit for base64 images
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
  if (imageUrl.startsWith("data:")) {
    const parts = imageUrl.split(",");
    const meta = parts[0];
    const mimeType = meta.split(";")[0].split(":")[1] || "image/jpeg";
    const data = parts[1];
    return { data, mimeType };
  }

  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { data: base64, mimeType: contentType };
}

async function runAnalysis(inlineData: { data: string; mimeType: string }, retryPrompt = ""): Promise<any> {
  const contents: any[] = [
    {
      inlineData
    },
    {
      text: retryPrompt ? `${retryPrompt}\nAnalyze the image again.` : "Analyze this image and output the civic report JSON."
    }
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

// AI analysis route simulating Cloud Function local proxy
app.post("/api/analyzeIssueImage", async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const inlineData = await getInlineData(imageUrl);
    const analysis = await runAnalysis(inlineData);
    return res.json(analysis);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});

// Setup Vite or production serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
