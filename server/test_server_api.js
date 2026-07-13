import { spawn } from "child_process";
import http from "http";

console.log("Starting CineMatch server on port 3005...");
const serverProcess = spawn("node", ["index.js"], {
  env: { ...process.env, PORT: "3005" },
});

serverProcess.stdout.on("data", (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

serverProcess.stderr.on("data", (data) => {
  console.error(`[SERVER ERR] ${data.toString().trim()}`);
});

// Wait 2 seconds for server to start
setTimeout(() => {
  console.log("Sending request to server...");
  const postData = JSON.stringify({
    mood: "Slow burn",
    time: "Under 90 min",
    genre: "Drama",
    era: "Classic (Pre-80s)",
    visual: "Gritty & Raw",
    pacing: "Steady Tension",
  });

  const req = http.request(
    {
      hostname: "localhost",
      port: 3005,
      path: "/api/recommend",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    },
    (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        console.log(`[CLIENT RECEIVED CHUNK]:\n${chunk}`);
      });
      res.on("end", () => {
        console.log("No more data in response. Waiting 5s for server logs...");
        setTimeout(() => {
          serverProcess.kill();
          process.exit(0);
        }, 5000);
      });
    }
  );

  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
    serverProcess.kill();
    process.exit(1);
  });

  req.write(postData);
  req.end();
}, 2000);
