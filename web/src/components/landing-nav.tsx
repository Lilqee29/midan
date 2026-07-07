"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-text tracking-tight">
            Midan
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-brand-text transition-colors"
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
