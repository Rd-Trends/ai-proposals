import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  stepCountIs,
  streamText,
} from "ai";
import { headers } from "next/headers";
import { generateTitleFromUserMessage } from "@/actions/conversation-actions";
import { generateProposalPrompt } from "@/lib/ai/prompts";
import { createTemplateFromProposal } from "@/lib/ai/tools/create-template-from-proposal";
import { getProjectsAndCaseStudies } from "@/lib/ai/tools/get-projects-and-case-studies";
import { getTemplates } from "@/lib/ai/tools/get-templates";
import { getTestimonials } from "@/lib/ai/tools/get-testimonials";
import { saveProposals } from "@/lib/ai/tools/save-proposals";
import { auth } from "@/lib/auth";
import {
  createConversation,
  getConversationById,
  getMessagesByConversationId,
  saveMessages,
} from "@/lib/db/operations/conversation";
import { ChatSDKError } from "@/lib/error";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const { id, message, tone } = requestBody;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const chat = await getConversationById({ id });

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await createConversation({
        id,
        userId: session.user.id,
        title,
      });
    }

    const messagesFromDb = await getMessagesByConversationId(id);
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    await saveMessages([
      {
        conversationId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ]);

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: openai("gpt-4.1"),
          system: generateProposalPrompt({
            user: { ...session.user, image: session.user?.image || "" },
            tone,
          }),
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          tools: {
            getTemplates: getTemplates(session.user),
            getProjectsAndCaseStudies: getProjectsAndCaseStudies(session.user),
            getTestimonials: getTestimonials(session.user),
            saveProposal: saveProposals(session.user),
            createTemplateFromProposal: createTemplateFromProposal(
              session.user,
            ),
          },
          onFinish: async ({ usage }) => {
            // try {
            //   const providers = await getTokenlensCatalog();
            //   const modelId =
            //     myProvider.languageModel(selectedChatModel).modelId;
            //   if (!modelId) {
            //     finalMergedUsage = usage;
            //     dataStream.write({
            //       type: "data-usage",
            //       data: finalMergedUsage,
            //     });
            //     return;
            //   }
            //   if (!providers) {
            //     finalMergedUsage = usage;
            //     dataStream.write({
            //       type: "data-usage",
            //       data: finalMergedUsage,
            //     });
            //     return;
            //   }
            //   const summary = getUsage({ modelId, usage, providers });
            //   finalMergedUsage = {
            //     ...usage,
            //     ...summary,
            //     modelId,
            //   } as AppUsage;
            //   dataStream.write({
            //     type: "data-usage",
            //     data: finalMergedUsage,
            //   });
            // } catch (err) {
            //   console.warn("TokenLens enrichment failed", err);
            //   finalMergedUsage = usage;
            //   dataStream.write({
            //     type: "data-usage",
            //     data: finalMergedUsage,
            //   });
            // }

            console.log("Usage stats:", usage);
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages(
          messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            conversationId: id,
          })),
        );
        // if (finalMergedUsage) {
        //   try {
        //     await updateChatLastContextById({
        //       chatId: id,
        //       context: finalMergedUsage,
        //     });
        //   } catch (err) {
        //     console.warn("Unable to persist last usage for chat", id, err);
        //   }
        // }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests",
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error);
    return new ChatSDKError("offline:chat").toResponse();
  }
}
