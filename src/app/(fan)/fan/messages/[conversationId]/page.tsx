import { notFound } from "next/navigation";

import { ConversationScreen } from "@/components/fan/conversation-screen";
import { FanPageHeader } from "@/components/fan/fan-page-header";
import { getFanConversationById } from "@/lib/fan/server-data";

type FanConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function FanConversationPage({ params }: FanConversationPageProps) {
  const { conversationId } = await params;
  const conversation = await getFanConversationById(conversationId);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="grid gap-5">
      <FanPageHeader
        eyebrow="Conversation"
        title={conversation.creatorName}
        description="Catch up on creator updates, unlock paid drops, and review your message history in one thread."
      />

      <ConversationScreen conversation={conversation} />
    </div>
  );
}
