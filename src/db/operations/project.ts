import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { type NewProject, type Project, projects } from "../index";

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

// Get projects by user ID
export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
}

// Update project
export async function updateProject(
  id: string,
  projectData: Partial<NewProject>,
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
