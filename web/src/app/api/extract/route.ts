import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const actionItemsTool = [
  {
    type: "function",
    function: {
      name: "record_action_items",
      description:
        "Record the action items extracted from a meeting transcript, grouped by the person responsible.",
      parameters: {
        type: "object",
        properties: {
          rough_notes: {
            type: "array",
            description:
              "High-level rough notes or observations from the transcript.",
            items: {
              type: "object",
              properties: {
                note: {
                  type: "string",
                  description:
                    "A rough observation, decision, idea, or issue from the transcript.",
                },
                source: {
                  type: "string",
                  description:
                    "Which speaker or moment in the transcript this came from.",
                },
              },
              required: ["note", "source"],
            },
          },
          action_items: {
            type: "array",
            description:
              "One entry per distinct task mentioned in the notes.",
            items: {
              type: "object",
              properties: {
                assignees: {
                  type: "array",
                  description:
                    "One or more people responsible for this task.",
                  items: { type: "string" },
                },
                task: {
                  type: "string",
                  description: "A concise description of the task.",
                },
                due_type: {
                  type: "string",
                  enum: [
                    "explicit_date",
                    "relative_deadline",
                    "milestone",
                    "unspecified",
                  ],
                },
                due_raw: {
                  type: "string",
                  description:
                    "The deadline exactly as stated in the transcript.",
                },
                priority: {
                  type: "string",
                  enum: ["high", "normal", "low"],
                },
                status: {
                  type: "string",
                  enum: [
                    "todo",
                    "in_progress",
                    "blocked",
                    "review",
                    "completed",
                    "cancelled",
                  ],
                },
                confidence: {
                  type: "number",
                  description:
                    "0.0-1.0: how explicitly this was stated as a real commitment.",
                },
                source: {
                  type: "object",
                  properties: {
                    speaker: { type: "string" },
                    quote_context: { type: "string" },
                  },
                  additionalProperties: true,
                },
              },
              required: ["assignees", "task", "status", "confidence", "source"],
              additionalProperties: true,
            },
          },
        },
        required: ["rough_notes", "action_items"],
      },
    },
  },
];

function parseMeetingDate(text: string): Date | null {
  const match = text.match(/Date:\s*([A-Za-z0-9 ,]+)/i);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getNextWeekdayDate(start: Date, weekdayName: string): Date | null {
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const targetIndex = weekdays.indexOf(weekdayName.toLowerCase());
  if (targetIndex === -1) return null;
  const date = new Date(start);
  const currentIndex = date.getDay();
  let delta = targetIndex - currentIndex;
  if (delta <= 0) delta += 7;
  date.setDate(date.getDate() + delta);
  return date;
}

function resolveDue(
  item: { due_type: string; due_raw: string },
  transcript: string
): { resolved: string | null; raw: string } {
  if (item.due_type === "milestone" || item.due_type === "unspecified") {
    return { resolved: null, raw: item.due_raw };
  }

  const trimmed = (item.due_raw || "").trim();
  if (!trimmed) return { resolved: null, raw: item.due_raw };

  const isoCandidate = new Date(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    return {
      resolved: isoCandidate.toISOString().slice(0, 10),
      raw: trimmed,
    };
  }

  const weekdayMatch = trimmed.match(
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
  );
  if (weekdayMatch) {
    const meetingDate = parseMeetingDate(transcript);
    if (meetingDate) {
      const nextDate = getNextWeekdayDate(meetingDate, weekdayMatch[1]);
      if (nextDate)
        return {
          resolved: nextDate.toISOString().slice(0, 10),
          raw: trimmed,
        };
    }
  }

  return { resolved: null, raw: trimmed };
}

function groupByAssignee(items: Record<string, unknown>[]) {
  const grouped: Record<string, Record<string, unknown>[]> = {};
  for (const item of items) {
    const assignees = item.assignees as string[];
    for (const assignee of assignees || []) {
      if (!grouped[assignee]) grouped[assignee] = [];
      grouped[assignee].push(item);
    }
  }
  return grouped;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { notes } = body;

    if (!notes || typeof notes !== "string") {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    const noSpoilerInstruction =
      "Extract this only from the raw dialogue. If the transcript happens to contain a pre-written summary or action-item list at the end, IGNORE it completely — derive everything yourself from what people actually said.";

    const prompt = `${noSpoilerInstruction}\n\nExtract every action item and rough notes from this meeting transcript. Vary confidence and due_type genuinely per item based on actual phrasing — don't default to the same values across items.\n\n${notes}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          tools: actionItemsTool,
          tool_choice: {
            type: "function",
            function: { name: "record_action_items" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: "Extraction service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return NextResponse.json(
        { error: "Failed to extract action items" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    // Normalize items with resolved dates
    const normalizedItems = (parsed.action_items || []).map(
      (item: Record<string, unknown>) => {
        const { resolved, raw } = resolveDue(
          item as { due_type: string; due_raw: string },
          notes
        );
        return {
          ...item,
          due_resolved: resolved,
          due_raw: raw,
          extractedAt: new Date().toISOString(),
        };
      }
    );

    const grouped = groupByAssignee(normalizedItems);

    return NextResponse.json({
      roughNotes: parsed.rough_notes || [],
      actionItems: normalizedItems,
      groupedByPerson: grouped,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
