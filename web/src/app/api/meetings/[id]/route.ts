import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/meetings/[id] - Fetch single meeting with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch meeting
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Fetch action items
    const { data: actionItems } = await supabase
      .from("action_items")
      .select("*")
      .eq("meeting_id", id)
      .order("extracted_at", { ascending: true });

    // Fetch rough notes
    const { data: roughNotes } = await supabase
      .from("rough_notes")
      .select("*")
      .eq("meeting_id", id)
      .order("created_at", { ascending: true });

    // Group by assignee
    const groupedByPerson: Record<string, typeof actionItems> = {};
    for (const item of actionItems || []) {
      for (const assignee of item.assignees || []) {
        if (!groupedByPerson[assignee]) groupedByPerson[assignee] = [];
        groupedByPerson[assignee].push(item);
      }
    }

    return NextResponse.json({
      meeting,
      actionItems: actionItems || [],
      roughNotes: roughNotes || [],
      groupedByPerson,
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Delete meeting (cascades to action_items and rough_notes)
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to delete meeting:", error);
      return NextResponse.json(
        { error: "Failed to delete meeting" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
