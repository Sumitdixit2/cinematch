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
  
  // Self-test streaming on startup
  (async () => {
    try {
      console.log("🔍  Running startup Gemini API self-test...");
      const stream = await aiClient.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents: "Hello, startup test. Respond with one word.",
      });
      let chunks = 0;
      for await (const chunk of stream) {
        chunks++;
        console.log(`[SELF-TEST] Chunk ${chunks}: "${chunk.text}"`);
      }
      console.log(`🔍  Startup self-test completed. Received ${chunks} chunks.`);
    } catch (e) {
      console.error("❌  Startup self-test failed:", e.message);
    }
  })();
} else {
  console.warn("⚠️  GEMINI_API_KEY is not set. Server will run in Mock Streaming Mode.");
}

// Serve built frontend assets in production
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// ─────────────────────────────────────────────────────────────────────────────
// Retry helper with exponential backoff
// Retries a function up to `maxAttempts` times on 429 errors.
// ─────────────────────────────────────────────────────────────────────────────
async function retryWithBackoff(fn, maxAttempts = 3, baseDelayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("Too Many Requests") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (is429 && attempt < maxAttempts) {
        let retryAfterMs = baseDelayMs * Math.pow(2, attempt - 1);
        try {
          const match = err?.message?.match(/"retryDelay"\s*:\s*"(\d+)s"/);
          if (match) retryAfterMs = (parseInt(match[1], 10) + 2) * 1000;
        } catch (_) { }

        console.warn(
          `⏳  429 on attempt ${attempt}/${maxAttempts}. Retrying in ${retryAfterMs / 1000}s…`
        );
        await new Promise((r) => setTimeout(r, retryAfterMs));
      } else {
        throw err;
      }
    }
  }
}

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
  const { mood, time, genre, era, visual, pacing } = req.body;

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Keep-alive ping every 10 s — prevents AWS App Runner / Gateway timeouts
  const keepAlive = setInterval(() => res.write(":\n\n"), 10000);
  req.on("close", () => clearInterval(keepAlive));

  // ── Mock Mode ──────────────────────────────────────────────────────────────
  if (!aiClient) {
    const mock = `[RECOMMENDATION 1]
[TITLE] THE NEON SHADOW
[METADATA] Year: 2024 | Director: Elena Rostova | Runtime: 88 mins
[TAGLINE] "In a city drowned in light, the deepest secrets sleep in the dark."
[CONTENT]
### Curation Synopsis
A retro-futuristic neo-noir set in a rain-slicked metropolis. A private investigator with a cybernetic memory is hired to retrieve a lost analog film reel.

### Why It Fits
- Matches the requested ${mood} mood with its brooding atmosphere.
- The ${visual} visuals align perfectly with the high-contrast aesthetic.

[RECOMMENDATION 2]
[TITLE] ECHOES OF TOMORROW
[METADATA] Year: 2019 | Director: Marcus Vance | Runtime: 92 mins
[TAGLINE] "Time is just another frequency."
[CONTENT]
### Curation Synopsis
A tense, intimate sci-fi chamber piece where two scientists accidentally bridge a communication gap across decades.

### Why It Fits
- Delivers the ${pacing} pacing through brilliant dialogue and tight editing.
- Fits the ${time} constraint while offering profound emotional impact.

[RECOMMENDATION 3]
[TITLE] VELVET HORIZON
[METADATA] Year: 1984 | Director: Julian Croft | Runtime: 104 mins
[TAGLINE] "The desert remembers what the city forgets."
[CONTENT]
### Curation Synopsis
A sun-drenched, slow-burn thriller following a drifter caught in a conspiracy across the American Southwest.

### Why It Fits
- Pure ${era} aesthetics with an incredible analog synth score.
- Satisfies the ${genre} requirement without falling into tropes.`;

    try {
      for (const word of mock.split(" ")) {
        if (req.destroyed) break;
        res.write(`data: ${JSON.stringify({ text: word + " " })}\n\n`);
        await new Promise((r) => setTimeout(r, 30));
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(keepAlive);
    }
    return;
  }

  // ── Real Mode — model fallback chain using unified @google/genai SDK ────────
  const userPrompt = buildUserPrompt({ mood, time, genre, era, visual, pacing });
  console.log("Incoming request selections:", req.body);
  console.log("Generated userPrompt length:", userPrompt.length);
  console.log("Full prompt details:\n", userPrompt);
  let lastError = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    if (req.destroyed) break;

    try {
      console.log(`🎬  Trying model: ${modelName}`);

      const responseStream = await aiClient.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents: "Hello, recommend one movie name. Just the name.",
      });

      for await (const chunk of responseStream) {
        if (req.destroyed) break;
        if (chunk.text) {
          console.log(`Writing chunk: "${chunk.text.substring(0, 30)}..."`);
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        } else {
          console.log("Empty chunk or no text property");
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
      clearInterval(keepAlive);
      console.log(`✅  Streamed successfully via ${modelName}`);
      return;
    } catch (error) {
      lastError = error;
      const is429 =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("Quota exceeded");

      if (is429) {
        console.warn(`⚠️  ${modelName} quota exhausted — trying next model…`);
        continue;
      }
      break; // Non-429: bail out immediately
    }
  }

  // All models failed
  clearInterval(keepAlive);
  if (!res.destroyed) {
    const msg =
      lastError?.message ||
      "All AI models are currently quota-limited. Please try again in a few minutes.";
    console.log("All fallbacks failed:", msg);
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

// SPA catch-all — serve index.html for any non-API route
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀  CineMatch Server running on port ${PORT}`);
});
