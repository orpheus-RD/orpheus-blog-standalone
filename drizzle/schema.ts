import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Photography - 摄影作品表
 */
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  camera: varchar("camera", { length: 100 }),
  lens: varchar("lens", { length: 100 }),
  settings: varchar("settings", { length: 100 }),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array stored as text
  featured: boolean("featured").default(false),
  sortOrder: int("sortOrder").default(0),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

/**
 * Magazine Essays - 杂志随笔表
 */
export const essays = mysqlTable("essays", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  coverImageKey: varchar("coverImageKey", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array stored as text
  readTime: int("readTime"), // in minutes
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Essay = typeof essays.$inferSelect;
export type InsertEssay = typeof essays.$inferInsert;

/**
 * Academic Papers - 学术论文表
 */
export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  authors: text("authors").notNull(), // JSON array stored as text
  abstract: text("abstract"),
  journal: varchar("journal", { length: 255 }),
  year: int("year"),
  volume: varchar("volume", { length: 50 }),
  issue: varchar("issue", { length: 50 }),
  pages: varchar("pages", { length: 50 }),
  doi: varchar("doi", { length: 255 }),
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array stored as text
  citations: int("citations").default(0),
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

/**
 * Site Settings - 网站设置表
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
