import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/meetings - Fetch user's meetings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: meetings, error } = await supabase
      .from("meetings")
      .select(`
        id,
        title,
        created_at,
        action_items (
          id
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch meetings:", error);
      return NextResponse.json({ meetings: [] });
    }

    // Transform to include item count
    const meetingsWithCount = (meetings || []).map((m) => ({
      id: m.id,
      title: m.title,
      date: m.created_at,
      itemCount: Array.isArray(m.action_items) ? m.action_items.length : 0,
    }));

    return NextResponse.json({ meetings: meetingsWithCount });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ meetings: [] });
  }
}
