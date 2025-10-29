import { and, count, desc, eq } from "drizzle-orm";
import type { PaginatedResult, PaginationParams } from "@/lib/types";
import { db } from "../drizzle";
import { type NewTestimonial, type Testimonial, testimonials } from "../index";
import { calculateTotalPages, getPaginationOffset } from "./util";

// Create a new testimonial
export async function createTestimonial(
  testimonialData: NewTestimonial,
): Promise<Testimonial> {
  const [testimonial] = await db
    .insert(testimonials)
    .values(testimonialData)
    .returning();
  return testimonial;
}

// Get testimonial by ID
export async function getTestimonialById(
  id: string,
): Promise<Testimonial | null> {
  const [testimonial] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id));
  return testimonial || null;
}

// Get testimonials by user ID with pagination
export async function getTestimonialsByUserId(
  userId: string,
  params?: PaginationParams,
): Promise<PaginatedResult<Testimonial>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const offset = getPaginationOffset(page, pageSize);

  const conditions = [eq(testimonials.userId, userId)];

  const sq = db
    .select({ id: testimonials.id })
    .from(testimonials)
    .where(and(...conditions))
    .orderBy(desc(testimonials.updatedAt))
    .limit(pageSize)
    .offset(offset)
    .as("subquery");

  const userTestimonials = await db
    .select()
    .from(testimonials)
    .innerJoin(sq, eq(testimonials.id, sq.id))
    .orderBy(desc(testimonials.updatedAt));

  const [totalResult] = await db
    .select({ total: count() })
    .from(testimonials)
    .where(and(...conditions));

  const total = totalResult?.total ?? 0;
  const totalPages = calculateTotalPages(total, pageSize);

  return {
    data: userTestimonials.map((row) => row.testimonials),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Update testimonial
export async function updateTestimonial(
  id: string,
  testimonialData: Partial<NewTestimonial>,
): Promise<Testimonial> {
  const [testimonial] = await db
    .update(testimonials)
    .set({ ...testimonialData, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();
  return testimonial;
}

// Delete testimonial
export async function deleteTestimonial(id: string): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
