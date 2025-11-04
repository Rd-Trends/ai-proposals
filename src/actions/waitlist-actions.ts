"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdminAccessRequestEmail } from "@/emails/admin-access-request";
import { UserActivatedEmail } from "@/emails/user-activated";
import {
  addToWaitlist,
  deactivateWaitlistEntry as deactivateEntry,
  isEmailAllowed,
  markWaitlistAsUsed,
  reactivateWaitlistEntry as reactivateEntry,
  removeFromWaitlist,
} from "@/lib/db/operations/waitlist";
import { sendEmail } from "@/lib/email";

const emailSchema = z.string().email("Invalid email address");

/**
 * Check if email is allowed to sign up
 * Only enforced in production
 */
export async function checkEmailAllowed(email: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  try {
    emailSchema.parse(email);

    if (process.env.NODE_ENV !== "production") {
      // In development, allow all emails
      return { allowed: true };
    }

    const allowed = await isEmailAllowed(email);

    if (!allowed) {
      return {
        allowed: false,
        message:
          "Your email is not on the waitlist. Please request an invite to join the platform.",
      };
    }

    return { allowed: true };
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
 * Mark waitlist entry as used after successful signup
 */
export async function markEmailUsed(email: string): Promise<void> {
  try {
    emailSchema.parse(email);

    if (process.env.NODE_ENV === "production") {
      await markWaitlistAsUsed(email);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }

    throw new Error("An unexpected error occurred.");
  }
}

/**
 * Request access to the platform by joining the waitlist
 */
export async function requestAccess(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    emailSchema.parse(email);

    // Check if email is already on the waitlist
    const alreadyOnWaitlist = await isEmailAllowed(email);

    if (alreadyOnWaitlist) {
      return {
        success: false,
        message:
          "This email is already on our waitlist. We'll notify you when access is available.",
      };
    }

    // Add to waitlist
    await addToWaitlist({
      email: email.toLowerCase(),
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
          subject: `New Access Request from ${email}`,
          react: AdminAccessRequestEmail({
            email: email.toLowerCase(),
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
 * Add a new entry to the waitlist (admin action)
 */
export async function addToWaitlistAction(
  email: string,
  invitedBy = "admin",
  notes?: string,
): Promise<void> {
  try {
    emailSchema.parse(email);
    await addToWaitlist({ email, invitedBy, notes, isActive: true });

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
      // Log email error but don't fail the action
      console.error("Failed to send activation email:", emailError);
    }

    revalidatePath("/dashboard/waitlist");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw new Error("Failed to add email to waitlist");
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
