"use client";

import { cn } from "@/lib/utils";

export type SpacerOrientation = "horizontal" | "vertical";

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SpacerOrientation;
}

export function Spacer({
  orientation = "horizontal",
  className,
  ...props
}: SpacerProps) {
  return (
    <div
      {...props}
      className={cn(
        {
          "inline-block w-px h-full": orientation === "vertical",
          "block h-px w-full flex-1": orientation === "horizontal",
        },
        className
      )}
    />
  );
}
