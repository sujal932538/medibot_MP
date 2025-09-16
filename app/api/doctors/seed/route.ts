import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST - Seed initial doctors data
export async function POST(request: NextRequest) {
  try {
    const result = await convex.mutation(api.doctors.seedDoctors, {});
    
    return NextResponse.json({
      success: true,
      message: result.message,
      count: result.count,
    });
  } catch (error) {
    console.error("Error seeding doctors:", error);
    return NextResponse.json(
      { error: "Failed to seed doctors" },
      { status: 500 }
    );
  }
}

// GET - Check if doctors exist
export async function GET() {
  try {
    const doctors = await convex.query(api.doctors.getAllDoctors, {});
    
    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors: doctors.slice(0, 5), // Return first 5 for preview
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}