import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [magicLinkClient(), inferAdditionalFields<typeof auth>()],
});

export const { signIn, signOut, signUp, useSession, $Infer } = authClient;

export type Session = typeof $Infer.Session;
export type User = typeof $Infer.Session.user;
