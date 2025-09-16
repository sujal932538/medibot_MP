import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/users/create invoked')
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('create user body', body)
    const {
      firstName,
      lastName,
      phone,
      email,
      role
    } = body;

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["patient", "doctor", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Create user profile in Convex
    const createdId = await convex.mutation(api.users.createUser, {
      clerkId: session.user.id,
      email,
      firstName,
      lastName,
      phone,
      role,
    });

    return NextResponse.json({
      success: true,
      message: "User profile created successfully",
      userId: createdId,
    });

  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
}