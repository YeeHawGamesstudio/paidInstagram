"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type FanStateAction = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost";
};

type FanStateCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  secondaryText?: string;
  actions?: readonly FanStateAction[];
  children?: ReactNode;
};

export function FanStateCard({
  eyebrow,
  title,
  description,
  secondaryText,
  actions = [],
  children,
}: FanStateCardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_18rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>

        {secondaryText ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
            {secondaryText}
          </div>
        ) : null}

        {children}

        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Button key={`${action.href}-${action.label}`} asChild variant={action.variant ?? "default"}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </Card>
    </main>
  );
}
