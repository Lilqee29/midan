"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-brand-text tracking-tight">
              Midan
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            Create an account to start extracting action items
          </p>
        </div>
        <SignUp
          routing="path"
          path="/signup"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-[#0D9488] hover:bg-[#0F766E] transition-colors",
            },
          }}
        />
      </div>
    </div>
  );
}
