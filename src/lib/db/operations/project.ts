import { and, count, desc, eq } from "drizzle-orm";
import {
  type NewProject,
  type Project,
  projects,
} from "@/lib/db/schema/projects";
import type { PaginatedResult, PaginationParams } from "@/lib/types";
import { db } from "../drizzle";
import { calculateTotalPages, getPaginationOffset } from "./util";

// Create a new project
export async function createProject(projectData: NewProject): Promise<Project> {
  const [project] = await db.insert(projects).values(projectData).returning();
  return project;
}

// Get project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project || null;
}

// Get projects by user ID with pagination
export async function getProjectsByUserId(
  userId: string,
  params?: PaginationParams
): Promise<PaginatedResult<Project>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const offset = getPaginationOffset(page, pageSize);

  const conditions = [eq(projects.userId, userId)];

  const sq = db
    .select({ id: projects.id })
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.updatedAt))
    .limit(pageSize)
    .offset(offset)
    .as("subquery");

  const userProjects = await db
    .select()
    .from(projects)
    .innerJoin(sq, eq(projects.id, sq.id))
    .orderBy(desc(projects.updatedAt));

  const [totalResult] = await db
    .select({ total: count() })
    .from(projects)
    .where(and(...conditions));

  const total = totalResult?.total ?? 0;
  const totalPages = calculateTotalPages(total, pageSize);

  return {
    data: userProjects.map((row) => row.projects),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Update project
export async function updateProject(
  id: string,
  projectData: Partial<NewProject>
): Promise<Project> {
  const [project] = await db
    .update(projects)
    .set({ ...projectData, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return project;
}

// Delete project
export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}
