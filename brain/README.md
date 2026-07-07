# Midan Prototype — Action Item Extractor

Tonight's build. Skill learned: **tool use / function calling for structured output.**
Runs on Groq's **free** API — no Claude API spend needed.

## Why this pattern matters

Instead of prompting a model to "return JSON" (unreliable — it can wrap it in
markdown, add commentary, or drift from your schema), you define a *tool* with
an exact JSON schema and force the model to call it via `tool_choice`. The
response then matches your schema every time. This is the backbone of any
"extract structured X from messy text" feature — which is literally Midan's
core loop. Same pattern works identically if you later move this to the
Claude API — only the request/response shape changes slightly.

Docs (Groq, OpenAI-compatible tool calling): https://console.groq.com/docs/tool-use
Docs (same pattern on Claude, for later): https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview

## Run it

```bash
cd midan-prototype
export GROQ_API_KEY=gsk_your-free-key   # get one free at https://console.groq.com/keys
node index.js raw-notes.txt
```

Use `raw-notes.txt` for a real test — it's dialogue only, no pre-written
summary at the bottom. `sample-notes.txt` is the older, easier version; kept
for reference but don't use it to judge extraction quality since it's too easy.

## What changed after the first pass

- **`confidence` and `due_type/due_raw` now have to be earned per item.**
  The model is told explicitly to vary confidence based on how directly
  someone committed to a task ("I'll do X" vs. inferred from discussion) and
  is required to classify due dates as `explicit_date`, `relative_deadline`,
  `milestone`, or `unspecified` — rather than the code silently defaulting
  everything to the same confidence score or leaving deadlines blank.
- **Dropped `createdBy`.** The model was hallucinating this as "whoever ran
  the meeting," which isn't a real signal. `source.speaker` already captures
  who raised the task.
- **`due_resolved` is `null` when it genuinely can't be resolved** (e.g.
  "before launch," or a relative deadline like "48 hours before reservation"
  with no anchor date) instead of guessing. `due_raw` keeps the original
  phrasing so nothing is silently lost.
- **Prompt explicitly tells the model to ignore any pre-written
  summary/action-item block** if one exists in the transcript, so it can't
  just paraphrase an answer key instead of parsing dialogue.

You'll get:
1. A grouped-by-person printout in the terminal
2. Raw JSON at the bottom — this is the shape your Midan API route would return

## Extending this toward real Midan

- Swap `sample-notes.txt` for a real transcript (paste from a Zoom/Meet export,
  or Whisper-transcribed audio)
- Wrap `extractActionItems()` in a Next.js API route (`/api/extract`)
- Add a second tool call chained after this one: `send_reminder` per person,
  using their Slack/email from your Supabase `contacts` table
- Add `tool_choice: { type: "auto" }` instead of forcing the tool once you want
  Claude to decide whether notes even contain action items at all (some
  meetings won't)

## What's NOT here (on purpose, for scope)

- No UI — this is the engine, not the product
- No persistence — nothing writes to Supabase yet
- No error handling for malformed transcripts — add validation before this
  touches a real user's data