import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { resend } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  user: {
    additionalFields: {
      bio: { type: "string", optional: true },
    },
  },
  emailAndPassword: {
    enabled: false, // Disable password authentication
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
        if (!allowedEmails.includes(email)) {
          throw new APIError("UNAUTHORIZED", {
            message:
              "Access denied. Your email is not authorized to use this application.",
          });
        }

        if (process.env.NODE_ENV === "development") {
          // In development, just log the magic link
          console.log(`Magic link for ${email}: ${url}`);
          return;
        }

        // In production, send via Resend
        await resend.emails.send({
          from: "noreply@yourdomain.com", // Replace with your domain
          to: [email],
          subject: "Sign in to AI Proposals",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; text-align: center;">Sign in to AI Proposals</h1>
              <p style="color: #666; font-size: 16px;">
                Click the button below to sign in to your account. This link will expire in 10 minutes.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${url}" 
                  style="
                    background-color: #007cba;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    display: inline-block;
                  "
                >
                  Sign In
                </a>
              </div>
              <p style="color: #888; font-size: 14px;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
  trustedOrigins: ["http://localhost:3000"],
});
