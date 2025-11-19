import { relations } from "drizzle-orm";
import { users } from "./auth";
import { projects } from "./projects";
import { proposalTracking } from "./proposals";
import { templates } from "./templates";

export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
  proposalTracking: many(proposalTracking),
  projects: many(projects),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  proposalTracking: many(proposalTracking),
}));

export const proposalTrackingRelations = relations(
  proposalTracking,
  ({ one }) => ({
    user: one(users, {
      fields: [proposalTracking.userId],
      references: [users.id],
    }),
    template: one(templates, {
      fields: [proposalTracking.templateId],
      references: [templates.id],
    }),
  })
);

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));
