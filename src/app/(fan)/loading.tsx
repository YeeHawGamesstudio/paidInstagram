"use client";

import { Card } from "@/components/ui/card";

export default function FanLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 md:pb-8 lg:px-8">
      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="h-12 w-80 rounded-[1.25rem] bg-white/10" />
          <div className="h-5 max-w-2xl rounded-full bg-white/8" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-[1.4rem] bg-white/8" />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-white/10 bg-white/[0.03] p-5">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-white/10" />
                  <div className="h-3 w-48 rounded-full bg-white/8" />
                </div>
              </div>
              <div className="h-8 w-3/4 rounded-[1rem] bg-white/10" />
              <div className="h-5 w-full rounded-full bg-white/8" />
              <div className="h-5 w-2/3 rounded-full bg-white/8" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
