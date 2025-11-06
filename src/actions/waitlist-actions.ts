"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdminAccessRequestEmail } from "@/emails/admin-access-request";
import { UserActivatedEmail } from "@/emails/user-activated";
import {
  addToWaitlist,
  deactivateWaitlistEntry as deactivateEntry,
  getWaitlistStatus,
  isEmailAllowed,
  reactivateWaitlistEntry as reactivateEntry,
  removeFromWaitlist,
} from "@/lib/db/operations/waitlist";
import { sendEmail } from "@/lib/email";

const emailSchema = z.string().email("Invalid email address");

/**
 * Check waitlist status for signin
 * Returns whether user can sign in and an appropriate message
 */
export async function checkWaitlistForSignIn(email: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  try {
    emailSchema.parse(email);

    if (process.env.NODE_ENV !== "production") {
      // In development, allow all emails
      return { allowed: true };
    }

    const status = await getWaitlistStatus(email);

    switch (status) {
      case "not-in-waitlist":
        // Email not in waitlist, allow normal login
        return { allowed: true };
      case "activated":
        // User is activated, allow login
        return { allowed: true };
      case "pending":
        // User is in waitlist but not activated yet
        return {
          allowed: false,
          message:
            "Your account is pending approval. We'll notify you when you have been granted access.",
        };
      default:
        return {
          allowed: false,
          message: "An unexpected error occurred.",
        };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        allowed: false,
        message: error.errors[0].message,
      };
    }

    return { allowed: false, message: "An unexpected error occurred." };
  }
}

/**
 * Request access to the platform by joining the waitlist
 */

const joinWaitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function joinWaitlistAction(
  params: z.infer<typeof joinWaitlistSchema>,
): Promise<{
  success: boolean;
  isInWaitlist?: boolean;
  message: string;
}> {
  try {
    emailSchema.parse(params.email);

    // Check if email is already on the waitlist
    const alreadyOnWaitlist = await isEmailAllowed(params.email);

    if (alreadyOnWaitlist) {
      return {
        success: true,
        isInWaitlist: true,
        message:
          "This email is already on our waitlist. We'll notify you when access is available.",
      };
    }

    // Add to waitlist
    await addToWaitlist({
      name: params.name,
      email: params.email.toLowerCase(),
      invitedBy: "self-request",
      notes: "Requested access via waitlist form",
      isActive: false,
    });

    // Send email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Access Request from ${params.name}`,
          react: AdminAccessRequestEmail({
            email: params.email.toLowerCase(),
            name: params.name,
            requestedAt: new Date().toLocaleString(),
          }),
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send admin notification email:", emailError);
    }

    return {
      success: true,
      isInWaitlist: false,
      message:
        "Thanks for your interest! We've added you to our waitlist and will notify you when access is available.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
      };
    }

    console.error("Error adding to waitlist:", error);

    if (error instanceof Error && error.message.includes("unique constraint")) {
      // Check if it's a unique constraint error (email already exists)
      return {
        success: false,
        message:
          "This email is already on our waitlist. We'll notify you when access is available.",
      };
    }

    return {
      success: false,
      message:
        "Unable to process your request at this time. Please try again later.",
    };
  }
}

/**
 * Delete a waitlist entry (admin action)
 */
export async function deleteWaitlistEntry(email: string): Promise<void> {
  try {
    emailSchema.parse(email);
    await removeFromWaitlist(email);
    revalidatePath("/dashboard/waitlist");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to delete waitlist entry");
  }
}

/**
 * Deactivate a waitlist entry (admin action)
 */
export async function deactivateWaitlistEntry(email: string): Promise<void> {
  try {
    emailSchema.parse(email);
    await deactivateEntry(email);
    revalidatePath("/dashboard/waitlist");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to deactivate waitlist entry");
  }
}

/**
 * Reactivate a waitlist entry (admin action)
 */
export async function reactivateWaitlistEntry(email: string): Promise<void> {
  try {
    emailSchema.parse(email);
    await reactivateEntry(email);

    // Send activation email to the user
    try {
      await sendEmail({
        to: email,
        subject: "Your Access to QuickRite Has Been Activated! 🎉",
        react: UserActivatedEmail({
          email,
        }),
      });
    } catch (emailError) {
      // Log email error but don't fail the reactivation
      console.error("Failed to send activation email:", emailError);
    }

    revalidatePath("/dashboard/waitlist");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to reactivate waitlist entry");
  }
}
