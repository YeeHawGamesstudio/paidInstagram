"use client";

import { Card } from "@/components/ui/card";

export default function PublicLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-6 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-36 rounded-full bg-white/10" />
          <div className="h-16 max-w-3xl rounded-[1.5rem] bg-white/10" />
          <div className="h-5 max-w-2xl rounded-full bg-white/8" />
          <div className="h-5 max-w-xl rounded-full bg-white/8" />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border-white/10 bg-white/[0.03]">
            <div className="animate-pulse">
              <div className="h-72 bg-white/8" />
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex gap-2">
                  <div className="h-7 w-24 rounded-full bg-white/10" />
                  <div className="h-7 w-20 rounded-full bg-white/10" />
                </div>
                <div className="h-10 w-3/4 rounded-[1rem] bg-white/10" />
                <div className="h-5 w-full rounded-full bg-white/8" />
                <div className="h-5 w-4/5 rounded-full bg-white/8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
