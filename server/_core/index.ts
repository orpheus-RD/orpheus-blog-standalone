/**
 * Server Entry Point
 * 
 * Express server with tRPC API, CORS support, and static file serving.
 * Optimized for deployment on Render.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { config, validateConfig } from "./config";

async function startServer() {
  // Validate configuration
  const { valid, errors } = validateConfig();
  if (!valid) {
    console.error("[Config] Configuration errors:");
    errors.forEach(err => console.error(`  - ${err}`));
    if (config.isProduction) {
      process.exit(1);
    } else {
      console.warn("[Config] Continuing in development mode despite errors...");
    }
  }

  const app = express();
  const server = createServer(app);

  // Trust proxy for Render deployment (needed for secure cookies)
  app.set("trust proxy", 1);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS configuration for cross-origin requests
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // In development, allow all origins
      if (config.isDevelopment) {
        callback(null, true);
        return;
      }

      // In production, check against allowed origins
      const allowedOrigins = config.server.corsOrigins;
      if (allowedOrigins.length === 0) {
        // If no origins configured, allow all (not recommended for production)
        console.warn("[CORS] No origins configured, allowing all");
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));

  // Health check endpoint for Render
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes (login/logout)
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path }) => {
        console.error(`[tRPC] Error in ${path}:`, error.message);
      },
    })
  );

  // In development mode, use Vite for HMR
  // In production mode, serve static files
  if (config.isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment (Render sets this automatically)
  const port = config.server.port;

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Running on http://0.0.0.0:${port}/`);
    console.log(`[Server] Environment: ${config.server.nodeEnv}`);
    if (config.server.corsOrigins.length > 0) {
      console.log(`[Server] CORS origins: ${config.server.corsOrigins.join(", ")}`);
    }
  });
}

startServer().catch(error => {
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});
