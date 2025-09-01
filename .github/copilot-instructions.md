## Project Overview

This project is a web application designed to help freelancers (web developers, creative writers, UI/UX designers, etc.) write better proposals for job postings on platforms like Upwork, Contra, and Fiverr. Users can create proposals templates (with or without AI assistance), users can generate proposals using AI for job postings (with or without templates). users can track proposal performance, and users can manage their profiles.

## Technology Stack

- Framework: Next.js (App Router)
- UI Library: Shadcn UI (for accessible and reusable components)
- Database: PostgreSQL
- ORM: Drizzle ORM
- AI Integration: Vercel AI SDK
- Auth: BetterAuth

## UI/UX Guidelines

- The design should be clean, modern, and minimalist, aligning with the Shadcn UI aesthetic.
- Ensure the application is fully responsive and works well on desktop, tablet, and mobile devices.
- Use clear and intuitive navigation.
- Provide feedback to the user for asynchronous operations (e.g., loading spinners when the AI is generating a proposal, skeleton loaders for pages or components awaiting data).
- Use shadcn form components for all user input.
- Display analytics using Recharts or a similar charting library.

## Coding Standards

- Use TypeScript for all new files.
- Follow ESLint and Prettier rules as configured in the project.
- Prefer const and let over var.
- Use arrow functions for callbacks.
- Write clear, concise, and well-named variables and functions (prefer descriptive names over writing comments, write comments only when necessary).
- Use async/await for asynchronous operations.
- Ensure components are accessible following WCAG guidelines.
- For styling, use Tailwind CSS classes, with Shadcn components providing the base styles.
- don't install any packages just list them out after completing tasks e.g the following packages needs to be installed:

  - `@shadcn/ui`
  - `@drizzle-orm/postgres`
  - `@vercel/ai`
  - `recharts`

  dev dependencies:

  - `@types/react`
