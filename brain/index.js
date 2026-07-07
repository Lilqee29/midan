// Midan prototype — extracts per-person action items from raw meeting notes
// using tool calling (function calling) to force structured JSON output.
//
// Uses Groq's free API (OpenAI-compatible), not the paid Anthropic API.
// Get a free key at https://console.groq.com/keys
//
// Run:
//   export GROQ_API_KEY=gsk_...
//   node index.js raw-notes.txt

import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.GROQ_API_KEY;
const MODEL = "llama-3.3-70b-versatile"; // supports tool calling on Groq's free tier

if (!API_KEY) {
  console.error("Missing GROQ_API_KEY. Get a free one at https://console.groq.com/keys");
  console.error("Then: export GROQ_API_KEY=gsk_...");
  process.exit(1);
}

const filePath = process.argv[2] || "raw-notes.txt";
const notes = fs.readFileSync(filePath, "utf-8");

// --- Tool schemas ---
// Every field the MODEL fills in should require it to actually reason,
// not just echo a default. No field the model can't genuinely judge.

const roughTools = [
  {
    type: "function",
    function: {
      name: "record_rough_notes",
      description: "Record rough notes extracted from a meeting transcript before task assignment.",
      parameters: {
        type: "object",
        properties: {
          rough_notes: {
            type: "array",
            description: "High-level rough notes or observations from the transcript.",
            items: {
              type: "object",
              properties: {
                note: { type: "string", description: "A rough observation, decision, idea, or issue from the transcript." },
                source: { type: "string", description: "Which speaker or moment in the transcript this came from — be specific, not generic." }
              },
              required: ["note", "source"]
            }
          }
        },
        required: ["rough_notes"]
      }
    }
  }
];

const tools = [
  {
    type: "function",
    function: {
      name: "record_action_items",
      description: "Record the action items extracted from a meeting transcript, grouped by the person responsible.",
      parameters: {
        type: "object",
        properties: {
          action_items: {
            type: "array",
            description: "One entry per distinct task mentioned in the notes.",
            items: {
              type: "object",
              properties: {
                assignees: {
                  type: "array",
                  description: "One or more people responsible for this task, based on who explicitly said they'd do it or who was directly assigned it.",
                  items: { type: "string" }
                },
                task: { type: "string", description: "A concise description of the task." },
                due_type: {
                  type: "string",
                  enum: ["explicit_date", "relative_deadline", "milestone", "unspecified"],
                  description: "explicit_date: a real calendar date or day-of-week was given. relative_deadline: something like '48 hours before X' or 'in 2 days'. milestone: tied to an event with no fixed date, e.g. 'before launch'. unspecified: no timing given at all."
                },
                due_raw: { type: "string", description: "The deadline exactly as stated in the transcript (e.g. 'Friday', 'before launch', '48 hours before reservation'). Use 'none' if due_type is unspecified." },
                priority: { type: "string", enum: ["high", "normal", "low"] },
                status: {
                  type: "string",
                  enum: ["todo", "in_progress", "blocked", "review", "completed", "cancelled"],
                  description: "The current state of the task, based on what the transcript actually says about progress — not a default."
                },
                confidence: {
                  type: "number",
                  description: "0.0-1.0: how explicitly this was stated as a real commitment. 1.0 = someone directly said 'I will do X'. Around 0.5-0.6 = inferred from context or implied by discussion but never directly committed to. Below 0.4 = a stretch inference. This MUST vary per item based on actual phrasing — do not default to one number."
                },
                source: {
                  type: "object",
                  properties: {
                    speaker: { type: "string", description: "The speaker who raised or committed to this task." },
                    quote_context: { type: "string", description: "Short paraphrase (not verbatim quote) of the specific line this came from." }
                  },
                  additionalProperties: true
                }
              },
              required: ["assignees", "task", "status", "confidence", "source"],
              additionalProperties: true
            }
          }
        },
        required: ["action_items"]
      }
    }
  }
];

async function extractItem(toolName, transcript) {
  const activeTools = toolName === "record_rough_notes" ? roughTools : tools;

  const noSpoilerInstruction = "Extract this only from the raw dialogue. If the transcript happens to contain a pre-written summary or action-item list at the end, IGNORE it completely — derive everything yourself from what people actually said.";

  const prompt = toolName === "record_rough_notes"
    ? `${noSpoilerInstruction}\n\nExtract a set of rough notes, observations, and issues from this meeting transcript before assigning tasks:\n\n${transcript}`
    : `${noSpoilerInstruction}\n\nExtract every action item from this meeting transcript. Vary confidence and due_type genuinely per item based on actual phrasing — don't default to the same values across items.\n\n${transcript}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      tools: activeTools,
      tool_choice: { type: "function", function: { name: toolName } }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const toolCall = data.choices[0].message.tool_calls?.[0];

  if (!toolCall) {
    throw new Error("No tool call in response — check the model's raw output:\n" + JSON.stringify(data, null, 2));
  }

  return JSON.parse(toolCall.function.arguments);
}

async function extractActionItems(transcript) {
  const args = await extractItem("record_action_items", transcript);
  return args.action_items;
}

async function extractRoughNotes(transcript) {
  const args = await extractItem("record_rough_notes", transcript);
  return args.rough_notes;
}

function groupByAssignee(items) {
  const grouped = {};
  for (const item of items) {
    for (const assignee of item.assignees || []) {
      if (!grouped[assignee]) grouped[assignee] = [];
      grouped[assignee].push(item);
    }
  }
  return grouped;
}

function parseMeetingDate(text) {
  const match = text.match(/Date:\s*([A-Za-z0-9 ,]+)/i);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getWeekdayIndex(name) {
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return weekdays.indexOf(name.toLowerCase());
}

function getNextWeekdayDate(start, weekdayName) {
  const targetIndex = getWeekdayIndex(weekdayName);
  if (targetIndex === -1) return null;
  const date = new Date(start);
  const currentIndex = date.getDay();
  let delta = targetIndex - currentIndex;
  if (delta <= 0) delta += 7;
  date.setDate(date.getDate() + delta);
  return date;
}

// Only attempt to resolve an actual calendar date when due_type says there
// genuinely is one. Milestones ("before launch") and unspecified items are
// left alone — guessing a date for those is worse than admitting we don't know.
function resolveDue(item, transcript) {
  if (item.due_type === "milestone" || item.due_type === "unspecified") {
    return { resolved: null, raw: item.due_raw };
  }

  const trimmed = (item.due_raw || "").trim();
  if (!trimmed) return { resolved: null, raw: item.due_raw };

  const isoCandidate = new Date(trimmed);
  if (!Number.isNaN(isoCandidate.getTime())) {
    return { resolved: isoCandidate.toISOString().slice(0, 10), raw: trimmed };
  }

  const weekdayMatch = trimmed.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  if (weekdayMatch) {
    const meetingDate = parseMeetingDate(transcript);
    if (meetingDate) {
      const nextDate = getNextWeekdayDate(meetingDate, weekdayMatch[1]);
      if (nextDate) return { resolved: nextDate.toISOString().slice(0, 10), raw: trimmed };
    }
  }

  // Relative deadlines like "48 hours before reservation" can't be resolved
  // without the reservation's own date — leave unresolved rather than guess.
  return { resolved: null, raw: trimmed };
}

function normalizeTask(task, transcript) {
  const { resolved, raw } = resolveDue(task, transcript);
  return {
    ...task,
    due_resolved: resolved, // real ISO date, or null if it can't be genuinely resolved
    due_raw: raw,
    extractedAt: new Date().toISOString() // legitimate: this is when WE ran extraction, not model-invented
  };
}

(async () => {
  console.log(`Reading: ${filePath}\n`);

  const roughNotes = await extractRoughNotes(notes);
  fs.writeFileSync("rough-notes.json", JSON.stringify(roughNotes, null, 2), "utf-8");
  console.log("Saved rough notes to rough-notes.json\n");

  let items = await extractActionItems(notes);
  items = items.map((task) => normalizeTask(task, notes));
  fs.writeFileSync("response.json", JSON.stringify(items, null, 2), "utf-8");
  console.log("Saved action items to response.json\n");

  const grouped = groupByAssignee(items);

  console.log("--- Rough Notes ---");
  roughNotes.forEach((note, index) => {
    console.log(`${index + 1}. ${note.note} (${note.source})`);
  });

  for (const [assignee, tasks] of Object.entries(grouped)) {
    console.log(`\n${assignee}`);
    for (const t of tasks) {
      const dueLabel = t.due_resolved || `${t.due_raw} [${t.due_type}, unresolved]`;
      console.log(`  [${t.priority}] [${t.status}] (conf ${t.confidence}) ${t.task}  — due: ${dueLabel}`);
    }
  }

  console.log("\n--- Raw JSON (this is your Midan API response shape) ---");
  console.log(JSON.stringify(grouped, null, 2));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});