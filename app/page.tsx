import Link from "next/link";
import { FileText, ClipboardCheck, ScrollText, Landmark, ArrowRight, Eye, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const SUPPORTED_DOCS = [
  { icon: FileText, label: "Invoices" },
  { icon: ClipboardCheck, label: "Purchase Orders" },
  { icon: ScrollText, label: "Contracts" },
  { icon: Landmark, label: "Regulatory Filings" },
];

const WORKFLOW_STEPS = [
  { icon: FileText, title: "Upload", description: "Drop in an invoice, PO, contract, or filing." },
  { icon: Eye, title: "Understand", description: "DocuLens classifies the document type automatically." },
  { icon: Layers, title: "Extract", description: "Key fields turn into clean, structured data." },
  { icon: ShieldCheck, title: "Verify", description: "Mismatches and compliance issues surface instantly." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            See. Extract. Verify.
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            DocuLens AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Turn complex business documents into structured insights, comparisons, and
            compliance checks — in seconds.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/analyze">
                Analyze a Document <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {SUPPORTED_DOCS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
              {WORKFLOW_STEPS.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-foreground">
            What is in this document, what matters, and what needs your attention?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Answer it within seconds — then verify an invoice against its purchase order and
            check either against your own compliance rules.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/compare">Compare Invoice ↔ PO</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/compliance">Run Compliance Review</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
