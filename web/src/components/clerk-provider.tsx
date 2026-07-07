"use client";

import { ClerkProvider as NextClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <NextClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: "#0D9488",
          colorBackground: "#ffffff",
          borderRadius: "0.625rem",
        },
        elements: {
          formButtonPrimary:
            "bg-[#0D9488] hover:bg-[#0F766E] transition-colors",
          card: "shadow-lg",
        },
      }}
    >
      {children}
    </NextClerkProvider>
  );
}
