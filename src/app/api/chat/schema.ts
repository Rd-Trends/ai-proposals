import { z } from "zod";
import { PROPOSAL_TONE } from "@/lib/db";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(30000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(partSchema),
  }),
  tone: z.enum(PROPOSAL_TONE),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
