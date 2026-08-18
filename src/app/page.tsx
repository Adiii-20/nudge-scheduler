/* eslint-disable */
import Link from "next/link";
import {
  ArrowRight, Zap, Users, LayoutGrid, Bell, ChevronRight,
  CheckCircle2, Star, Shield, Sparkles, Target, Clock, TrendingUp,
  Plus, MoreHorizontal,
} from "lucide-react";

/* ─── Static data ─── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Teams", href: "#teams" },
];

const FEATURES = [
  { icon: LayoutGrid, color: "blue",    title: "Kanban Boards",    desc: "Visualise work across every stage. Drag, drop, done. Boards that adapt to how your team actually works.", badge: "Core" },
  { icon: Bell,       color: "violet",  title: "Smart Nudges",     desc: "Intelligent reminders that surface the right work at the right time — without the noise of constant pings.", badge: "AI-powered" },
  { icon: Users,      color: "emerald", title: "Team Workspaces",  desc: "Invite members, assign roles, and keep everyone aligned inside a shared workspace with full activity history.", badge: "Collaboration" },
  { icon: Shield,     color: "amber",   title: "Secure Auth",      desc: "Supabase-powered authentication with session management baked in. Your data stays yours.", badge: "Security" },
  { icon: TrendingUp, color: "blue",    title: "Activity Trail",   desc: "Every action logged. See who moved what, when, and why. Full transparency without micromanagement.", badge: "Audit" },
  { icon: Target,     color: "violet",  title: "Board Analytics",  desc: "Task counts, velocity metrics, and member contributions — the numbers that actually matter for delivery.", badge: "Insights" },
];

const STEPS = [
  { n: "01", title: "Create your workspace", desc: "Sign up and spin up a workspace in under 30 seconds. No credit card, no onboarding calls." },
  { n: "02", title: "Build your boards",     desc: "Add columns, create tasks, and customise your flow to match exactly how your team operates." },
  { n: "03", title: "Invite your team",      desc: "Send invitations, assign roles, and start collaborating. Everyone's aligned from day one." },
];

const BOARD_COLUMNS = [
  {
    label: "Backlog", color: "#64748b",
    cards: [
      { title: "Redesign onboarding flow",  tag: "Design",      tagColor: "#7c3aed", avatar: "AR", priority: "medium" },
      { title: "Write API documentation",   tag: "Docs",        tagColor: "#059669", avatar: "MK", priority: "low" },
    ],
  },
  {
    label: "In Progress", color: "#2563eb",
    cards: [
      { title: "Implement auth middleware", tag: "Engineering", tagColor: "#2563eb", avatar: "SJ", priority: "high" },
      { title: "Kanban drag & drop UI",    tag: "Frontend",    tagColor: "#7c3aed", avatar: "AR", priority: "high" },
    ],
  },
  {
    label: "Review", color: "#d97706",
    cards: [
      { title: "Email notification templates", tag: "Design", tagColor: "#7c3aed", avatar: "MK", priority: "medium" },
    ],
  },
  {
    label: "Done", color: "#059669",
    cards: [
      { title: "Database schema indexes", tag: "Engineering", tagColor: "#2563eb", avatar: "SJ", priority: "low" },
      { title: "Activity log feed",       tag: "Frontend",    tagColor: "#7c3aed", avatar: "AR", priority: "low"  },
    ],
  },
];

const PRIORITY_DOT: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#94a3b8" };

const AVATARS = [
  { initials: "AR", bg: "#dbeafe", fg: "#1d4ed8" },
  { initials: "MK", bg: "#ede9fe", fg: "#6d28d9" },
  { initials: "SJ", bg: "#d1fae5", fg: "#065f46" },
  { initials: "TL", bg: "#fef3c7", fg: "#92400e" },
];

const LOGOS = ["Vercel", "Linear", "Notion", "Figma", "GitHub", "Stripe"];

const TESTIMONIALS = [
  { quote: "Nudge replaced three tools for us. Our sprint planning went from 2 hours to 20 minutes.", name: "Priya Mehta",     role: "Engineering Lead, Flux",  avatar: "PM", bg: "#dbeafe", fg: "#1d4ed8" },
  { quote: "The activity trail alone is worth it. We finally have full visibility without Slack spam.", name: "James Okafor",  role: "Product Manager, Helix",  avatar: "JO", bg: "#d1fae5", fg: "#065f46" },
  { quote: "Set up our entire workspace in 10 minutes. Clean, fast, no fluff.",                        name: "Sofia Lindqvist", role: "CTO, Meridian",          avatar: "SL", bg: "#ede9fe", fg: "#6d28d9" },
];

/* ─── Helpers ─── */

function ColorTag({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: color + "18", color }}>
      {label}
    </span>
  );
}

function PriorityDot({ level }: { level: string }) {
  return <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_DOT[level] ?? "#94a3b8" }} />;
}

function FeatureBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${map[color] ?? "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

const ICON_BG: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600",
};

/* ─── Page ─── */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Zap className="h-3.5 w-3.5 text-white" fill="white" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
              Nudge
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                {label}
              </a>
            ))}
          </nav>

          {/* Right CTAs — collapse gracefully on mobile */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
              Sign in
            </Link>
            <Link href="/signup" className="flex items-center gap-1.5 rounded-lg bg-[#0052cc] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#003d99] transition-all">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Background blobs — hidden on very small screens to keep it clean */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-[0.06] animate-blob hidden sm:block"
          style={{ background: "radial-gradient(circle, #2563eb, #7c3aed)" }} />
        <div className="pointer-events-none absolute -top-16 -right-48 h-[400px] w-[400px] rounded-full opacity-[0.05] animate-blob delay-3000 hidden sm:block"
          style={{ background: "radial-gradient(circle, #7c3aed, #059669)" }} />

        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-24 pb-6 sm:pb-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

            {/* ── Left: Copy ── */}
            <div className="w-full">
              <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                Capture, organize, and tackle your to-dos from anywhere.
              </h1>

              <p className="mb-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
                Escape the clutter and chaos — unleash your productivity with Nudge.
              </p>

              {/* Email + CTA — stacked on mobile, row on sm+ */}
              <div className="flex flex-col sm:flex-row gap-3 w-full mb-5">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm transition"
                />
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#0052cc] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#003d99] transition-all hover:shadow-md whitespace-nowrap"
                >
                  Sign up — it&apos;s free
                </Link>
              </div>

              {/* Guest evaluator box */}
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                <h3 className="font-bold text-violet-900 text-sm mb-1">Here to review the assignment?</h3>
                <p className="text-violet-700 text-xs mb-3 leading-relaxed">Jump straight to the test workspace loaded with dynamic lists, labels, and checklists.</p>
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-all"
                >
                  <Users className="h-4 w-4" />
                  Login as Guest Evaluator
                </Link>
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                By entering your email you agree to our{" "}
                <span className="text-[#0052cc] hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>

            {/* ── Right: Board Preview ── */}
            {/* Hidden on mobile (below sm) — shown as a simplified scroll card on sm, full on lg */}
            <div className="relative w-full hidden sm:block lg:pl-4">
              {/* Floating stat — top-left. Use absolute only on lg where there's room */}
              <div className="hidden lg:block absolute -left-4 top-8 z-10 rounded-xl bg-white/80 backdrop-blur-md p-3 shadow-lg border border-white animate-card-float">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">12 tasks done</p>
                    <p className="text-[10px] text-slate-500">this sprint</p>
                  </div>
                </div>
              </div>

              {/* Floating alert — top-right */}
              <div className="hidden lg:block absolute -right-2 top-6 z-10 rounded-xl bg-white/80 backdrop-blur-md p-3 shadow-lg border border-white animate-card-float-2">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse-ring h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-xs font-medium text-slate-700">SJ moved a card</p>
                </div>
              </div>

              {/* Board itself */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#f1f5f9] shadow-2xl shadow-slate-900/10">
                {/* macOS-style header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-sm font-semibold text-slate-700">Product Roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {AVATARS.slice(0, 3).map((a) => (
                        <span key={a.initials} className="grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[9px] font-bold" style={{ background: a.bg, color: a.fg }}>
                          {a.initials}
                        </span>
                      ))}
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* Columns — horizontally scrollable */}
                <div className="flex gap-3 overflow-x-auto p-4 pb-5 scrollbar-hide">
                  {BOARD_COLUMNS.map((col) => (
                    <div key={col.label} className="flex-shrink-0 w-44">
                      <div className="mb-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                          <span className="text-xs font-semibold text-slate-600">{col.label}</span>
                          <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-500">{col.cards.length}</span>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div className="space-y-2">
                        {col.cards.map((card) => (
                          <div key={card.title} className="board-card cursor-grab rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                            <p className="mb-2 text-[11px] font-medium leading-snug text-slate-700">{card.title}</p>
                            <div className="flex items-center justify-between">
                              <ColorTag label={card.tag} color={card.tagColor} />
                              <div className="flex items-center gap-1.5">
                                <PriorityDot level={card.priority} />
                                <span className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold"
                                  style={{ background: AVATARS.find(a => a.initials === card.avatar)?.bg ?? "#e2e8f0", color: AVATARS.find(a => a.initials === card.avatar)?.fg ?? "#475569" }}>
                                  {card.avatar}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-400 hover:bg-white hover:text-slate-500 transition-all">
                          <Plus className="h-3 w-3" /> Add card
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom floating card */}
              <div className="hidden lg:block absolute -bottom-4 right-8 z-10 rounded-xl bg-white/80 backdrop-blur-md px-3.5 py-2.5 shadow-lg border border-white animate-float-delayed delay-1000">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-violet-600" />
                  <p className="text-xs font-medium text-slate-700">Sprint ends in <span className="text-violet-600 font-semibold">3 days</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="border-t border-slate-100 bg-white/60 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Join millions of users globally
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {LOGOS.map((name) => (
                <span key={name} className="text-base sm:text-xl font-bold tracking-tight text-slate-300 hover:text-slate-500 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 sm:py-24 bg-[#f4f5f7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Everything you need</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
              Less friction. More flow.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-slate-500 leading-relaxed">
              Nudge strips away the bloat and gives your team exactly what you need to plan, execute, and ship.
            </p>
          </div>

          {/* 1-col mobile → 2-col sm → 3-col lg */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, color, title, desc, badge }) => (
              <div key={title} className="feature-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ICON_BG[color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <FeatureBadge label={badge} color={color} />
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative overflow-hidden border-y border-slate-200 bg-slate-900 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-800 bg-blue-950 px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">3 steps to clarity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              Up and running in minutes.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-slate-400 leading-relaxed">
              No lengthy setup. No onboarding videos. Just three steps and your team is moving.
            </p>
          </div>

          {/* 1-col mobile → 3-col md */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 sm:p-6 backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl font-black text-blue-600/30 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{n}</span>
                <div className="mt-3 mb-2 h-px bg-slate-700" />
                <h3 className="mb-2 text-base font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="teams" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Loved by teams</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
              Real teams, real results.
            </h2>
          </div>

          {/* 1-col mobile → 3-col md */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, avatar, bg, fg }) => (
              <div key={name} className="feature-card rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600 italic">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold shrink-0" style={{ background: bg, color: fg }}>{avatar}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-[#0052cc]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Get started with Nudge today
          </h2>
          <p className="mb-8 text-base text-white/70 leading-relaxed">
            Join thousands of teams using Nudge to plan work, stay aligned, and ship without the chaos.
          </p>

          {/* Stacked on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 rounded-lg border-2 border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-white focus:outline-none"
            />
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#003d99] px-6 py-3 text-sm font-bold text-white hover:bg-[#002966] transition-colors whitespace-nowrap"
            >
              Sign up — it&apos;s free!
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/50">No credit card required · Free for small teams</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#172b4d] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
          {/* 2-col on mobile, 4-col on md */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
                  <LayoutGrid className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>Nudge</span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed">A focused workspace for boards, tasks, and activity.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">About Nudge</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">What&apos;s behind the boards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign up free</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2025 Nudge Scheduler. All rights reserved.</p>
            <p>Built with Next.js &amp; Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
