import Link from "next/link";
import { FileWarning, Flag, Scale } from "lucide-react";

import { submitModerationReportAction } from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ReportTargetType } from "@/generated/prisma/client";
import { getOptionalViewer } from "@/lib/auth/viewer";
import {
  getReportReasonOptions,
  getReportTargetTypeLabel,
  normalizeReportTargetType,
} from "@/lib/moderation/service";

type ReportPageProps = {
  searchParams: Promise<{
    target?: string;
    subject?: string;
    url?: string;
    targetUserId?: string;
    targetCreatorProfileId?: string;
    targetPostId?: string;
    targetMessageId?: string;
    submitted?: string;
    error?: string;
  }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const viewer = await getOptionalViewer();
  const params = await searchParams;
  const targetType = normalizeReportTargetType(params.target) ?? ReportTargetType.CREATOR_PROFILE;
  const target = params.target ?? targetType;
  const subject = params.subject ?? "Unspecified target";
  const url = params.url ?? "";
  const submitted = params.submitted === "1";
  const error = params.error ?? "";
  const reasonOptions = getReportReasonOptions();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Reporting and abuse intake</p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">Report content, messaging, or creators</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          This intake now creates moderation cases that can be triaged in the admin queue. Keep copyright complaints on
          the dedicated DMCA path, and use this form for abuse, policy, impersonation, spam, or unsafe messaging.
        </p>
      </section>

      {submitted ? (
        <Card className="border-emerald-400/20 bg-emerald-400/8 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Report submitted</p>
          <p className="mt-3 text-sm leading-7 text-foreground/82">
            Your report has been added to the moderation queue. Admins can now review it, record notes, and resolve the
            case cleanly.
          </p>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-rose-400/20 bg-rose-400/8 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-300">Unable to submit</p>
          <p className="mt-3 text-sm leading-7 text-foreground/82">{error}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03] p-5">
          <Flag className="size-5 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Safety report</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use for abusive messaging, policy violations, impersonation, coercion, or other moderation concerns.
          </p>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] p-5">
          <Scale className="size-5 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Copyright / takedown</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            For intellectual-property complaints, use the dedicated DMCA path so legal intake can be handled separately
            from moderation reports.
          </p>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] p-5">
          <FileWarning className="size-5 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Admin-ready context</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reports carry subject, source URL, and target IDs where available so admins can review and resolve the right
            object without guesswork.
          </p>
        </Card>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-6">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Moderation intake</p>
            <h2 className="mt-2 font-display text-3xl">Submission context</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Target type</p>
              <p className="mt-2 text-sm font-medium text-foreground">{getReportTargetTypeLabel(targetType)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
              <p className="mt-2 text-sm font-medium text-foreground">{subject}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Source URL</p>
              <p className="mt-2 break-all text-sm font-medium text-foreground">{url || "Not provided"}</p>
            </div>
          </div>

          {viewer ? (
            <form action={submitModerationReportAction} className="grid gap-4">
              <input type="hidden" name="target" value={target} />
              <input type="hidden" name="subject" value={subject} />
              <input type="hidden" name="sourceUrl" value={url} />
              <input type="hidden" name="targetUserId" value={params.targetUserId ?? ""} />
              <input type="hidden" name="targetCreatorProfileId" value={params.targetCreatorProfileId ?? ""} />
              <input type="hidden" name="targetPostId" value={params.targetPostId ?? ""} />
              <input type="hidden" name="targetMessageId" value={params.targetMessageId ?? ""} />

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">Report target</span>
                  <select
                    name="targetType"
                    defaultValue={targetType}
                    className="flex h-11 w-full rounded-2xl border border-border bg-input px-4 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                  >
                    <option value={ReportTargetType.USER}>User</option>
                    <option value={ReportTargetType.CREATOR_PROFILE}>Creator profile</option>
                    <option value={ReportTargetType.POST}>Post</option>
                    <option value={ReportTargetType.MESSAGE}>Message</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-foreground">Reason</span>
                  <select
                    name="reason"
                    defaultValue={reasonOptions[0]?.value}
                    className="flex h-11 w-full rounded-2xl border border-border bg-input px-4 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                  >
                    {reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What happened?</p>
                <Textarea
                  name="reporterNotes"
                  className="mt-3 min-h-36"
                  placeholder="Describe what you saw, why it is unsafe, and any context a moderator should review."
                  required
                  minLength={10}
                />
              </div>

              <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-4 text-sm leading-7 text-muted-foreground">
                In-product reports are tied to your signed-in account so admins can review and resolve them cleanly. For
                copyright or trademark claims, use the dedicated DMCA route instead of this moderation form.
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Submit report</Button>
                <Button asChild variant="outline">
                  <Link href="/dmca">Open DMCA form</Link>
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-4 text-sm leading-7 text-muted-foreground">
              Sign in is currently required for in-product abuse reporting so reports can be reviewed against a real user
              context. Copyright and takedown requests should still go through the DMCA intake path.
              <div className="mt-4">
                <Button asChild>
                  <Link href="/login">Sign in to report</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/content-policy">Review content policy</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dmca">DMCA / takedown</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
