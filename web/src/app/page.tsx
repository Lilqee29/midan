import Link from "next/link";
import {
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
  Mic,
  Clock,
  Shield,
  Headphones,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Headphones className="h-3 w-3 mr-1" />
            Listens so you don&apos;t have to
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold text-brand-text tracking-tight leading-tight">
            It listens.
            <br />
            <span className="text-[#0D9488]">You do the work.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Midan&apos;s Chrome extension listens to your Google Meet calls,
            captures every commitment, and organizes action items by person —
            automatically. No notes. No re-typing. Just done.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-8 cursor-pointer"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 cursor-pointer">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
              Three steps. Fully automatic.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Install the extension. Join your call. That&apos;s it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Headphones,
                step: "1",
                title: "Install & forget",
                desc: "One-click Chrome extension install. It runs in the background during your Google Meet calls.",
              },
              {
                icon: Mic,
                step: "2",
                title: "It listens for you",
                desc: "The extension captures everything said in the meeting — commitments, deadlines, who said what.",
              },
              {
                icon: Sparkles,
                step: "3",
                title: "Auto-organized results",
                desc: "After the call ends, Midan extracts and organizes action items by person with priority and deadlines.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#0D9488] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <item.icon className="h-10 w-10 text-[#0D9488] mb-4" />
                <h3 className="text-xl font-semibold text-brand-text mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
              Built for how meetings actually work
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Not another note-taking app. Midan captures what matters.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: "Automatic capture",
                desc: "No buttons to press. The extension listens passively while you focus on the conversation.",
              },
              {
                icon: Users,
                title: "Grouped by person",
                desc: "See exactly what each person committed to, organized in one view.",
              },
              {
                icon: Clock,
                title: "Smart deadlines",
                desc: "Distinguishes explicit dates, relative deadlines, and milestones — no fake dates.",
              },
              {
                icon: CheckCircle2,
                title: "Confidence scoring",
                desc: "Knows the difference between 'I'll do it' and 'maybe someone should handle that'.",
              },
              {
                icon: Shield,
                title: "Source tracking",
                desc: "Every action item traces back to who said it and when.",
              },
              {
                icon: Zap,
                title: "Priority detection",
                desc: "Automatically categorizes high, normal, and low priority tasks.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border hover:border-[#0D9488]/30 transition-colors"
              >
                <item.icon className="h-8 w-8 text-[#0D9488] mb-3" />
                <h3 className="font-semibold text-brand-text mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
            Ready to stop taking notes?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Install the extension. Join your next call. Midan handles the rest.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white px-10 text-lg cursor-pointer"
              >
                Get started free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
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
