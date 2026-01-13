import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module with all required functions
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getPhotos: vi.fn().mockResolvedValue([]),
  getEssays: vi.fn().mockResolvedValue([]),
  getPapers: vi.fn().mockResolvedValue([]),
  getAllPhotos: vi.fn().mockResolvedValue([]),
  getAllEssays: vi.fn().mockResolvedValue([]),
  getAllPapers: vi.fn().mockResolvedValue([]),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("photos router", () => {
  it("photos.list returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.photos.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("essays router", () => {
  it("essays.list returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.essays.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("papers router", () => {
  it("papers.list returns an array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.papers.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth router", () => {
  it("auth.me returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.me();
    
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user");
    expect(result?.role).toBe("admin");
  });

  it("auth.logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.auth.logout();
    
    expect(result).toEqual({ success: true });
  });
});
