"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, ArrowLeftRight, ShieldCheck, ScanEye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/analyze", icon: FileSearch, label: "Analyze" },
  { href: "/compare", icon: ArrowLeftRight, label: "Compare" },
  { href: "/compliance", icon: ShieldCheck, label: "Compliance" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* ── Desktop Sidebar ───────────────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col bg-white border-r border-border z-40 shadow-card">
        {/* Brand */}
        <div className="p-5 pb-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-ai flex-shrink-0">
              <ScanEye className="size-4 text-white" />
            </div>
            <span className="font-extrabold text-[17px] gradient-text tracking-tight">
              DocuLens AI
            </span>
          </Link>
        </div>

        <div className="px-3 mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-2">
            Tools
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] flex-shrink-0",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* New Analysis CTA */}
        <div className="p-3 border-t border-border">
          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 w-full gradient-brand text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-90 active:opacity-80 transition-opacity shadow-ai"
          >
            <Plus className="size-4" />
            New Analysis
          </Link>
        </div>

        {/* Footer credit */}
        <div className="px-4 pb-4 pt-1">
          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
            DocuLens AI · NEXT UPGRAD WEB SOLUTIONS
          </p>
        </div>
      </aside>

      {/* ── Mobile Top Header ─────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-border glass z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <ScanEye className="size-3.5 text-white" />
          </div>
          <span className="font-extrabold gradient-text text-[15px]">DocuLens AI</span>
        </Link>
        <Link
          href="/analyze"
          className="gradient-brand text-white text-xs font-bold px-3 py-1.5 rounded-lg"
        >
          + New
        </Link>
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border glass z-40 flex safe-area-pb">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition-colors min-h-[56px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("size-5", active ? "text-primary" : "text-muted-foreground")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
