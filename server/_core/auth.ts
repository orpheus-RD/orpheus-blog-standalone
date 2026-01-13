/**
 * Authentication Service
 * 
 * Provides JWT-based authentication without Manus OAuth dependency.
 * Supports email/password login and optional third-party OAuth.
 * Supports both cookie-based and header-based token authentication.
 */

import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { config } from "./config";
import * as db from "../db";
import type { User } from "../../drizzle/schema";
import { ForbiddenError, UnauthorizedError } from "@shared/_core/errors";

// ============================================================================
// Types
// ============================================================================

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
};

export type AuthResult = {
  user: User;
  sessionToken: string;
};

// ============================================================================
// JWT Utilities
// ============================================================================

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(config.auth.jwtSecret);
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(
  payload: SessionPayload,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const expiresInMs = options.expiresInMs ?? config.auth.sessionMaxAge;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expirationSeconds)
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    const { userId, email, role } = payload as Record<string, unknown>;

    if (
      typeof userId !== "number" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      console.warn("[Auth] Invalid session payload structure");
      return null;
    }

    return { userId, email, role };
  } catch (error) {
    console.warn("[Auth] Session verification failed:", String(error));
    return null;
  }
}

// ============================================================================
// Cookie Utilities
// ============================================================================

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) {
    return new Map();
  }
  const parsed = parseCookieHeader(cookieHeader);
  return new Map(Object.entries(parsed));
}

export function getSessionCookie(req: Request): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  return cookies.get(config.auth.sessionCookieName);
}

/**
 * Get session token from request (cookie or Authorization header)
 * Supports both cookie-based and header-based authentication for cross-domain scenarios
 */
export function getSessionToken(req: Request): string | undefined {
  // First try to get from cookie
  const cookieToken = getSessionCookie(req);
  if (cookieToken) {
    return cookieToken;
  }

  // Then try Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return undefined;
}

// ============================================================================
// Authentication Methods
// ============================================================================

/**
 * Authenticate a request using the session cookie or Authorization header
 */
export async function authenticateRequest(req: Request): Promise<User> {
  const sessionToken = getSessionToken(req);
  const session = await verifySessionToken(sessionToken);

  if (!session) {
    throw UnauthorizedError("Invalid or expired session");
  }

  const user = await db.getUserById(session.userId);

  if (!user) {
    throw UnauthorizedError("User not found");
  }

  // Update last signed in time
  await db.updateUserLastSignedIn(user.id);

  return user;
}

/**
 * Login with email - creates or updates user and returns session token
 * For simple deployments, this can be used with a magic link or password
 */
export async function loginWithEmail(email: string): Promise<AuthResult> {
  // Check if user exists
  let user = await db.getUserByEmail(email);

  if (!user) {
    // Create new user
    const isAdmin = email.toLowerCase() === config.auth.adminEmail.toLowerCase();
    const result = await db.createUser({
      email,
      name: email.split("@")[0],
      role: isAdmin ? "admin" : "user",
    });
    user = await db.getUserById(result.id);
    if (!user) {
      throw new Error("Failed to create user");
    }
  }

  // Check if user should be admin based on ADMIN_EMAIL
  if (
    config.auth.adminEmail &&
    email.toLowerCase() === config.auth.adminEmail.toLowerCase() &&
    user.role !== "admin"
  ) {
    await db.updateUserRole(user.id, "admin");
    user = { ...user, role: "admin" };
  }

  // Create session token
  const sessionToken = await createSessionToken({
    userId: user.id,
    email: user.email || "",
    role: user.role,
  });

  return { user, sessionToken };
}

/**
 * Simple password-based login (for admin access)
 * In production, use proper password hashing with bcrypt
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  // For demo purposes, check against ADMIN_EMAIL and a simple password
  // In production, implement proper password hashing
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw ForbiddenError("Password login not configured");
  }

  if (
    email.toLowerCase() !== config.auth.adminEmail.toLowerCase() ||
    password !== adminPassword
  ) {
    throw UnauthorizedError("Invalid email or password");
  }

  return loginWithEmail(email);
}

// ============================================================================
// Authorization Helpers
// ============================================================================

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

/**
 * Require admin role
 */
export function requireAdmin(user: User | null): asserts user is User {
  if (!user) {
    throw UnauthorizedError("Authentication required");
  }
  if (user.role !== "admin") {
    throw ForbiddenError("Admin access required");
  }
}
