import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  // Notification endpoint - placeholder for future email/webhook integration
  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement email notification using SendGrid, Resend, or SMTP
      // For now, just log the notification
      console.log("[Notification]", input.title, input.content);
      return {
        success: true,
        message: "Notification logged (email service not configured)",
      } as const;
    }),
});
