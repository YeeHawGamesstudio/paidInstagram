import Link from "next/link";

import { NewPostComposer } from "@/components/creator/new-post-composer";
import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { Button } from "@/components/ui/button";

export default function CreatorNewPostPage() {
  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="New post"
        title="Draft a new post"
        description="Build a text-only public teaser or subscriber-only post, review how it will appear, and prepare it for publishing."
        actions={
          <Button asChild variant="outline">
            <Link href="/creator/posts">Back to posts</Link>
          </Button>
        }
      />

      <NewPostComposer />
    </div>
  );
}
