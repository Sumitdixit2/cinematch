import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const aiClient = new GoogleGenAI({ apiKey });

async function retryWithBackoff(fn, maxAttempts = 3, baseDelayMs = 3000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.log("Error in retry attempt:", attempt, err.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, baseDelayMs));
      } else {
        throw err;
      }
    }
  }
}

async function run() {
  try {
    const responseStream = await retryWithBackoff(
      () => aiClient.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents: "Hello, recommend one movie name. Just the name.",
      }),
      3,
      3000
    );

    console.log("responseStream direct properties:", Object.getOwnPropertyNames(responseStream || {}));

    let count = 0;
    for await (const chunk of responseStream) {
      count++;
      console.log(`Chunk ${count}:`, chunk.text);
    }
  } catch (err) {
    console.error("Error in stream:", err);
  }
}

run();
