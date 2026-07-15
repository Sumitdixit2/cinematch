import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

app.use(express.json());

// Initialize Gemini API with modern SDK
const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
  
} else {
  console.warn("⚠️  GEMINI_API_KEY is not set. Server will run in Mock Streaming Mode.");
}

// Serve built frontend assets in production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Model fallback chain using modern SDK compatible identifiers
const MODEL_FALLBACK_CHAIN = [
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite", "gemini-3.5-flash",
  "gemini-2.5-pro",
];

// Shared prompt instructions & content builder
const SYSTEM_INSTRUCTION = `You are a legendary film curator and cinema academic. Your task is to recommend THREE perfect movies matching the calibration settings. Provide the recommendations using the EXACT format. No markdown inside [TITLE] or [TAGLINE] tags. Use markdown inside [CONTENT].`;

function buildUserPrompt({ mood, time, genre, era, visual, pacing }) {
  return `Recommend THREE perfect movies matching these calibration settings:
- Mood/Vibe: ${mood}
- Time/Duration: ${time}
- Genre: ${genre}
- Era/Period: ${era}
- Visual Style: ${visual}
- Pacing: ${pacing}

[RECOMMENDATION 1]
[TITLE] <MOVIE TITLE IN UPPERCASE>
[METADATA] Year: <Year> | Director: <Director> | Runtime: <Runtime>
[TAGLINE] "<One poetic line>"
[CONTENT]
### Curation Synopsis
<2 spoiler-free sentences.>

### Why It Fits
- <How it matches the vibe/pacing>
- <How it matches the era/visuals>

[RECOMMENDATION 2]
[TITLE] <MOVIE TITLE IN UPPERCASE>
[METADATA] Year: <Year> | Director: <Director> | Runtime: <Runtime>
[TAGLINE] "<One poetic line>"
[CONTENT]
### Curation Synopsis
<2 spoiler-free sentences.>

### Why It Fits
- <How it matches the vibe/pacing>
- <How it matches the era/visuals>

[RECOMMENDATION 3]
[TITLE] <MOVIE TITLE IN UPPERCASE>
[METADATA] Year: <Year> | Director: <Director> | Runtime: <Runtime>
[TAGLINE] "<One poetic line>"
[CONTENT]
### Curation Synopsis
<2 spoiler-free sentences.>

### Why It Fits
- <How it matches the vibe/pacing>
- <How it matches the era/visuals>

Only suggest real, searchable movies. Output nothing else.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/recommend — SSE streaming endpoint
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/recommend", async (req, res) => {
  if (!aiClient) {
    return res.status(500).json({
      error: "Gemini API key not configured.",
    });
  }

  const { mood, time, genre, era, visual, pacing } = req.body;
  const userPrompt = buildUserPrompt({
    mood,
    time,
    genre,
    era,
    visual,
    pacing,
  });

  // Streaming headers (for fetch + ReadableStream)
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const keepAlive = setInterval(() => {
    if (!res.writableEnded) {
      res.write("");
    }
  }, 10000);

  req.on("close", () => {
    clearInterval(keepAlive);
    console.log("🔌 Client disconnected");
  });

  let lastError = null;

  try {
    for (const modelName of MODEL_FALLBACK_CHAIN) {
      try {
        console.log(`🎬 Trying model: ${modelName}`);

        const stream = await aiClient.models.generateContentStream({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.75,
          },
        });

        for await (const chunk of stream) {
          if (res.writableEnded || !res.writable) {
            return;
          }

          if (chunk.text) {
            res.write(chunk.text);
          }
        }

        console.log(`✅ Streamed successfully via ${modelName}`);
        res.end();
        return;

      } catch (error) {
        lastError = error;

        const is429 =
          error?.status === 429 ||
          error?.message?.includes("429") ||
          error?.message?.includes("RESOURCE_EXHAUSTED") ||
          error?.message?.includes("Quota exceeded");

        if (is429) {
          console.warn(`⚠️ ${modelName} quota exhausted. Trying next model...`);
          continue;
        }

        throw error;
      }
    }

    // All models failed
    res.status(500).end(
      lastError?.message || "All AI models are currently unavailable."
    );
  } catch (error) {
    console.error("❌ Recommendation error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || "Internal Server Error",
      });
    } else {
      res.end();
    }
  } finally {
    clearInterval(keepAlive);
  }
});

// SPA catch-all — serve index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀  CineMatch Server running on port ${PORT}`);
});
