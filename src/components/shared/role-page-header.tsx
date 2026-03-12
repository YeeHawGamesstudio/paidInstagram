import type { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";

export type RolePageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export function RolePageHeader(props: RolePageHeaderProps) {
  return <PageHeader {...props} />;
}
