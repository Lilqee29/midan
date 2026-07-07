"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";

interface Meeting {
  id: string;
  title: string | null;
  date: string;
  itemCount: number;
}

interface ExtractionResult {
  roughNotes: { note: string; source: string }[];
  actionItems: {
    task: string;
    assignees: string[];
    priority: string;
    status: string;
    confidence: number;
    due_raw: string;
    due_resolved: string | null;
    source: { speaker: string; quote_context: string } | null;
  }[];
  groupedByPerson: Record<string, ExtractionResult["actionItems"]>;
}

export default function DashboardPage() {
  const [view, setView] = useState<"history" | "extract">("history");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [notes, setNotes] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoadingMeetings(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  async function handleExtract() {
    if (!notes.trim()) {
      toast.error("Please paste your meeting notes first");
      return;
    }

    setExtracting(true);
    setProgress(0);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Extraction failed");
      }

      const data: ExtractionResult = await res.json();
      setProgress(100);
      setResult(data);
      toast.success(
        `Extracted ${data.actionItems.length} action items`
      );
      // Refresh meetings list
      fetchMeetings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      clearInterval(progressInterval);
      setExtracting(false);
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
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => { setView("history"); setResult(null); }}
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

              {loadingMeetings ? (
                <StaggerChildren className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <StaggerItem key={i}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2 animate-pulse" />
                              <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              ) : meetings.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Mic className="h-12 w-12 text-[#0D9488]/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-brand-text mb-2">
                      No meetings yet
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                      Install the Chrome extension and join a Google Meet call, or
                      paste notes manually.
                    </p>
                    <Button
                      onClick={() => setView("extract")}
                      className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Extraction
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <StaggerChildren className="space-y-3">
                  {meetings.map((meeting) => (
                    <StaggerItem key={meeting.id}>
                      <Link href={`/dashboard/${meeting.id}`}>
                        <Card className="hover:border-[#0D9488]/30 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center">
                                  <Mic className="h-5 w-5 text-[#0D9488]" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-sm">
                                    {meeting.title || "Untitled Meeting"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(meeting.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">
                                  {meeting.itemCount} items
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              )}
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
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#0D9488]" />
                    <h3 className="font-semibold text-brand-text">
                      Paste meeting notes
                    </h3>
                  </div>
                  <Textarea
                    placeholder={"Paste your meeting notes, transcript, or raw text here...\n\nThe extension handles this automatically for Google Meet calls. Use this for other platforms or manual input."}
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
                      disabled={extracting || !notes.trim()}
                      className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
                    >
                      {extracting ? (
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

                  {extracting && (
                    <div className="mt-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzing your meeting notes...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-brand-text">
                      {result.actionItems.length} Action Items
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResult(null);
                        setNotes("");
                      }}
                      className="cursor-pointer"
                    >
                      New Extraction
                    </Button>
                  </div>

                  <StaggerChildren className="grid gap-4">
                    {Object.entries(result.groupedByPerson).map(
                      ([person, items]) => (
                        <StaggerItem key={person}>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {person[0]}
                                </div>
                                <span className="font-medium text-sm">
                                  {person}
                                </span>
                                <Badge variant="secondary" className="ml-auto">
                                  {items.length} task
                                  {items.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="p-3 bg-brand-surface rounded-lg border border-border"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">
                                          {item.task}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.due_resolved || item.due_raw || "No deadline"}
                                          </span>
                                          <span className="font-medium text-[#0D9488]">
                                            {Math.round(item.confidence * 100)}% confident
                                          </span>
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
                      )
                    )}
                  </StaggerChildren>
                </div>
              )}

              {!result && !extracting && (
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
