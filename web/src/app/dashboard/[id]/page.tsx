"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  FileText,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { StatusIndicator } from "@/components/status-indicator";

interface ActionItem {
  id: string;
  assignees: string[];
  task: string;
  due_type: string | null;
  due_raw: string | null;
  due_resolved: string | null;
  priority: "high" | "normal" | "low";
  status: string;
  confidence: number;
  source: {
    speaker: string;
    quote_context: string;
  } | null;
}

interface RoughNote {
  id: string;
  note: string;
  source: string;
}

interface MeetingData {
  meeting: {
    id: string;
    title: string | null;
    raw_notes: string;
    created_at: string;
  };
  actionItems: ActionItem[];
  roughNotes: RoughNote[];
  groupedByPerson: Record<string, ActionItem[]>;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMeeting();
  }, [params.id]);

  async function fetchMeeting() {
    try {
      const res = await fetch(`/api/meetings/${params.id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const meetingData = await res.json();
      setData(meetingData);
    } catch (error) {
      console.error("Failed to fetch meeting:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this meeting and all its action items?")) return;

    setDeleting(true);
    try {
      await fetch(`/api/meetings/${params.id}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    } finally {
      setDeleting(false);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "low":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface">
        <header className="border-b border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-brand-text tracking-tight">
                Midan
              </span>
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0D9488]" />
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-text tracking-tight">
              Midan
            </span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-text mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to meetings
        </Link>

        <FadeIn>
          {/* Meeting Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-text">
              {data.meeting.title || "Untitled Meeting"}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                {new Date(data.meeting.created_at).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>·</span>
              <span>
                {data.actionItems.length} action item
                {data.actionItems.length !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                {Object.keys(data.groupedByPerson).length} people
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-brand-text">
                  {data.actionItems.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Items
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#0D9488]">
                  {data.actionItems.filter((i) => i.priority === "high").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  High Priority
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#F97316]">
                  {
                    data.actionItems.filter(
                      (i) => i.status === "todo" || i.status === "in_progress"
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Open Items
                </p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Rough Notes */}
        {data.roughNotes.length > 0 && (
          <FadeIn delay={0.15}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-[#0D9488]" />
                  Key Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.roughNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-brand-surface rounded-lg border border-border"
                    >
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {note.source}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Grouped by Person */}
        <FadeIn delay={0.2}>
          <h2 className="text-lg font-semibold text-brand-text mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#0D9488]" />
            Action Items by Person
          </h2>
        </FadeIn>

        <StaggerChildren className="grid gap-4">
          {Object.entries(data.groupedByPerson).map(([person, items]) => (
            <StaggerItem key={person}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {person[0]}
                    </div>
                    <span className="font-medium">{person}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {items.length} task{items.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-brand-surface rounded-lg border border-border hover:border-[#0D9488]/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            <StatusIndicator
                              status={item.status}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.task}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {item.due_resolved || item.due_raw || "No deadline"}
                                </span>
                                <ConfidenceMeter
                                  confidence={item.confidence}
                                  className="flex-1 max-w-[120px]"
                                />
                              </div>
                              {item.source?.quote_context && (
                                <p className="text-xs text-muted-foreground mt-1.5 italic border-l-2 border-[#0D9488] pl-2">
                                  &ldquo;{item.source.quote_context}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </main>
    </div>
  );
}
