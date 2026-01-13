import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  photos, InsertPhoto, Photo,
  essays, InsertEssay, Essay,
  papers, InsertPaper, Paper,
  siteSettings, InsertSiteSetting
} from "../drizzle/schema";
import { config } from './_core/config';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && config.database.url) {
    try {
      _db = drizzle(config.database.url);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== User Operations ====================

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: { email: string; name?: string; role?: "user" | "admin" }): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate a unique openId for new users (for backward compatibility)
  const openId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const result = await db.insert(users).values({
    openId,
    email: user.email,
    name: user.name || null,
    role: user.role || "user",
    lastSignedIn: new Date(),
  });

  return { id: result[0].insertId };
}

export async function updateUserLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function updateUserRole(id: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Check if user should be admin based on ADMIN_EMAIL
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email && config.auth.adminEmail && 
               user.email.toLowerCase() === config.auth.adminEmail.toLowerCase()) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

// ==================== Photos ====================

export async function getAllPhotos(options?: { featured?: boolean; category?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(photos);
  
  const conditions = [];
  if (options?.featured !== undefined) {
    conditions.push(eq(photos.featured, options.featured));
  }
  if (options?.category) {
    conditions.push(eq(photos.category, options.category));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  query = query.orderBy(desc(photos.sortOrder), desc(photos.createdAt)) as typeof query;
  
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  
  return await query;
}

export async function getPhotoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(photos).values(photo);
  return { id: result[0].insertId };
}

export async function updatePhoto(id: number, photo: Partial<InsertPhoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(photos).set(photo).where(eq(photos.id, id));
  return { success: true };
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(photos).where(eq(photos.id, id));
  return { success: true };
}

// ==================== Essays ====================

export async function getAllEssays(options?: { published?: boolean; featured?: boolean; category?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(essays);
  
  const conditions = [];
  if (options?.published !== undefined) {
    conditions.push(eq(essays.published, options.published));
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(essays.featured, options.featured));
  }
  if (options?.category) {
    conditions.push(eq(essays.category, options.category));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  query = query.orderBy(desc(essays.publishedAt), desc(essays.createdAt)) as typeof query;
  
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  
  return await query;
}

export async function getEssayById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(essays).where(eq(essays.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEssay(essay: InsertEssay) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(essays).values(essay);
  return { id: result[0].insertId };
}

export async function updateEssay(id: number, essay: Partial<InsertEssay>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(essays).set(essay).where(eq(essays.id, id));
  return { success: true };
}

export async function deleteEssay(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(essays).where(eq(essays.id, id));
  return { success: true };
}

// ==================== Papers ====================

export async function getAllPapers(options?: { published?: boolean; featured?: boolean; category?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(papers);
  
  const conditions = [];
  if (options?.published !== undefined) {
    conditions.push(eq(papers.published, options.published));
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(papers.featured, options.featured));
  }
  if (options?.category) {
    conditions.push(eq(papers.category, options.category));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  query = query.orderBy(desc(papers.year), desc(papers.createdAt)) as typeof query;
  
  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }
  
  return await query;
}

export async function getPaperById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPaper(paper: InsertPaper) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(papers).values(paper);
  return { id: result[0].insertId };
}

export async function updatePaper(id: number, paper: Partial<InsertPaper>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(papers).set(paper).where(eq(papers.id, id));
  return { success: true };
}

export async function deletePaper(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(papers).where(eq(papers.id, id));
  return { success: true };
}

// ==================== Search ====================

export async function searchContent(query: string, type?: 'photos' | 'essays' | 'papers') {
  const db = await getDb();
  if (!db) return { photos: [], essays: [], papers: [] };
  
  const searchTerm = `%${query}%`;
  
  const results: { photos: Photo[]; essays: Essay[]; papers: Paper[] } = {
    photos: [],
    essays: [],
    papers: [],
  };
  
  if (!type || type === 'photos') {
    results.photos = await db.select().from(photos).where(
      or(
        like(photos.title, searchTerm),
        like(photos.description, searchTerm),
        like(photos.location, searchTerm),
        like(photos.tags, searchTerm)
      )
    ).orderBy(desc(photos.createdAt)).limit(20);
  }
  
  if (!type || type === 'essays') {
    results.essays = await db.select().from(essays).where(
      and(
        eq(essays.published, true),
        or(
          like(essays.title, searchTerm),
          like(essays.subtitle, searchTerm),
          like(essays.excerpt, searchTerm),
          like(essays.tags, searchTerm)
        )
      )
    ).orderBy(desc(essays.publishedAt)).limit(20);
  }
  
  if (!type || type === 'papers') {
    results.papers = await db.select().from(papers).where(
      and(
        eq(papers.published, true),
        or(
          like(papers.title, searchTerm),
          like(papers.abstract, searchTerm),
          like(papers.authors, searchTerm),
          like(papers.tags, searchTerm)
        )
      )
    ).orderBy(desc(papers.year)).limit(20);
  }
  
  return results;
}

// ==================== Site Settings ====================

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : undefined;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({
    set: { value },
  });
  return { success: true };
}
