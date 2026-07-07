# Midan — Product Requirements Document

## Objective

Midan turns meeting notes/transcripts into structured, per-person action
items automatically — closing the gap between "what got discussed" and
"what actually gets done." That's the whole product. Everything else below
serves that one job.

## Problem

Meetings generate commitments that die in scattered notes, Slack threads, or
nobody's head. Freelancers and small teams don't have a dedicated PM to chase
people down afterward — action items get lost, forgotten, or misassigned,
and someone has to manually re-read notes and re-type a task list.

## Target user

**Primary:** solo freelancers and small teams (2–6 people) running client or
internal syncs with no dedicated ops/PM person.

**Secondary (stretch, not MVP):** a companion piece to Setu, as part of a
"solo-professional OS" — Setu handles the project/invoicing side, Proof
handles the on-site job-proof side, Midan handles the meeting-follow-up side.
Don't build for this yet; it's a future integration angle, not a reason to
scope-creep the MVP.

## Core value prop

Paste meeting notes or a transcript → get action items automatically
extracted, grouped by person, with due dates, priority, and status —
instead of manually re-reading and re-typing them into a task list.

## MVP scope

**Input:** paste raw text. (Transcript upload / audio-to-text is later, not MVP.)

**Extraction engine** — validated tonight via a working prototype (tool-calling
on Groq's free tier, portable to Claude API later without changing the shape):
- `assignees` — array, supports shared ownership of a task
- `task` — concise description
- `due_type` + `due_raw` — one of `explicit_date` / `relative_deadline` /
  `milestone` / `unspecified`. No guessing a fake date when one can't be
  genuinely resolved (e.g. "before launch" stays unresolved, not invented).
- `priority` — high / normal / low
- `status` — todo / in_progress / blocked / review / completed / cancelled
- `confidence` — must genuinely vary per item based on how directly someone
  committed to it, not a default value stamped on everything
- `source` — speaker + short context, so a user can trace a task back to
  where it was actually said

**Output:** grouped-by-person list. JSON export only for MVP — no UI polish yet.

**No auth, no persistence, no accounts.** MVP is proving the extraction is
good enough to trust, not building a product shell around it.

## Out of scope (explicitly, so it doesn't creep in)

- Real-time transcription / audio input
- Calendar or Slack integration
- Team accounts, multi-user permissions
- Mobile app
- Any billing/monetization — too early to matter

## Success metric

One real meeting, run by an actual person (not you testing on a sample
file), produces extracted action items accurate enough that they'd use the
output instead of manually writing their own task list. That's the bar.
Not "does the JSON look right" — does a real user trust it.

## Known risk — be honest with yourself here

This is your fourth-plus SaaS-shaped idea in flight (Setu, Proof, ComptaFlow,
Stash, now Midan). The pattern that's actually held you back before was never
build capability — it's distribution. You have a working extraction engine
as of tonight. The real next step isn't more schema refinement — it's getting
ONE real transcript from someone who isn't you, running it through, and
seeing if the output survives contact with a real messy meeting. If you keep
polishing the extraction engine instead of doing that, this becomes another
demo instead of another shipped thing.