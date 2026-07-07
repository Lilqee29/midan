"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Headphones,
  Mic,
  Zap,
  Clock,
  FileText,
  Loader2,
  Plus,
  History,
  Settings,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { StatusIndicator } from "@/components/status-indicator";

interface ActionItem {
  assignees: string[];
  task: string;
  due_type: string;
  due_raw: string;
  due_resolved: string | null;
  priority: "high" | "normal" | "low";
  status: string;
  confidence: number;
  source: {
    speaker: string;
    quote_context: string;
  };
}

interface RoughNote {
  note: string;
  source: string;
}

interface ExtractionResult {
  roughNotes: RoughNote[];
  actionItems: ActionItem[];
  groupedByPerson: Record<string, ActionItem[]>;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  peopleCount: number;
  itemCount: number;
}

// Mock meetings data
const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Sprint Planning — Week 28",
    date: "Today, 2:30 PM",
    peopleCount: 4,
    itemCount: 6,
  },
  {
    id: "2",
    title: "Client Review — Restaurant App",
    date: "Yesterday, 10:00 AM",
    peopleCount: 3,
    itemCount: 4,
  },
  {
    id: "3",
    title: "Team Standup",
    date: "Jul 5, 9:15 AM",
    peopleCount: 5,
    itemCount: 3,
  },
];

export default function DashboardPage() {
  const [view, setView] = useState<"history" | "extract">("history");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!notes.trim()) {
      toast.error("Please paste your meeting notes first");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Extraction failed");
      }

      const data: ExtractionResult = await response.json();
      setProgress(100);
      setResult(data);
      toast.success(
        `Extracted ${data.actionItems.length} action items from ${Object.keys(data.groupedByPerson).length} people`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Extraction failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "low":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-text tracking-tight">
              Midan
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-brand-text transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              view === "history"
                ? "bg-[#0D9488] text-white"
                : "bg-white text-muted-foreground hover:text-brand-text border border-border"
            }`}
          >
            <History className="h-4 w-4" />
            Recent Calls
          </button>
          <button
            onClick={() => setView("extract")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              view === "extract"
                ? "bg-[#0D9488] text-white"
                : "bg-white text-muted-foreground hover:text-brand-text border border-border"
            }`}
          >
            <FileText className="h-4 w-4" />
            Paste Notes
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* History View */}
          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Status Banner */}
              <Card className="mb-6 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Headphones className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          Extension Active
                        </h3>
                        <p className="text-white/80 text-sm">
                          Listening for Google Meet calls
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Listening
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Meetings */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-text">
                  Recent Calls
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setView("extract")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Extraction
                </Button>
              </div>

              <StaggerChildren className="space-y-3">
                {mockMeetings.map((meeting) => (
                  <StaggerItem key={meeting.id}>
                    <Card className="hover:border-[#0D9488]/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center">
                              <Mic className="h-5 w-5 text-[#0D9488]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">
                                {meeting.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {meeting.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meeting.peopleCount}
                            </span>
                            <Badge variant="secondary">
                              {meeting.itemCount} items
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </motion.div>
          )}

          {/* Manual Extract View */}
          {view === "extract" && (
            <motion.div
              key="extract"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0D9488]" />
                    Paste meeting notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your meeting notes, transcript, or raw text here...&#10;&#10;The extension handles this automatically for Google Meet calls. Use this for other platforms or manual input."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {notes.length > 0
                        ? `${notes.split(/\s+/).filter(Boolean).length} words`
                        : "Fallback for non-Meet calls"}
                    </p>
                    <Button
                      onClick={handleExtract}
                      disabled={loading || !notes.trim()}
                      className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Extract action items
                        </>
                      )}
                    </Button>
                  </div>

                  {loading && (
                    <div className="mt-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzing your meeting notes...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <div className="space-y-6">
                  {result.roughNotes.length > 0 && (
                    <FadeIn>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#0D9488]" />
                            Key Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <StaggerChildren className="space-y-3">
                            {result.roughNotes.map((note, i) => (
                              <StaggerItem key={i}>
                                <div className="p-3 bg-brand-surface rounded-lg border border-border">
                                  <p className="text-sm">{note.note}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    — {note.source}
                                  </p>
                                </div>
                              </StaggerItem>
                            ))}
                          </StaggerChildren>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )}

                  <div>
                    <FadeIn>
                      <h2 className="text-xl font-semibold text-brand-text mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0D9488]" />
                        Action Items by Person
                      </h2>
                    </FadeIn>
                    <StaggerChildren className="grid gap-4">
                      {Object.entries(result.groupedByPerson).map(
                        ([person, items]) => (
                          <StaggerItem key={person}>
                            <Card>
                              <CardHeader className="bg-brand-surface/50 py-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                  <span className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                      {person[0]}
                                    </div>
                                    {person}
                                  </span>
                                  <Badge variant="secondary">
                                    {items.length} task
                                    {items.length !== 1 ? "s" : ""}
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="pt-3">
                                <div className="space-y-2">
                                  {items.map((item, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-white rounded-lg border border-border hover:border-[#0D9488]/30 transition-colors"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2 flex-1">
                                          <StatusIndicator
                                            status={item.status}
                                            className="mt-0.5"
                                          />
                                          <div className="flex-1">
                                            <p className="font-medium text-sm">
                                              {item.task}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {item.due_resolved ||
                                                  item.due_raw}
                                              </span>
                                              <ConfidenceMeter
                                                confidence={item.confidence}
                                                className="flex-1 max-w-[120px]"
                                              />
                                            </div>
                                            {item.source?.quote_context && (
                                              <p className="text-xs text-muted-foreground mt-1.5 italic border-l-2 border-[#0D9488] pl-2">
                                                &ldquo;
                                                {item.source.quote_context}
                                                &rdquo;
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <Badge
                                          className={getPriorityColor(
                                            item.priority
                                          )}
                                        >
                                          {item.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </StaggerItem>
                        )
                      )}
                    </StaggerChildren>
                  </div>
                </div>
              )}

              {!result && !loading && (
                <div className="text-center py-12">
                  <Mic className="h-12 w-12 text-[#0D9488]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-brand-text mb-2">
                    Manual extraction
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Use this for meetings on platforms other than Google Meet.
                    For Meet calls, the extension handles everything
                    automatically.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
