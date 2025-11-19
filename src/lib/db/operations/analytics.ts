import { and, count, eq, sql } from "drizzle-orm";
import { proposalTracking } from "@/lib/db/schema/proposals";
import { templates } from "@/lib/db/schema/templates";
import { db } from "../drizzle";

// Get user proposal summary statistics
export async function getUserProposalStats(
  userId: string,
  days = 30
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
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('proposal_viewed', 'client_responded', 'interviewed', 'job_awarded') THEN 1 END`
      ),
      clientResponses: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`
      ),
      interviews: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('interviewed', 'job_awarded') THEN 1 END`
      ),
      jobsAwarded: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`
      ),
    })
    .from(proposalTracking)
    .where(
      and(
        eq(proposalTracking.userId, userId),
        sql`${proposalTracking.sentAt} >= ${since}`
      )
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
}

// Get template success statistics
export async function getTemplateStats(
  templateId: string,
  days = 30
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
        sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`
      ),
      clientResponses: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`
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
        sql`${proposalTracking.sentAt} >= ${since}`
      )
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
}

// Get user templates statistics
export async function getUserTemplateStats(userId: string): Promise<{
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
          sql`CASE WHEN ${templates.status} = 'active' THEN 1 END`
        ),
        favoriteTemplates: count(
          sql`CASE WHEN ${templates.isFavorite} = true THEN 1 END`
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
          sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`
        ),
      })
      .from(proposalTracking)
      .innerJoin(templates, eq(proposalTracking.templateId, templates.id))
      .where(
        and(
          eq(templates.userId, userId),
          sql`${proposalTracking.sentAt} >= ${thirtyDaysAgo}`
        )
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
}

// Get daily proposal activity for a user
export async function getDailyActivity(
  userId: string,
  days = 30
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
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('proposal_viewed', 'client_responded', 'interviewed', 'job_awarded') THEN 1 END`
      ),
      responses: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`
      ),
      jobsAwarded: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`
      ),
    })
    .from(proposalTracking)
    .where(
      and(
        eq(proposalTracking.userId, userId),
        sql`${proposalTracking.sentAt} >= ${since}`
      )
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
}

// Get platform performance analytics
export async function getPlatformStats(
  userId: string,
  days = 30
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
        sql`CASE WHEN ${proposalTracking.currentOutcome} = 'job_awarded' THEN 1 END`
      ),
      responses: count(
        sql`CASE WHEN ${proposalTracking.currentOutcome} IN ('client_responded', 'interviewed', 'job_awarded') THEN 1 END`
      ),
    })
    .from(proposalTracking)
    .where(
      and(
        eq(proposalTracking.userId, userId),
        sql`${proposalTracking.sentAt} >= ${since}`,
        sql`${proposalTracking.platform} IS NOT NULL`
      )
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
}
