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
  Star,
  ChevronRight,
  ArrowUpRight,
  AudioWaveform,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-8 border-brand-teal/20 text-brand-teal bg-brand-teal/5 hover:bg-brand-teal/10 transition-colors cursor-default"
          >
            <Headphones className="h-3 w-3 mr-1.5" />
            Listens so you don&apos;t have to
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-brand-text tracking-tight leading-[1.1]">
            It listens.
            <br />
            <span className="bg-gradient-to-r from-brand-teal to-brand-teal-light bg-clip-text text-transparent">
              You do the work.
            </span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Midan&apos;s Chrome extension listens to your Google Meet calls,
            captures every commitment, and organizes action items by person —
            automatically. No notes. No re-typing. Just done.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-brand-teal hover:bg-brand-teal-dark text-white px-8 cursor-pointer shadow-lg shadow-brand-teal/20 hover:shadow-brand-teal/30 transition-all duration-200"
              >
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="px-8 cursor-pointer border-brand-text/15 hover:border-brand-teal/30 hover:bg-brand-teal/5 transition-all duration-200"
              >
                See how it works
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Hero visual — simulated extension output */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="relative bg-white rounded-2xl border border-border shadow-xl shadow-brand-teal/5 p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">
                  midan — post-meeting summary
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <Users className="h-3 w-3 text-brand-teal" />
                  </span>
                  <div>
                    <p className="text-brand-text font-semibold">Sarah Chen</p>
                    <p className="text-muted-foreground">
                      Finalize Q3 budget draft{" "}
                      <span className="text-brand-orange">by Friday</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <Users className="h-3 w-3 text-brand-teal" />
                  </span>
                  <div>
                    <p className="text-brand-text font-semibold">Marcus Rivera</p>
                    <p className="text-muted-foreground">
                      Send updated API docs to{" "}
                      <span className="text-brand-orange">engineering team</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded bg-brand-teal/10 flex items-center justify-center shrink-0">
                    <Users className="h-3 w-3 text-brand-teal" />
                  </span>
                  <div>
                    <p className="text-brand-text font-semibold">You</p>
                    <p className="text-muted-foreground">
                      Review design mockups{" "}
                      <span className="text-muted-foreground/60">by next Tue</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 border-y border-border bg-white/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
            Trusted by freelancers and small teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 opacity-40">
            {["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Ind."].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg sm:text-xl font-bold text-brand-text/60 tracking-tight"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border-brand-teal/20 text-brand-teal bg-brand-teal/5"
            >
              How it works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
              Three steps. Fully automatic.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Install the extension. Join your call. That&apos;s it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-brand-teal/20 to-transparent" />

            {[
              {
                icon: Headphones,
                step: "1",
                title: "Install & forget",
                desc: "One-click Chrome extension install. It runs quietly in the background during your Google Meet calls.",
              },
              {
                icon: Mic,
                step: "2",
                title: "It listens for you",
                desc: "The extension captures everything said — commitments, deadlines, who said what — all passively.",
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
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-border hover:border-brand-teal/30 hover:shadow-md transition-all duration-300 group"
              >
                <div className="absolute -top-3.5 left-8 w-7 h-7 bg-brand-teal text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-brand-teal/20">
                  {item.step}
                </div>
                <div className="h-12 w-12 rounded-xl bg-brand-teal/10 flex items-center justify-center mb-5 group-hover:bg-brand-teal/15 transition-colors duration-200">
                  <item.icon className="h-6 w-6 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold text-brand-text mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border-brand-teal/20 text-brand-teal bg-brand-teal/5"
            >
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
              Built for how meetings actually work
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Not another note-taking app. Midan captures what matters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: AudioWaveform,
                title: "Auto capture",
                desc: "No buttons to press. The extension listens passively while you focus on the conversation.",
              },
              {
                icon: Users,
                title: "Grouped by person",
                desc: "See exactly what each person committed to, organized in one clean view.",
              },
              {
                icon: Clock,
                title: "Smart deadlines",
                desc: 'Distinguishes explicit dates, relative deadlines ("by Friday"), and milestones — no fake dates.',
              },
              {
                icon: CheckCircle2,
                title: "Confidence scoring",
                desc: "Knows the difference between \"I'll do it\" and \"maybe someone should handle that\".",
              },
              {
                icon: Shield,
                title: "Source tracking",
                desc: "Every action item traces back to who said it and when — full accountability.",
              },
              {
                icon: Zap,
                title: "Priority detection",
                desc: "Automatically categorizes high, normal, and low priority tasks from conversation tone.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group p-6 rounded-2xl border border-border hover:border-brand-teal/30 hover:shadow-sm transition-all duration-300 cursor-default"
              >
                <div className="h-10 w-10 rounded-xl bg-brand-teal/10 flex items-center justify-center mb-4 group-hover:bg-brand-teal/15 transition-colors duration-200">
                  <item.icon className="h-5 w-5 text-brand-teal" />
                </div>
                <h3 className="font-semibold text-brand-text mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 border-brand-teal/20 text-brand-teal bg-brand-teal/5"
            >
              What people say
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-text">
              Teams love the clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I used to spend 20 minutes after every call writing notes. Now Midan does it in seconds. The person-grouping is a game changer.",
                name: "Priya Sharma",
                role: "Product Lead, Baseflow",
                initials: "PS",
              },
              {
                quote:
                  "The confidence scoring is surprisingly accurate. It knows when someone is committed vs. just being polite. That's huge.",
                name: "David Kim",
                role: "Engineering Manager, Relay",
                initials: "DK",
              },
              {
                quote:
                  "Finally something that just works. Installed it, forgot about it, and now I have perfect meeting summaries every time.",
                name: "Elena Vasquez",
                role: "Freelance Consultant",
                initials: "EV",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-2xl p-8 border border-border hover:border-brand-teal/20 transition-all duration-300 cursor-default"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-orange text-brand-orange"
                    />
                  ))}
                </div>
                <p className="text-brand-text text-sm leading-relaxed mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-sm font-semibold text-brand-teal">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-brand-teal to-brand-teal-dark rounded-3xl p-12 sm:p-16 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to stop taking notes?
              </h2>
              <p className="mt-4 text-white/80 text-lg max-w-lg mx-auto">
                Install the extension. Join your next call. Midan handles the
                rest.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-brand-teal hover:bg-white/90 px-10 text-lg cursor-pointer shadow-xl shadow-black/10"
                  >
                    Get started free
                    <ArrowUpRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-brand-teal flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-brand-text">
                  Midan
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                It listens. You do the work.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-brand-text mb-4">
                Product
              </h4>
              <ul className="space-y-2.5">
                {["Features", "How It Works", "Pricing", "Changelog"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-brand-teal transition-colors duration-200 cursor-pointer"
                      >
                        {link}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-brand-text mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                {["About", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-brand-teal transition-colors duration-200 cursor-pointer"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-brand-text mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-brand-teal transition-colors duration-200 cursor-pointer"
                      >
                        {link}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Midan. All rights reserved.
            </p>
            <div className="flex gap-5">
              {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-brand-teal transition-colors duration-200 cursor-pointer"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
