import { and, count, desc, eq, sql } from "drizzle-orm";
import {
  type InsertTemplate,
  type Template,
  templates,
} from "@/lib/db/schema/templates";
import type { PaginatedResult, PaginationParams } from "@/lib/types";
import { db } from "../drizzle";
import { calculateTotalPages, getPaginationOffset } from "./util";

// Create a new template
export async function createTemplate(
  templateData: InsertTemplate
): Promise<Template> {
  const [template] = await db
    .insert(templates)
    .values(templateData)
    .returning();
  return template;
}

// Get template by ID
export async function getTemplateById(id: string): Promise<Template | null> {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id));
  return template || null;
}

// Get templates by user ID with pagination
export async function getTemplatesByUserId(
  userId: string,
  params?: PaginationParams & { status?: "draft" | "active" | "archived" }
): Promise<PaginatedResult<Template>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const offset = getPaginationOffset(page, pageSize);

  const conditions = [eq(templates.userId, userId)];
  if (params?.status) {
    conditions.push(eq(templates.status, params.status));
  }

  const sq = db
    .select({ id: templates.id })
    .from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.updatedAt))
    .limit(pageSize)
    .offset(offset)
    .as("subquery");

  const userTemplates = await db
    .select()
    .from(templates)
    .innerJoin(sq, eq(templates.id, sq.id))
    .orderBy(desc(templates.updatedAt));

  const [totalResult] = await db
    .select({ total: count() })
    .from(templates)
    .where(and(...conditions));

  const total = totalResult?.total ?? 0;
  const totalPages = calculateTotalPages(total, pageSize);

  return {
    data: userTemplates.map((row) => row.templates),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Get favorite templates by user ID
export async function getFavoriteTemplatesByUserId(
  userId: string
): Promise<Template[]> {
  return await db
    .select()
    .from(templates)
    .where(and(eq(templates.userId, userId), eq(templates.isFavorite, true)))
    .orderBy(desc(templates.lastUsedAt));
}

// Update template
export async function updateTemplate(
  id: string,
  templateData: Partial<InsertTemplate>
): Promise<Template> {
  const [template] = await db
    .update(templates)
    .set({ ...templateData, updatedAt: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return template;
}

// Increment usage count
export async function incrementTemplateUsage(id: string): Promise<void> {
  await db
    .update(templates)
    .set({
      usageCount: sql`${templates.usageCount} + 1`,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id));
}

// Toggle favorite
export async function toggleTemplateFavorite(id: string): Promise<Template> {
  const template = await getTemplateById(id);
  if (!template) {
    throw new Error("Template not found");
  }

  const [updatedTemplate] = await db
    .update(templates)
    .set({
      isFavorite: !template.isFavorite,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id))
    .returning();

  return updatedTemplate;
}

// Delete template
export async function deleteTemplate(id: string): Promise<void> {
  await db.delete(templates).where(eq(templates.id, id));
}
