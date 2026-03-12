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
        description="Review thread history, premium unlock states, and message presentation for this creator conversation."
      />

      <ConversationScreen conversation={conversation} />
    </div>
  );
}
