import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

// In production, this would write to Supabase
// For now, generate and return the key
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a secure API key
    const apiKey = `midan_${crypto.randomBytes(32).toString("hex")}`;

    // TODO: Store in Supabase users table
    // await supabase.from("users").update({ api_key: apiKey }).eq("id", userId);

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("API key generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
