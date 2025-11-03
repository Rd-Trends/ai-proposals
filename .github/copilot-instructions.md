## Copilot Chat rules (read first)

These rules are binding for all Copilot Chat responses in this repo. Default to brevity and only expand when asked.

- Keep responses and feedback short and concise (2-3 sentences) unless more detail is requested.

### Project coding defaults

- Framework: Next.js App Router with TypeScript. Keep server/client boundaries clear. Use server actions with `useTransition`.
- UI: Shadcn UI + Tailwind. Use Shadcn form components for all inputs. Keep design clean, modern, and responsive.
- Data: PostgreSQL via Drizzle ORM with typed schemas and queries.
- Auth: BetterAuth. Follow existing patterns in `src/app/auth` and `src/lib/auth*`.
- AI: Vercel AI SDK. Follow existing chat/actions patterns in `src/actions` and `src/components/ai-elements`.
- Charts: Recharts (or existing configured chart lib) for analytics.
- Code style: TypeScript everywhere, ESLint + Prettier. Use const/let, async/await, arrow functions for callbacks, descriptive names over comments.


---

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
- Use useTransition hook for server actions 

## Coding Standards
- Keep changes small: Avoid broad refactors unless requested. Adhere to existing file structure and naming.
- Accessibility: Follow WCAG; ensure keyboard and screen reader support for interactive elements.
- Use TypeScript for all new files.
- Prefer const and let over var.
- Use arrow functions for callbacks.
- Write clear, concise, and well-named variables and functions (prefer descriptive names over writing comments, write comments only when necessary).
- Use async/await for asynchronous operations.
- Ensure components are accessible following WCAG guidelines.
- For styling, use Tailwind CSS classes, with Shadcn components providing the base styles.
