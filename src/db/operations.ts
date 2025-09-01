import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  type InsertTemplate,
  type NewProposalTracking,
  type NewUser,
  type ProposalTracking,
  proposalTracking,
  type Template,
  templates,
  type User,
  users,
} from "./index";

// User operations
export const userOperations = {
  // Create a new user
  async create(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },

  // Update user
  async update(id: string, userData: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },
};

// Template operations
export const templateOperations = {
  // Create a new template
  async create(templateData: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(templateData)
      .returning();
    return template;
  },

  // Get template by ID
  async getById(id: string): Promise<Template | null> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template || null;
  },

  // Get templates by user ID
  async getByUserId(
    userId: string,
    status?: "draft" | "active" | "archived",
  ): Promise<Template[]> {
    const conditions = [eq(templates.userId, userId)];
    if (status) {
      conditions.push(eq(templates.status, status));
    }

    return await db
      .select()
      .from(templates)
      .where(and(...conditions))
      .orderBy(desc(templates.updatedAt));
  },

  // Get favorite templates by user ID
  async getFavoritesByUserId(userId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(and(eq(templates.userId, userId), eq(templates.isFavorite, true)))
      .orderBy(desc(templates.lastUsedAt));
  },

  // Update template
  async update(
    id: string,
    templateData: Partial<InsertTemplate>,
  ): Promise<Template> {
    const [template] = await db
      .update(templates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return template;
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id));
  },

  // Toggle favorite
  async toggleFavorite(id: string): Promise<Template> {
    const template = await this.getById(id);
    if (!template) throw new Error("Template not found");

    const [updatedTemplate] = await db
      .update(templates)
      .set({
        isFavorite: !template.isFavorite,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id))
      .returning();

    return updatedTemplate;
  },

  // Delete template
  async delete(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  },
};

// Proposal tracking operations
export const proposalTrackingOperations = {
  // Create a new proposal tracking entry
  async create(proposalData: NewProposalTracking): Promise<ProposalTracking> {
    const [proposal] = await db
      .insert(proposalTracking)
      .values(proposalData)
      .returning();
    return proposal;
  },

  // Get proposal by ID
  async getById(id: string): Promise<ProposalTracking | null> {
    const [proposal] = await db
      .select()
      .from(proposalTracking)
      .where(eq(proposalTracking.id, id));
    return proposal || null;
  },

  // Get proposals by user ID
  async getByUserId(userId: string): Promise<ProposalTracking[]> {
    return await db
      .select()
      .from(proposalTracking)
      .where(eq(proposalTracking.userId, userId))
      .orderBy(desc(proposalTracking.sentAt));
  },

  // Update
  async update(
    id: string,
    data: Partial<ProposalTracking>,
  ): Promise<ProposalTracking> {
    const [proposal] = await db
      .update(proposalTracking)
      .set(data)
      .where(eq(proposalTracking.id, id))
      .returning();

    return proposal;
  },

  // Update proposal with notes
  async addNotes(id: string, notes: string): Promise<ProposalTracking> {
    const [proposal] = await db
      .update(proposalTracking)
      .set({
        notes,
        updatedAt: new Date(),
      })
      .where(eq(proposalTracking.id, id))
      .returning();

    return proposal;
  },

  // Delete proposal tracking entry
  async delete(id: string): Promise<void> {
    await db.delete(proposalTracking).where(eq(proposalTracking.id, id));
  },
};

export const analyticsOperations = {
  // Get user proposal summary statistics
  async getUserProposalStats(
    userId: string,
    days: number = 30,
  ): Promise<{
    totalProposals: number;
    proposalsViewed: number;
    clientResponses: number;
    interviews: number;
    jobsAwarded: number;
    successRate: number;
    responseRate: number;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [result] = await db
      .select({
        totalProposals: count(),
        proposalsViewed: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('proposal_viewed', 'client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
        clientResponses: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
        interviews: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('interviewed', 'job_awarded') THEN 1 END`,
        ),
        jobsAwarded: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`,
        ),
      })
      .from(proposalTracking)
      .where(
        and(
          eq(proposalTracking.userId, userId),
          sql`${proposalTracking.sentAt} >= ${since}`,
        ),
      );

    const total = Number(result.totalProposals) || 0;
    const awarded = Number(result.jobsAwarded) || 0;
    const responses = Number(result.clientResponses) || 0;

    return {
      totalProposals: total,
      proposalsViewed: Number(result.proposalsViewed) || 0,
      clientResponses: responses,
      interviews: Number(result.interviews) || 0,
      jobsAwarded: awarded,
      successRate: total > 0 ? Math.round((awarded / total) * 100) : 0,
      responseRate: total > 0 ? Math.round((responses / total) * 100) : 0,
    };
  },

  // Get template success statistics
  async getTemplateStats(
    templateId: string,
    days: number = 30,
  ): Promise<{
    usageCount: number;
    lastUsed: Date | null;
    successRate: number;
    responseRate: number;
    avgResponseTime: number | null;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [result] = await db
      .select({
        usageCount: count(),
        lastUsed: sql<Date | null>`MAX(${proposalTracking.sentAt})`,
        jobsAwarded: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`,
        ),
        clientResponses: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
        avgResponseTime: sql<number | null>`
          AVG(
            CASE 
              WHEN ${proposalTracking.respondedAt} IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (${proposalTracking.respondedAt} - ${proposalTracking.sentAt})) / 3600
            END
          )
        `,
      })
      .from(proposalTracking)
      .where(
        and(
          eq(proposalTracking.templateId, templateId),
          sql`${proposalTracking.sentAt} >= ${since}`,
        ),
      );

    const total = Number(result.usageCount) || 0;
    const awarded = Number(result.jobsAwarded) || 0;
    const responses = Number(result.clientResponses) || 0;

    return {
      usageCount: total,
      lastUsed: result.lastUsed,
      successRate: total > 0 ? Math.round((awarded / total) * 100) : 0,
      responseRate: total > 0 ? Math.round((responses / total) * 100) : 0,
      avgResponseTime: result.avgResponseTime
        ? Number(result.avgResponseTime)
        : null,
    };
  },

  // Get user templates statistics
  async getUserTemplateStats(userId: string): Promise<{
    totalTemplates: number;
    activeTemplates: number;
    favoriteTemplates: number;
    totalUsage: number;
    recentUsage: number;
    averageSuccessRate: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [templateStats, proposalStats] = await Promise.all([
      // Get template counts and total usage
      db
        .select({
          totalTemplates: count(),
          activeTemplates: count(
            sql`CASE WHEN ${templates.status} = 'active' THEN 1 END`,
          ),
          favoriteTemplates: count(
            sql`CASE WHEN ${templates.isFavorite} = true THEN 1 END`,
          ),
          totalUsage: sql<number>`COALESCE(SUM(${templates.usageCount}), 0)`,
        })
        .from(templates)
        .where(eq(templates.userId, userId))
        .then(([result]) => result),

      // Get recent usage and success rate from proposal tracking
      db
        .select({
          recentUsage: count(),
          totalProposals: count(),
          jobsAwarded: count(
            sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`,
          ),
        })
        .from(proposalTracking)
        .innerJoin(templates, eq(proposalTracking.templateId, templates.id))
        .where(
          and(
            eq(templates.userId, userId),
            sql`${proposalTracking.sentAt} >= ${thirtyDaysAgo}`,
          ),
        )
        .then(([result]) => result),
    ]);

    const total = Number(proposalStats.totalProposals) || 0;
    const awarded = Number(proposalStats.jobsAwarded) || 0;

    return {
      totalTemplates: Number(templateStats.totalTemplates) || 0,
      activeTemplates: Number(templateStats.activeTemplates) || 0,
      favoriteTemplates: Number(templateStats.favoriteTemplates) || 0,
      totalUsage: Number(templateStats.totalUsage) || 0,
      recentUsage: Number(proposalStats.recentUsage) || 0,
      averageSuccessRate: total > 0 ? Math.round((awarded / total) * 100) : 0,
    };
  },

  // Get daily proposal activity for a user
  async getDailyActivity(
    userId: string,
    days: number = 30,
  ): Promise<
    Array<{
      date: string;
      proposalsSent: number;
      proposalsViewed: number;
      responses: number;
      jobsAwarded: number;
    }>
  > {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db
      .select({
        date: sql<string>`DATE(${proposalTracking.sentAt})`,
        proposalsSent: count(),
        proposalsViewed: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('proposal_viewed', 'client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
        responses: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
        jobsAwarded: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`,
        ),
      })
      .from(proposalTracking)
      .where(
        and(
          eq(proposalTracking.userId, userId),
          sql`${proposalTracking.sentAt} >= ${since}`,
        ),
      )
      .groupBy(sql`DATE(${proposalTracking.sentAt})`)
      .orderBy(sql`DATE(${proposalTracking.sentAt})`);

    return result.map((r) => ({
      date: r.date,
      proposalsSent: Number(r.proposalsSent) || 0,
      proposalsViewed: Number(r.proposalsViewed) || 0,
      responses: Number(r.responses) || 0,
      jobsAwarded: Number(r.jobsAwarded) || 0,
    }));
  },

  // Get platform performance analytics
  async getPlatformStats(
    userId: string,
    days: number = 30,
  ): Promise<
    Array<{
      platform: string;
      totalProposals: number;
      successRate: number;
      responseRate: number;
    }>
  > {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await db
      .select({
        platform: proposalTracking.platform,
        totalProposals: count(),
        jobsAwarded: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`,
        ),
        responses: count(
          sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`,
        ),
      })
      .from(proposalTracking)
      .where(
        and(
          eq(proposalTracking.userId, userId),
          sql`${proposalTracking.sentAt} >= ${since}`,
          sql`${proposalTracking.platform} IS NOT NULL`,
        ),
      )
      .groupBy(proposalTracking.platform);

    return result.map((r) => {
      const total = Number(r.totalProposals) || 0;
      const awarded = Number(r.jobsAwarded) || 0;
      const responses = Number(r.responses) || 0;

      return {
        platform: r.platform || "Unknown",
        totalProposals: total,
        successRate: total > 0 ? Math.round((awarded / total) * 100) : 0,
        responseRate: total > 0 ? Math.round((responses / total) * 100) : 0,
      };
    });
  },
};
