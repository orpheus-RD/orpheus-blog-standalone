import { config } from "./_core/config";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut, isStorageConfigured } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(config.auth.sessionCookieName, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== Photos API ====================
  photos: router({
    list: publicProcedure
      .input(z.object({
        featured: z.boolean().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllPhotos(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPhotoById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        camera: z.string().optional(),
        lens: z.string().optional(),
        settings: z.string().optional(),
        imageUrl: z.string(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPhoto(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        camera: z.string().optional(),
        lens: z.string().optional(),
        settings: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        featured: z.boolean().optional(),
        sortOrder: z.number().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePhoto(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePhoto(input.id);
      }),
  }),

  // ==================== Essays API ====================
  essays: router({
    list: publicProcedure
      .input(z.object({
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // For public access, only show published essays
        return await db.getAllEssays({ ...input, published: true });
      }),

    listAll: adminProcedure
      .input(z.object({
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Admin can see all essays including drafts
        return await db.getAllEssays(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEssayById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string(),
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        readTime: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createEssay(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        coverImageUrl: z.string().optional(),
        coverImageKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        readTime: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateEssay(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteEssay(input.id);
      }),
  }),

  // ==================== Papers API ====================
  papers: router({
    list: publicProcedure
      .input(z.object({
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // For public access, only show published papers
        return await db.getAllPapers({ ...input, published: true });
      }),

    listAll: adminProcedure
      .input(z.object({
        published: z.boolean().optional(),
        featured: z.boolean().optional(),
        category: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Admin can see all papers including drafts
        return await db.getAllPapers(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaperById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        authors: z.string(),
        abstract: z.string().optional(),
        journal: z.string().optional(),
        year: z.number().optional(),
        volume: z.string().optional(),
        issue: z.string().optional(),
        pages: z.string().optional(),
        doi: z.string().optional(),
        pdfUrl: z.string().optional(),
        pdfKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        citations: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPaper(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        authors: z.string().optional(),
        abstract: z.string().optional(),
        journal: z.string().optional(),
        year: z.number().optional(),
        volume: z.string().optional(),
        issue: z.string().optional(),
        pages: z.string().optional(),
        doi: z.string().optional(),
        pdfUrl: z.string().optional(),
        pdfKey: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        citations: z.number().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePaper(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePaper(input.id);
      }),
  }),

  // ==================== Search API ====================
  search: router({
    query: publicProcedure
      .input(z.object({
        q: z.string(),
        type: z.enum(['photos', 'essays', 'papers']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchContent(input.q, input.type);
      }),
  }),

  // ==================== Backgrounds API ====================
  backgrounds: router({
    list: publicProcedure
      .input(z.object({
        active: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // For public access, only show active backgrounds
        return await db.getAllBackgrounds({ ...input, active: true });
      }),

    listAll: adminProcedure
      .input(z.object({
        active: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Admin can see all backgrounds
        return await db.getAllBackgrounds(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBackgroundById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string().optional(),
        imageUrl: z.string(),
        imageKey: z.string().optional(),
        active: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createBackground(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        active: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateBackground(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteBackground(input.id);
      }),
  }),

  // ==================== Upload API ====================
  upload: router({
    image: adminProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        base64Data: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!isStorageConfigured()) {
          throw new Error("Storage service is not configured");
        }
        const { filename, contentType, base64Data } = input;
        const buffer = Buffer.from(base64Data, 'base64');
        const fileKey = `images/${nanoid()}-${filename}`;
        const { url } = await storagePut(fileKey, buffer, contentType);
        return { url, key: fileKey };
      }),

    pdf: adminProcedure
      .input(z.object({
        filename: z.string(),
        base64Data: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!isStorageConfigured()) {
          throw new Error("Storage service is not configured");
        }
        const { filename, base64Data } = input;
        const buffer = Buffer.from(base64Data, 'base64');
        const fileKey = `pdfs/${nanoid()}-${filename}`;
        const { url } = await storagePut(fileKey, buffer, 'application/pdf');
        return { url, key: fileKey };
      }),
  }),
});

export type AppRouter = typeof appRouter;
