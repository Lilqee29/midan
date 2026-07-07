"use client";

import { useState, useEffect, useCallback } from "react";
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
  Quote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { StatusIndicator } from "@/components/status-indicator";

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

const tabTransition = { duration: 0.2, ease: "easeOut" as const };

export default function DashboardPage() {
  const [view, setView] = useState<"history" | "extract">("history");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [notes, setNotes] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setLoadingMeetings(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

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
      toast.success(`Extracted ${data.actionItems.length} action items`);
      fetchMeetings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      clearInterval(progressInterval);
      setExtracting(false);
    }
  }

  function switchView(v: "history" | "extract") {
    setView(v);
    if (v === "history") setResult(null);
  }

  const wordCount = notes.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-brand-text tracking-tight">
              Midan
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-text transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Tab Navigation */}
        <FadeIn>
          <div className="flex items-center gap-2 mb-8">
            <button
              onClick={() => switchView("history")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === "history"
                  ? "bg-[#0D9488] text-white shadow-sm shadow-[#0D9488]/25"
                  : "bg-white text-muted-foreground hover:text-brand-text border border-border hover:border-[#0D9488]/30"
              }`}
            >
              <History className="h-4 w-4" />
              Recent Calls
            </button>
            <button
              onClick={() => switchView("extract")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                view === "extract"
                  ? "bg-[#0D9488] text-white shadow-sm shadow-[#0D9488]/25"
                  : "bg-white text-muted-foreground hover:text-brand-text border border-border hover:border-[#0D9488]/30"
              }`}
            >
              <FileText className="h-4 w-4" />
              Paste Notes
            </button>
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {/* History View */}
          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={tabTransition}
            >
              {/* Extension Active Banner */}
              <Card className="mb-8 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE0em0wLTRWMjhoLTR2MmgxNHptMC00VjI0aC00djJoMTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
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
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Listening
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Section Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-brand-text">
                  Recent Calls
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => switchView("extract")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Extraction
                </Button>
              </div>

              {/* Content */}
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
                            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              ) : meetings.length === 0 ? (
                <FadeIn delay={0.1}>
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-[#0D9488]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Mic className="h-8 w-8 text-[#0D9488]" />
                      </div>
                      <h3 className="text-lg font-semibold text-brand-text mb-2">
                        No meetings yet
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6 leading-relaxed">
                        Install the Chrome extension and join a Google Meet call,
                        or paste notes manually to extract action items.
                      </p>
                      <Button
                        onClick={() => switchView("extract")}
                        className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Extraction
                      </Button>
                    </CardContent>
                  </Card>
                </FadeIn>
              ) : (
                <StaggerChildren className="space-y-3">
                  {meetings.map((meeting) => (
                    <StaggerItem key={meeting.id}>
                      <Link href={`/dashboard/${meeting.id}`}>
                        <Card className="hover:border-[#0D9488]/30 hover:shadow-sm transition-all cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#0D9488]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0D9488]/15 transition-colors">
                                  <Mic className="h-5 w-5 text-[#0D9488]" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-sm text-brand-text">
                                    {meeting.title || "Untitled Meeting"}
                                  </h3>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(meeting.date)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {meeting.itemCount} item
                                {meeting.itemCount !== 1 ? "s" : ""}
                              </Badge>
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

          {/* Paste Notes View */}
          {view === "extract" && (
            <motion.div
              key="extract"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={tabTransition}
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
                    className="min-h-[200px] font-mono text-sm resize-y"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {notes.length > 0
                        ? `${wordCount} word${wordCount !== 1 ? "s" : ""}`
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4"
                    >
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Analyzing your meeting notes...
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-brand-text">
                      {result.actionItems.length} Action Item
                      {result.actionItems.length !== 1 ? "s" : ""}
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

                  <StaggerChildren className="space-y-4">
                    {Object.entries(result.groupedByPerson).map(
                      ([person, items]) => (
                        <StaggerItem key={person}>
                          <Card>
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                  {person[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-sm text-brand-text">
                                    {person}
                                  </span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="text-xs shrink-0"
                                >
                                  {items.length} task
                                  {items.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                {items.map((item, i) => (
                                  <div
                                    key={i}
                                    className="p-4 bg-brand-surface rounded-lg border border-border"
                                  >
                                    <div className="flex items-start gap-3">
                                      <StatusIndicator
                                        status={item.status}
                                        className="mt-0.5 shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-brand-text leading-relaxed">
                                          {item.task}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {item.due_resolved ||
                                              item.due_raw ||
                                              "No deadline"}
                                          </span>
                                          <ConfidenceMeter
                                            confidence={item.confidence}
                                            className="flex-1 min-w-[100px] max-w-[160px]"
                                          />
                                          <Badge
                                            className={`text-xs ${
                                              item.priority === "high"
                                                ? "bg-red-100 text-red-700 border-red-200"
                                                : item.priority === "low"
                                                  ? "bg-gray-100 text-gray-600 border-gray-200"
                                                  : "bg-blue-100 text-blue-700 border-blue-200"
                                            }`}
                                          >
                                            {item.priority}
                                          </Badge>
                                        </div>
                                        {item.source && (
                                          <div className="mt-3 pl-3 border-l-2 border-[#0D9488]/30">
                                            <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                                              <Quote className="h-3 w-3 mt-0.5 shrink-0 text-[#0D9488]/50" />
                                              <span>
                                                <span className="font-medium not-italic text-brand-text">
                                                  {item.source.speaker}:
                                                </span>{" "}
                                                {item.source.quote_context}
                                              </span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
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
                </motion.div>
              )}

              {!result && !extracting && (
                <FadeIn delay={0.1}>
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-[#0D9488]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Mic className="h-8 w-8 text-[#0D9488]" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-text mb-2">
                      Manual extraction
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                      Use this for meetings on platforms other than Google Meet.
                      For Meet calls, the extension handles everything
                      automatically.
                    </p>
                  </div>
                </FadeIn>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Midan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-brand-text transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hover:text-brand-text transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
