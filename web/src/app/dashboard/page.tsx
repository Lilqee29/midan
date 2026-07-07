"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  FileText,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

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

export default function DashboardPage() {
  const router = useRouter();
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

    // Simulate progress while waiting
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: "High", color: "text-green-600" };
    if (confidence >= 0.5) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-red-600" };
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
              Settings
            </Link>
            <span className="text-sm text-muted-foreground">
              {/* User button would go here */}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0D9488]" />
              Paste your meeting notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your meeting notes, transcript, or raw text here...&#10;&#10;Example:&#10;Date: July 7, 2026&#10;Ibrahim: I'll finish the Stripe integration by Friday&#10;Mia: Let me handle the mobile layout fixes&#10;..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {notes.length > 0
                  ? `${notes.split(/\s+/).filter(Boolean).length} words`
                  : "Paste your notes to get started"}
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

            {/* Progress bar */}
            {loading && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzing your meeting notes...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Rough Notes */}
            {result.roughNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0D9488]" />
                    Key Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.roughNotes.map((note, i) => (
                      <div
                        key={i}
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
            )}

            {/* Grouped by Person */}
            <div>
              <h2 className="text-xl font-semibold text-brand-text mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0D9488]" />
                Action Items by Person
              </h2>
              <div className="grid gap-6">
                {Object.entries(result.groupedByPerson).map(
                  ([person, items]) => (
                    <Card key={person}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {person[0]}
                            </div>
                            {person}
                          </span>
                          <Badge variant="secondary">
                            {items.length} task{items.length !== 1 ? "s" : ""}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {items.map((item, i) => {
                            const confidence = getConfidenceLabel(
                              item.confidence
                            );
                            return (
                              <div
                                key={i}
                                className="p-4 bg-white rounded-lg border border-border hover:border-[#0D9488]/30 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    {getStatusIcon(item.status)}
                                    <div>
                                      <p className="font-medium text-sm">
                                        {item.task}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {item.due_resolved || item.due_raw}
                                        </span>
                                        <span>·</span>
                                        <span
                                          className={`font-medium ${confidence.color}`}
                                        >
                                          {confidence.label} confidence
                                        </span>
                                      </div>
                                      {item.source?.quote_context && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">
                                          &ldquo;{item.source.quote_context}
                                          &rdquo;
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    className={getPriorityColor(item.priority)}
                                  >
                                    {item.priority}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-16">
            <Zap className="h-12 w-12 text-[#0D9488]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-brand-text mb-2">
              No extraction yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Paste your meeting notes above and click &ldquo;Extract action
              items&rdquo; to get started. Midan will analyze your text and
              identify tasks, assignees, deadlines, and priorities.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
