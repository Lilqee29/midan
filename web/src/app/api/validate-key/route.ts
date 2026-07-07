import { NextRequest, NextResponse } from "next/server";

// POST /api/validate-key
// Used by Chrome extension to validate API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // TODO: Validate against Supabase users table
    // const { data } = await supabase
    //   .from("users")
    //   .select("id")
    //   .eq("api_key", apiKey)
    //   .single();

    // For now, accept keys with correct format
    if (apiKey.startsWith("midan_") && apiKey.length === 67) {
      return NextResponse.json({ valid: true, userId: "placeholder" });
    }

    return NextResponse.json({ valid: false }, { status: 401 });
  } catch (error) {
    console.error("Key validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
