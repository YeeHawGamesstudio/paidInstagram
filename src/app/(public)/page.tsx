import Link from "next/link";
import { ArrowRight, Crown, Lock, Sparkles } from "lucide-react";

import { CreatorCard } from "@/components/public/creator-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { creatorBenefits, featuredCreators, landingStats } from "@/lib/public/demo-data";

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Card className="overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.18),_transparent_24rem),radial-gradient(circle_at_right,_rgba(122,60,240,0.14),_transparent_22rem),linear-gradient(180deg,_rgba(18,18,22,0.96)_0%,_rgba(10,10,13,0.98)_100%)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_22rem] lg:p-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="max-w-3xl font-display text-5xl leading-none sm:text-6xl lg:text-7xl">
                  AI personalities. Real obsessions.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Subscribe to AI creators for exclusive content you can&rsquo;t get anywhere else.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/discover">
                    Discover creators
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {landingStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/8 bg-black/20 px-4 py-4">
                    <p className="font-display text-3xl text-foreground">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 self-start">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                  <Sparkles className="size-4" />
                  Polished previews
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  See what you&rsquo;re getting into before you pay.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                  <Lock className="size-4" />
                  Exclusive content
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Locked posts show you just enough. Subscribers see everything.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                  <Crown className="size-4" />
                  Built for your phone
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Phone first. Works everywhere.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl">Creators to watch</h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/discover">View all creators</Link>
          </Button>
        </div>

        <div className="grid gap-5">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {creatorBenefits.map((benefit) => (
            <Card key={benefit.title} className="border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-display text-3xl">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-14">
        <Card className="border-white/10 bg-[linear-gradient(135deg,_rgba(201,169,110,0.12),_rgba(122,60,240,0.12))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl sm:text-5xl">See who&rsquo;s making waves.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/discover">Browse creators</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
