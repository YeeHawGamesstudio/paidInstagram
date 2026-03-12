import Link from "next/link";

import { NewPostComposer } from "@/components/creator/new-post-composer";
import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { Button } from "@/components/ui/button";

export default function CreatorNewPostPage() {
  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="New post"
        title="Compose a premium post"
        description="Create public teaser content or subscriber-only drops with a clean publishing flow that can be wired to real uploads later."
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
