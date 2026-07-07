"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Key,
  User,
  Zap,
  Copy,
  RefreshCw,
  ExternalLink,
  Shield,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const mockKey = `midan_${Array.from({ length: 32 }, () =>
        "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
      ).join("")}`;
      setApiKey(mockKey);
      toast.success("API key generated for Chrome extension");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-text tracking-tight">
              Midan
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-brand-text transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and API access
          </p>
        </div>

        {/* Account Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#0D9488]" />
              Account
            </CardTitle>
            <CardDescription>
              Your account information managed by Clerk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserButton />
                <div>
                  <p className="text-sm font-medium text-brand-text">Signed in</p>
                  <p className="text-sm text-muted-foreground">
                    Connected via Clerk
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-text">Plan</p>
                <p className="text-sm text-muted-foreground">Free tier</p>
              </div>
              <Badge className="bg-[#0D9488] text-white">Current</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Chrome Extension API Key Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#0D9488]" />
              Chrome Extension API Key
            </CardTitle>
            <CardDescription>
              Generate an API key to authenticate the Midan Chrome extension
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKey ? (
              <div className="space-y-3">
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm bg-brand-surface"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKey)}
                    className="cursor-pointer shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Keep this key secret. It grants access to your Midan account
                  from the Chrome extension.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateApiKey}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Key
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Key className="h-10 w-10 text-[#0D9488]/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No API key generated yet. Create one to connect the Chrome
                  extension.
                </p>
                <Button
                  onClick={generateApiKey}
                  disabled={loading}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Generate API Key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Stats Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0D9488]" />
              Usage
            </CardTitle>
            <CardDescription>
              Your extraction usage this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-brand-surface rounded-lg">
                <p className="text-2xl font-bold text-brand-text">0</p>
                <p className="text-xs text-muted-foreground mt-1">Extractions</p>
              </div>
              <div className="p-4 bg-brand-surface rounded-lg">
                <p className="text-2xl font-bold text-brand-text">0</p>
                <p className="text-xs text-muted-foreground mt-1">Meetings</p>
              </div>
              <div className="p-4 bg-brand-surface rounded-lg">
                <p className="text-2xl font-bold text-[#0D9488]">10</p>
                <p className="text-xs text-muted-foreground mt-1">Free remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chrome Extension Install Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#0D9488]" />
              Chrome Extension
            </CardTitle>
            <CardDescription>
              Install the Midan Chrome extension to capture meeting transcripts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-text">Status</p>
                <p className="text-sm text-muted-foreground">
                  Extension not yet available
                </p>
              </div>
              <Button variant="outline" disabled className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-red-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-text">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="outline" className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Midan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-brand-text transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-brand-text transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
