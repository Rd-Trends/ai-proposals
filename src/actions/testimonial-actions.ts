"use server";

import { headers } from "next/headers";
import z from "zod";
import {
  insertTestimonialSchema,
  type NewTestimonial,
  updateTestimonialSchema,
} from "@/db";
import * as testimonialServices from "@/db/operations/testimonial";
import { auth } from "@/lib/auth";

export const createTestimonial = async (data: NewTestimonial) => {
  try {
    const validatedData = insertTestimonialSchema.parse(data);
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const testimonial = await testimonialServices.createTestimonial({
      ...validatedData,
      userId: session.user.id,
    });

    return { data: testimonial, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error creating testimonial:", error);
    return {
      data: null,
      error: "Failed to create testimonial",
      success: false,
    };
  }
};

export const updateTestimonial = async (
  id: string,
  data: Partial<NewTestimonial>,
) => {
  try {
    const validatedData = updateTestimonialSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing testimonial to verify ownership
    const existingTestimonial =
      await testimonialServices.getTestimonialById(id);
    if (!existingTestimonial) {
      return { data: null, error: "Testimonial not found", success: false };
    }

    if (existingTestimonial.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    const testimonial = await testimonialServices.updateTestimonial(
      id,
      validatedData,
    );

    return { data: testimonial, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error updating testimonial:", error);
    return {
      data: null,
      error: "Failed to update testimonial",
      success: false,
    };
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing testimonial to verify ownership
    const existingTestimonial =
      await testimonialServices.getTestimonialById(id);
    if (!existingTestimonial) {
      return { data: null, error: "Testimonial not found", success: false };
    }

    if (existingTestimonial.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    await testimonialServices.deleteTestimonial(id);

    return { data: null, error: null, success: true };
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return {
      data: null,
      error: "Failed to delete testimonial",
      success: false,
    };
  }
};
