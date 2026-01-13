/**
 * Authentication Routes
 * 
 * Provides login/logout endpoints for the simplified auth system.
 * Replaces Manus OAuth with email/password based authentication.
 */

import type { Express, Request, Response } from "express";
import { config } from "./config";
import { loginWithPassword, createSessionToken } from "./auth";
import { getSessionCookieOptions } from "./cookies";

export function registerOAuthRoutes(app: Express) {
  /**
   * POST /api/auth/login
   * 
   * Login with email and password (for admin access)
   * Body: { email: string, password: string }
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const { user, sessionToken } = await loginWithPassword(email, password);

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(config.auth.sessionCookieName, sessionToken, {
        ...cookieOptions,
        maxAge: config.auth.sessionMaxAge,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ error: message });
    }
  });

  /**
   * POST /api/auth/logout
   * 
   * Clear session cookie
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(config.auth.sessionCookieName, {
      ...cookieOptions,
      maxAge: -1,
    });
    res.json({ success: true });
  });

  /**
   * GET /api/auth/check
   * 
   * Check if user is authenticated (for frontend)
   */
  app.get("/api/auth/check", (req: Request, res: Response) => {
    // This will be handled by tRPC auth.me, but provide a simple endpoint too
    res.json({ authenticated: false, message: "Use /api/trpc/auth.me instead" });
  });

  // =========================================================================
  // Legacy OAuth callback (for backward compatibility during migration)
  // =========================================================================
  
  /**
   * GET /api/oauth/callback
   * 
   * Legacy OAuth callback - redirects to home with error message
   * This endpoint is kept for backward compatibility but no longer functional
   */
  app.get("/api/oauth/callback", (req: Request, res: Response) => {
    console.warn("[Auth] Legacy OAuth callback accessed - OAuth is no longer supported");
    res.redirect("/?error=oauth_not_supported");
  });
}
