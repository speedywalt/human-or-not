import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

const saveInput = z.object({
  promptIndex: z.number().int().min(0).max(200),
  image: z.string().min(32).max(120_000).startsWith("data:image/jpeg"),
});

const pickInput = z.object({
  promptIndex: z.number().int().min(0).max(200),
  notImage: z.string().max(120_000),
});

const getInput = z.object({
  id: z.number().int().positive(),
});

export const saveDrawing = createServerFn({ method: "POST" })
  .validator(saveInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(
      `insert into drawings (prompt_index, image, final)
       select $1, $2, true
       where not exists (
         select 1 from drawings where prompt_index = $1 and image = $2
       )`,
      [data.promptIndex, data.image],
    );
    await sql.query(
      `update drawings set final = true where prompt_index = $1 and image = $2`,
      [data.promptIndex, data.image],
    );
    await sql.query(
      `delete from drawings
       where prompt_index = $1
         and id not in (
           select id from drawings where prompt_index = $1 order by id desc limit 40
         )`,
      [data.promptIndex],
    );
    return { ok: true };
  });

export const pickDrawing = createServerFn({ method: "POST" })
  .validator(pickInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: number }>(
      `select id from drawings
       where prompt_index = $1 and image <> $2 and final = true
       order by random()
       limit 1`,
      [data.promptIndex, data.notImage],
    );
    return rows[0] ?? null;
  });

export const getDrawing = createServerFn({ method: "POST" })
  .validator(getInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: number; image: string }>(
      `select id, image from drawings where id = $1`,
      [data.id],
    );
    return rows[0] ?? null;
  });
