import type { ReactNode } from "react";

type ProfileCosmicPanelProps = {
  children: ReactNode;
};

export function ProfileCosmicPanel({ children }: ProfileCosmicPanelProps) {
  return <div className="mystic-profile-panel divide-y divide-accent-gold/10">{children}</div>;
}
