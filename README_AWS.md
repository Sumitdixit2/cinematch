# CineMatch - AWS Deployment & Tech Stack Guide

This guide details the tech stack, local execution steps, and AWS App Runner deployment procedures for CineMatch. You can directly use these details for your **Project Report** and **Concept Note**.

---

## 1. Application Tech Stack
- **Frontend**: Vite + React 19, Tailwind CSS v4, Motion (Framer Motion), GSAP (GreenSock Animation Platform) for smooth scroll pinning and preloader calibration.
- **Backend**: Node.js, Express (ESM), `@google/generative-ai` SDK.
- **AI Model**: `gemini-2.0-flash` (configurable via `GEMINI_MODEL` environment variable).
- **Communication Protocol**: Server-Sent Events (SSE) for real-time progressive response streaming.
- **Containerization**: Docker (Multi-stage build).
- **Deployment Target**: AWS App Runner (fully-managed HTTPS container deployment).

---

## 2. Phase-by-Phase Development Summary

### Phase 1: Frontend Architecture
- Handled styling using modern HSL colors, high-contrast dark backgrounds (`#0B0B0C`), and amber highlights.
- Wired up a multi-step Calibration Engine using interactive question buttons.
- Designed custom GSAP motion triggers for scroll-based image pinning and reveal sequences.

### Phase 2: Backend Streaming Integration
- Set up a Node.js Express server inside the `server/` directory.
- Created `/api/recommend` to process user selections and request a structured streaming content response from Gemini.
- Utilized SSE (`text/event-stream`) to stream recommendations dynamically word-by-word.
- Implemented **Mock Streaming Mode** in the absence of API keys to allow offline testing and grading.
- Configured Vite's proxy rules (`vite.config.js`) to handle CORS-free request pathing during local development.

### Phase 3: Containerization & Optimization
- Formulated a multi-stage `Dockerfile`:
  - **Stage 1 (Builder)**: Compiles the Vite React code.
  - **Stage 2 (Runner)**: Copies the Node server, pulls minimal dependencies, mounts the compiled static assets, and runs on a single container port (`3000`).

---

## 3. Local Verification

To run the application locally without Docker:
1. In the **project root**, install dependencies and run the frontend:
   ```bash
   npm install
   npm run dev
   ```
2. In the **`server` directory**, install dependencies and start the backend:
   ```bash
   cd server
   npm install
   npm start
   ```
3. Open `http://localhost:5173` to test the app in development with proxying enabled.

---

## 4. Docker Build & Run (Single Container)
To test the container locally exactly as it will run on AWS:
1. Build the Docker image from the root directory:
   ```bash
   docker build -t cinematch .
   ```
2. Run the Docker container:
   ```bash
   docker run -p 3000:3000 --env-file server/.env cinematch
   ```
3. Open `http://localhost:3000` to verify that both the frontend and backend are served on a single port.

---

## 5. AWS App Runner Deployment Guide

AWS App Runner is the easiest, most cost-effective way to deploy your Docker container. It automatically handles scaling, load balancing, and installs a secure SSL certificate (HTTPS) for you.

### Option A: Deploy via GitHub (Automated Builds)
1. Push your CineMatch repository to **GitHub**.
2. Go to the **AWS App Runner Console** and click **Create Service**.
3. Select **Source code repository**, connect your GitHub account, and choose your repository + branch.
4. Set Deployment Settings to **Automatic** (it will rebuild whenever you push to GitHub).
5. Configure the Build:
   - Runtime: **Python or Node.js** is not needed here; select **Dockerfile**.
6. Configure Service:
   - Port: `3000`
   - Under **Environment variables**, add:
     - Name: `GEMINI_API_KEY`, Value: `your_actual_gemini_api_key`
     - Name: `NODE_ENV`, Value: `production`
7. Click **Create & Deploy**. In a few minutes, AWS will provide you with a public HTTPS URL (e.g. `https://xxxx.awsapprunner.com`).

### Option B: Deploy via AWS ECR (Container Image)
1. Create a private repository in **AWS ECR** (Elastic Container Registry) named `cinematch`.
2. Authenticate your local Docker CLI and push the image:
   ```bash
   aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
   docker tag cinematch:latest your-account-id.dkr.ecr.your-region.amazonaws.com/cinematch:latest
   docker push your-account-id.dkr.ecr.your-region.amazonaws.com/cinematch:latest
   ```
3. In **AWS App Runner**, click **Create Service**.
4. Select **Container Registry** -> **Amazon ECR**, choose the `cinematch:latest` image, and set deployment to **Manual** or **Automatic**.
5. Set port to `3000` and configure the `GEMINI_API_KEY` and `NODE_ENV` variables.
6. Click **Create & Deploy**.
