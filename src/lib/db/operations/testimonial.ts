import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { type NewTestimonial, type Testimonial, testimonials } from "../index";

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

// Get testimonials by user ID
export async function getTestimonialsByUserId(
  userId: string,
): Promise<Testimonial[]> {
  return await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.userId, userId))
    .orderBy(desc(testimonials.updatedAt));
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
