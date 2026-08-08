import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // BookCart live API ping / proxy endpoint
  app.get("/api/bookcart-status", async (_req, res) => {
    try {
      const startTime = Date.now();
      const response = await fetch("https://bookcart.azurewebsites.net/api/Book", {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      const latency = Date.now() - startTime;
      if (response.ok) {
        const books = await response.json();
        res.json({
          online: true,
          status: response.status,
          latencyMs: latency,
          bookCount: Array.isArray(books) ? books.length : 0,
          targetUrl: "https://bookcart.azurewebsites.net/"
        });
      } else {
        res.json({
          online: false,
          status: response.status,
          latencyMs: latency,
          error: `HTTP error ${response.status}`,
          targetUrl: "https://bookcart.azurewebsites.net/"
        });
      }
    } catch (err: any) {
      res.json({
        online: false,
        status: 500,
        latencyMs: 0,
        error: err.message || "Failed to reach BookCart application",
        targetUrl: "https://bookcart.azurewebsites.net/"
      });
    }
  });

  // Proxy API requests to BookCart backend if needed
  app.all("/api/bookcart-proxy/*", async (req, res) => {
    try {
      const pathSuffix = req.params[0] || "";
      const targetUrl = `https://bookcart.azurewebsites.net/api/${pathSuffix}`;
      
      const headers: Record<string, string> = {
        "Content-Type": req.headers["content-type"] || "application/json",
      };
      if (req.headers.authorization) {
        headers["Authorization"] = req.headers.authorization as string;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const data = await response.json().catch(() => ({}));

      res.status(response.status).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Proxy request failed" });
    }
  });

  // AI Test Generation / Flakiness Diagnosis endpoint
  app.post("/api/ai-generate-test", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is missing in server environment."
        });
      }

      const { prompt, framework, pageObject } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are an expert QA Automation Lead specializing in Playwright (TypeScript) and Cypress (TypeScript) E2E testing for e-commerce apps like BookCart (https://bookcart.azurewebsites.net/).
Write robust, production-grade test code following strict QA guidelines:
- Page Object Model pattern
- Dynamic waits (no hardcoded sleep)
- Explicit visual, state, and API assertions
- User-facing and semantic selectors (data-testid, role, text, label)
- Isolated setup and teardown hooks

Format output cleanly as markdown code blocks with clear explanations.`;

      const userMessage = `Target Framework: ${framework || "Playwright (TypeScript)"}
Page Object Context: ${pageObject || "General Store Path"}
User Test Request: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      res.json({
        generatedCode: response.text,
        framework: framework || "Playwright"
      });
    } catch (err: any) {
      console.error("Gemini API generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate test code via Gemini" });
    }
  });

  // Vite development middleware or Production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BookCart E2E Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
