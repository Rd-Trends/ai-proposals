import { and, count, desc, eq, sql } from "drizzle-orm";
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

// Get projects by user ID and category
export async function getProjectsByUserIdAndCategory(
  userId: string,
  category: string,
): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.category, category)))
    .orderBy(desc(projects.updatedAt));
}

// Get projects by user ID and type
export async function getProjectsByUserIdAndType(
  userId: string,
  type: "case_study" | "client_work" | "personal_project",
): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.type, type)))
    .orderBy(desc(projects.updatedAt));
}

// Search projects by title or description
export async function searchProjects(
  userId: string,
  query: string,
): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        sql`(
          ${projects.title} ILIKE ${`%${query}%`} OR 
          ${projects.summary} ILIKE ${`%${query}%`} OR 
          ${projects.description} ILIKE ${`%${query}%`}
        )`,
      ),
    )
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

// Get project statistics for a user
export async function getUserProjectStats(userId: string): Promise<{
  totalProjects: number;
  caseStudies: number;
  clientWork: number;
  personalProjects: number;
  completedProjects: number;
  projectsByCategory: Array<{ category: string; count: number }>;
}> {
  const [stats] = await db
    .select({
      totalProjects: count(),
      caseStudies: count(
        sql`CASE WHEN ${projects.type} = 'case_study' THEN 1 END`,
      ),
      clientWork: count(
        sql`CASE WHEN ${projects.type} = 'client_work' THEN 1 END`,
      ),
      personalProjects: count(
        sql`CASE WHEN ${projects.type} = 'personal_project' THEN 1 END`,
      ),
      completedProjects: count(
        sql`CASE WHEN ${projects.completedAt} IS NOT NULL THEN 1 END`,
      ),
    })
    .from(projects)
    .where(eq(projects.userId, userId));

  // Get projects by category
  const categoryStats = await db
    .select({
      category: projects.category,
      count: count(),
    })
    .from(projects)
    .where(
      and(eq(projects.userId, userId), sql`${projects.category} IS NOT NULL`),
    )
    .groupBy(projects.category);

  return {
    totalProjects: Number(stats.totalProjects) || 0,
    caseStudies: Number(stats.caseStudies) || 0,
    clientWork: Number(stats.clientWork) || 0,
    personalProjects: Number(stats.personalProjects) || 0,
    completedProjects: Number(stats.completedProjects) || 0,
    projectsByCategory: categoryStats.map((stat) => ({
      category: stat.category || "Uncategorized",
      count: Number(stat.count) || 0,
    })),
  };
}
