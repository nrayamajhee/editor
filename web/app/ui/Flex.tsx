import type { ReactNode } from "react";

export function FlexDiv({
  className,
  children,
  ref,
}: {
  className?: string;
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} ref={ref}>
      {children}
    </div>
  );
}
