/**
 * Static file serving for production mode.
 * This module has no dependencies on vite.
 */

import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Serve static files in production mode.
 */
export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `[Static] Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  } else {
    console.log(`[Static] Serving static files from: ${distPath}`);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
