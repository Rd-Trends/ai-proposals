import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const adminEmails =
      process.env.ADMIN_EMAIL?.split(",").map((email) => email.trim()) || [];
    const isAdmin = adminEmails.some((email) => email === session.user.email);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
