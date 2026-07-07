import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@/components/clerk-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Midan — Meeting Notes to Action Items",
  description:
    "Turn meeting notes into structured, per-person action items automatically. No more lost commitments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {children}
          <Toaster position="top-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
