import type { ReactNode } from "react";

export function FlexDiv({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
