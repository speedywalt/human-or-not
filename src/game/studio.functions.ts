import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { PROMPT_LIST } from "@/game/sketches";

const STUDIO_CAP = 12;
const NIGHT_MS = 3 * 60 * 60 * 1000;

const promptInput = z.object({
  promptIndex: z.number().int().min(0).max(PROMPT_LIST.length - 1),
});

async function activePass(userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ expires_at: string }>(
    `select expires_at from passes where user_id = $1`,
    [userId],
  );
  const expiresAt = rows[0]?.expires_at ?? null;
  const active = !!expiresAt && new Date(expiresAt).getTime() > Date.now();
  return { active, expiresAt };
}

export const passStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const pass = await activePass(context.userId);
    return { ...pass, payments: false as const };
  });

export const unlockStudio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const expires = new Date(Date.now() + NIGHT_MS).toISOString();
    await sql.query(
      `insert into passes (user_id, expires_at) values ($1, $2)
       on conflict (user_id) do update set expires_at = excluded.expires_at`,
      [context.userId, expires],
    );
    return { active: true, expiresAt: expires, test: true as const };
  });

export const studioDrawing = createServerFn({ method: "POST" })
  .validator(promptInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const pass = await activePass(context.userId);
    if (!pass.active) return { ok: false as const, error: "Unlock a Studio night first." };

    const sql = await getSql();
    const cached = await sql.query<{ image: string }>(
      `select image from studio_images where prompt_index = $1`,
      [data.promptIndex],
    );
    if (cached[0]?.image) return { ok: true as const, image: cached[0].image };

    const counts = await sql.query<{ n: number }>(`select count(*) as n from studio_images`);
    if ((counts[0]?.n ?? 0) >= STUDIO_CAP) {
      return { ok: false as const, error: "Studio is resting. This prompt has no saved drawing yet." };
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available." };

    const subject = PROMPT_LIST[data.promptIndex]?.text ?? "a strange animal";
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine-image",
        n: 1,
        response_format: "b64_json",
        prompt: `A rough white pencil doodle on a pure black background, drawn with a computer mouse in one minute. Subject: ${subject}. It must be recognizable. Uneven lines, slightly wrong proportions, no color, no shading, no text, no frame.`,
      }),
    });
    if (!res.ok) return { ok: false as const, error: "The AI drawing failed." };

    const body = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = body.data?.[0]?.b64_json;
    if (!b64) return { ok: false as const, error: "The AI drawing came back empty." };
    const image = `data:image/jpeg;base64,${b64}`;
    await sql.query(
      `insert into studio_images (prompt_index, image) values ($1, $2)
       on conflict (prompt_index) do nothing`,
      [data.promptIndex, image],
    );
    return { ok: true as const, image };
  });
