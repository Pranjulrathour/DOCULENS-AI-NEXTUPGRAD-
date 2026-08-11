import Link from "next/link";
import {
  FileSearch,
  ArrowLeftRight,
  ShieldCheck,
  ScanEye,
  ArrowRight,
  Sparkles,
  FileText,
  Eye,
  Layers,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    href: "/analyze",
    title: "Analyze",
    subtitle: "Any business document",
    description:
      "Upload an invoice, contract, PO, or regulatory filing. DocuLens classifies it, extracts every key field, and writes a plain-language summary — in seconds.",
    accent: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    lightText: "text-blue-600",
    cta: "Analyze a Document",
  },
  {
    icon: ArrowLeftRight,
    href: "/compare",
    title: "Compare",
    subtitle: "Invoice ↔ Purchase Order",
    description:
      "Paste in an invoice and its matching PO. The engine runs a deterministic field-by-field comparison and surfaces every mismatch — no hallucinations.",
    accent: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50",
    lightText: "text-violet-600",
    cta: "Compare Documents",
  },
  {
    icon: ShieldCheck,
    href: "/compliance",
    title: "Compliance",
    subtitle: "Your rules, plain English",
    description:
      "Write your compliance requirements in plain English — one per line. DocuLens checks the document against each rule and explains every pass and fail.",
    accent: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    lightText: "text-emerald-600",
    cta: "Run Compliance Review",
  },
];

const STEPS = [
  { icon: FileText,    step: "01", title: "Upload",      desc: "Drop in any PDF, DOCX, XLSX, or image." },
  { icon: Eye,         step: "02", title: "Classify",    desc: "AI identifies the document type automatically." },
  { icon: Layers,      step: "03", title: "Extract",     desc: "Every key field becomes clean, structured data." },
  { icon: CheckCircle2,step: "04", title: "Verify",      desc: "Mismatches and compliance gaps surface instantly." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col mesh-bg">
      {/* ── Glass Nav ────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-ai">
                <ScanEye className="size-4 text-white" />
              </div>
              <span className="font-extrabold text-[17px] gradient-text tracking-tight">
                DocuLens AI
              </span>
            </div>

            {/* Nav links — desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {FEATURES.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  {f.title}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <Link
              href="/analyze"
              className="gradient-brand text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-ai flex items-center gap-2"
            >
              <Sparkles className="size-3.5" />
              Start Analyzing
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-16 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">
              Document Intelligence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] gradient-hero-text mb-6">
            See. Extract.<br className="hidden sm:block" /> Verify.
          </h1>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
            Turn complex business documents into structured insights, invoice-PO
            comparisons, and compliance checks — powered by AI, delivered in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/analyze"
              className="gradient-brand text-white font-bold px-7 py-3.5 rounded-2xl hover:opacity-90 transition-opacity shadow-ai text-base flex items-center gap-2"
            >
              Analyze a Document
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/compare"
              className="glass-card font-bold px-7 py-3.5 rounded-2xl text-foreground hover:bg-white/95 transition-colors text-base border border-border shadow-card"
            >
              Compare Invoice ↔ PO
            </Link>
          </div>

          {/* Supported doc types */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {["Invoices", "Purchase Orders", "Contracts", "Regulatory Filings", "Images (OCR)"].map((t) => (
              <span
                key={t}
                className="text-xs font-semibold text-muted-foreground bg-muted/80 rounded-full px-3 py-1"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, href, title, subtitle, description, accent, lightBg, lightText, cta }) => (
              <div
                key={title}
                className="glass-card rounded-2xl p-6 shadow-card-md hover:shadow-card-lg transition-shadow group flex flex-col"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${lightBg} flex items-center justify-center mb-4`}>
                  <Icon className={`size-5 ${lightText}`} />
                </div>

                <div className="flex-1">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${lightText}`}>
                    {subtitle}
                  </p>
                  <h3 className="text-lg font-extrabold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>

                <Link
                  href={href}
                  className={`mt-5 flex items-center gap-2 text-sm font-bold ${lightText} group-hover:gap-3 transition-all`}
                >
                  {cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="border-t border-border/60 bg-white/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                From upload to insight in four steps
              </h2>
              <p className="mt-2 text-muted-foreground">
                No configuration required. Every step is AI-powered and fully explained.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STEPS.map(({ icon: Icon, step, title, desc }, i) => (
                <div key={title} className="flex flex-col gap-3 relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-[-calc(50%-24px)] h-px bg-border" />
                  )}

                  <div className="relative z-10 flex flex-col items-center text-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-border shadow-card flex items-center justify-center">
                        <Icon className="size-4.5 text-muted-foreground" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gradient-brand text-white text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center">
          <div className="gradient-brand rounded-3xl p-10 shadow-ai">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to see inside your documents?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              No sign-up. No configuration. Drop in a document and get answers in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/analyze"
                className="bg-white text-primary font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm flex items-center gap-2"
              >
                Analyze a Document <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/compliance"
                className="border border-white/30 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                Run Compliance Review
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-white/60 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
              <ScanEye className="size-3 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">DocuLens AI</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Built by Pranjul Rathour · GenAI Engineer · NEXT UPGRAD WEB SOLUTIONS
          </p>
        </div>
      </footer>
    </div>
  );
}
