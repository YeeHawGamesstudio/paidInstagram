export type MessageSender = "fan" | "creator" | "system";
export type MessageKind = "text" | "media" | "locked";

export type FeedMedia = {
  imageUrl?: string;
  imageAlt?: string;
  label: string;
};

export type LockedContent = {
  title: string;
  teaser: string;
  description: string;
  priceCents: number;
  currency: string;
  unlockedText?: string;
  media?: FeedMedia;
};

type FanConversationMessageBase = {
  id: string;
  sender: MessageSender;
  sentAt: string;
  reportHref?: string;
};

export type FanTextMessage = FanConversationMessageBase & {
  kind: "text";
  body?: string;
};

export type FanMediaMessage = FanConversationMessageBase & {
  kind: "media";
  body?: string;
  media: FeedMedia;
};

export type FanLockedMessage = FanConversationMessageBase & {
  kind: "locked";
  body?: string;
  locked: LockedContent;
};

export type FanConversationMessage = FanTextMessage | FanMediaMessage | FanLockedMessage;

export type FanConversation = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  creatorHeadline: string;
  creatorReplyWindow: string;
  messages: FanConversationMessage[];
  unlockedMessageIds: string[];
};
