import type { ReactNode } from "react";

import { FanShellFrame } from "@/components/fan/fan-shell-frame";
import { getFanShellProfile } from "@/lib/fan/server-data";

type FanShellProps = {
  children: ReactNode;
};

export async function FanShell({ children }: FanShellProps) {
  const fanProfile = await getFanShellProfile();

  return <FanShellFrame fanProfile={fanProfile}>{children}</FanShellFrame>;
}
