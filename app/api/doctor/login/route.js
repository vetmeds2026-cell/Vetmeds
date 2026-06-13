import { db } from "@/app/configs/db";
import { doctors } from "@/app/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const doctor = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.email, email), eq(doctors.password, password)))
      .execute();

    if (doctor.length > 0) {
      const { password, ...doctorWithoutPassword } = doctor[0];
      return NextResponse.json(doctorWithoutPassword);
    } else {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
