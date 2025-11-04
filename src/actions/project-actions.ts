"use server";

import { headers } from "next/headers";
import z from "zod";
import { auth } from "@/lib/auth";
import {
  insertProjectSchema,
  type NewProject,
  updateProjectSchema,
} from "@/lib/db";
import * as projectServices from "@/lib/db/operations/project";

const projectIdSchema = z
  .string()
  .min(1, "Project ID is required")
  .uuid("Invalid Project ID");

export const createProject = async (data: NewProject) => {
  try {
    // Validate and process the data as needed
    const validatedData = insertProjectSchema.parse(data);
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const project = await projectServices.createProject({
      ...validatedData,
      userId: session.user.id,
    });

    return { data: project, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error creating project:", error);
    return { data: null, error: "Failed to create project", success: false };
  }
};

export const updateProject = async (id: string, data: Partial<NewProject>) => {
  try {
    projectIdSchema.parse(id);
    // Validate and process the data as needed
    const validatedData = updateProjectSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing project to verify ownership
    const existingProject = await projectServices.getProjectById(id);
    if (!existingProject) {
      return { data: null, error: "Project not found", success: false };
    }

    if (existingProject.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    const project = await projectServices.updateProject(id, validatedData);

    return { data: project, error: null, success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error: error.errors.join(", "), success: false };
    }
    console.error("Error updating project:", error);
    return { data: null, error: "Failed to update project", success: false };
  }
};

export const deleteProject = async (id: string) => {
  try {
    projectIdSchema.parse(id);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Get the existing project to verify ownership
    const existingProject = await projectServices.getProjectById(id);
    if (!existingProject) {
      return { data: null, error: "Project not found", success: false };
    }

    if (existingProject.userId !== session.user.id) {
      return { data: null, error: "Unauthorized", success: false };
    }

    await projectServices.deleteProject(id);

    return { data: null, error: null, success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { data: null, error: "Failed to delete project", success: false };
  }
};
