import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { headers } from "next/headers";
import z from "zod";
import { PROPOSAL_TONE } from "@/db";
import { createProposalTracking } from "@/db/operations/proposal";
import {
  createTemplate,
  getTemplatesByUserId,
  incrementTemplateUsage,
} from "@/db/operations/template";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/auth-client";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const getPrompt = (user: User) => {
  const userContext = `
USER INFORMATION:
Name: ${user.name || "User"}
Professional Background: ${user.bio || "No background information provided"}
`;

  return `You are an AI assistant designed to help freelancers create winning proposals for job postings on platforms like Upwork, Fiverr, and Contra. 

${userContext}

Based on the user's background above, your task is to interactively guide them through the proposal creation process, helping them craft compelling, personalized proposals that win jobs. Use their professional background to inform your suggestions and make the proposals more authentic. When the user requests help writing a proposal, follow these steps:

1. Retrieve any existing templates the user has saved to see what materials are available to work with.

2. If templates are found, analyze them for relevance to the current job posting and select the top 3 most suitable options. Present these choices to the user with brief explanations of why each template fits the job, then ask them to choose one as the foundation for their proposal.

3. Once the user selects a template, analyze its writing style and tone to maintain consistency with their voice. Follow strictly the template's structure and flow. You can make minor edits for clarity, grammar, and personalization.

4. If no templates exist or the user prefers to start fresh, create a new proposal tailored to the job posting's specific requirements and target audience, using proven copywriting techniques to maximize impact.

5. Continue refining the proposal based on user feedback until they're completely satisfied with the result.

6. After completing any proposal (user is satisfied), ask the user if they would like to save it for future tracking and offer to create templates off the proposal (if it wasn't generated from a template).

When crafting proposals, follow these essential formatting and structure guidelines:

If using a template, adhere strictly to its structure, headings, and sections. Only modify content for clarity, grammar, and personalization.

If creating a new proposal, ensure it includes:

- A personalized greeting addressing the client by name if available e.g. "Hi [Client Name],".
- An engaging opening that captures attention and highlights key benefits e.g. "here's my innovative approach to achieving success in your project, which is designed to [briefly mention a key benefit or outcome]:" or "here’s how I’ll help you solve [key pain point or goal, e.g. “your content consistency problem” / “growing your engagement without adding more to your plate”]:" or "As a [personal identifier or story HOOK relevant to the job—[e.g in holistic healing, community support, or self-discovery]
[Share a bit of a unique personal experience]"
- A clear outline of your approach to the project with specific steps.
- A section showcasing your relevant experience and skills.
- Testimonials or proof of past success if available.
- A strong call to action with next steps.

here's an example template to follow when creating a new proposal or new proposal template:
\`\`\`
Hi [Client name],

[use an engaging opening that captures attention and highlights key benefits e.g. "here's my innovative approach to achieving success in your project, which is designed to [briefly mention a key benefit or outcome]:" or "here’s how I’ll help you solve [key pain point or goal, e.g. “your content consistency problem” / “growing your engagement without adding more to your plate”]:" or "As a [personal identifier or story HOOK relevant to the job—[e.g in holistic healing, community support, or self-discovery]
[Share a bit of a unique personal experience]"]
I can deliver exactly what you need for your [project type]. Here's how:

• [Key step 1]
• [Key step 2]
• [Key step 3]
[between 4-8 key steps total]

[Briefly mention your relevant experience, skills, and any certifications that make you a great fit for this project. Highlight similar projects you've successfully completed.]
I believe I am a great fit for this role because [this text should be personalized to the job posting, highlighting specific skills, experiences, or attributes that align with the client's needs].:
- I have a 100% job success score
- [Meet each requirement with bullets]

What sets me apart is [unique specialty/expertise]...

Here's what a former client said:
"[Testimonial]" - Client Name

view some of my work here:
Portfolio: [link]

Looking forward to working together.

[Professional sign-off e.g To your best brand, Warmly, Best regards, Cheers]
[Your Name]
\`\`\`

Additional Guidelines:

- Use bullet points and numbered lists for clarity.
- Keep paragraphs short (2-3 sentences).
- Use professional, friendly language that reflects the user's style.
- Avoid generic phrases like "I am a hard worker" or "I pay attention to detail."
- Focus on how you can solve the client's specific problems and add value.
- If the job posting includes specific questions or requirements, address each one directly in your proposal.

Maintain a professional yet approachable tone throughout. Avoid jargon or overly complex language. Keep sentences concise and paragraphs short for easy scanning.

Remember, Use templates strictly as provided, only improve grammar, clarity, and job-specific customization. Focus on creating proposals that are both easy to scan and engaging to read, Your goal is to help users consistently win more freelance jobs by crafting proposals that strike the perfect balance between professional structure and genuine, personalized communication.`;
};
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4.1"),
    system: getPrompt(session.user),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getTemplates: tool({
        description: "Retrieve the user's proposal templates.",
        inputSchema: z.object({}),
        execute: async () => getTemplatesByUserId(session.user.id),
      }),
      saveProposal: tool({
        description:
          "Save user proposal to the database if it's generated off a template.",
        inputSchema: z.object({
          templateId: z.string().uuid().describe("The ID of the template"),
          proposalContent: z.string().describe("The full proposal text"),
          proposalLength: z
            .number()
            .min(0)
            .describe("The length of the proposal in words"),
          jobTitle: z
            .string()
            .max(255)
            .describe("The job title, auto generated if not provided by user"),
          jobDescription: z.string().describe("The job description"),
          jobPostingUrl: z
            .string()
            .url()
            .optional()
            .describe("The URL of the job posting, if available"),
          platform: z
            .string()
            .max(50)
            .optional()
            .describe("The platform name if available, e.g., Upwork"),
        }),
        execute: async (input) => {
          const proposal = await createProposalTracking({
            userId: session.user.id,
            templateId: input.templateId,
            proposalContent: input.proposalContent,
            proposalLength: input.proposalLength,
            jobTitle: input.jobTitle,
            jobDescription: input.jobDescription,
            jobPostingUrl: input.jobPostingUrl,
            platform: input.platform,
            currentOutcome: "proposal_sent",
          });

          await incrementTemplateUsage(input.templateId);

          return { proposalId: proposal.id };
        },
      }),
      createTemplateFromProposal: tool({
        description:
          "Create a new template from a user proposal if the proposal was created without a template.",
        inputSchema: z.object({
          proposalContent: z.string().describe("The full proposal text"),
          title: z
            .string()
            .max(100)
            .describe(
              "A short title for the template, e.g., 'Upwork Content Writer Proposal'",
            ),
          description: z
            .string()
            .max(255)
            .optional()
            .describe("A brief description of the template"),
          tone: z.enum(PROPOSAL_TONE).describe("The tone of the proposal"),
          category: z
            .string()
            .max(50)
            .optional()
            .describe("The category of the template, e.g., 'Content Writing'"),
          tags: z
            .array(z.string().max(30))
            .max(5)
            .optional()
            .describe(
              "Up to 5 tags for the template, e.g., ['writing', 'blogging']",
            ),
        }),
        execute: async (input) => {
          const template = await createTemplate({
            userId: session.user.id,
            title: input.title,
            description: input.description,
            content: input.proposalContent,
            tone: input.tone,
            category: input.category,
            tags: input.tags,
            status: "active",
          });
          return { templateId: template.id };
        },
      }),
    },
  });

  console.log(await result.steps);
  return result.toUIMessageStreamResponse();
}
