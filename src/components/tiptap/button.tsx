"use client";

import { Fragment, useMemo } from "react";
import {
  buttonVariants,
  type Button as ShadcnButton,
} from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseShortcutKeys } from "@/lib/tiptap-utils";
import { cn } from "@/lib/utils";
import { ToolbarButton } from "./toolbar";

export type EditorButtonProps = React.ComponentProps<typeof ShadcnButton> & {
  className?: string;
  isActive?: boolean;
  showTooltip?: boolean;
  tooltip?: React.ReactNode;
  shortcutKeys?: string;
};

export const ShortcutDisplay: React.FC<{ shortcuts: string[] }> = ({
  shortcuts,
}) => {
  if (shortcuts.length === 0) return null;

  return (
    <KbdGroup>
      {shortcuts.map((key, index) => (
        <Fragment key={`${key}`}>
          {index > 0 && <span className="kbd-separator">+</span>}
          <Kbd>{key}</Kbd>
        </Fragment>
      ))}
    </KbdGroup>
  );
};

export const EditorButton = ({
  className,
  children,
  tooltip,
  showTooltip = true,
  shortcutKeys,
  isActive,
  variant,
  size,
  ...props
}: EditorButtonProps) => {
  const shortcuts = useMemo<string[]>(
    () => parseShortcutKeys({ shortcutKeys }),
    [shortcutKeys]
  );

  if (!tooltip || !showTooltip) {
    return (
      <ToolbarButton
        className={cn(
          buttonVariants({
            variant: variant ?? (isActive ? "secondary" : "ghost"),
            size: size ?? "icon",
            className,
          })
        )}
        {...props}
      >
        {children}
      </ToolbarButton>
    );
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <ToolbarButton
          className={cn(
            buttonVariants({
              variant: variant ?? (isActive ? "secondary" : "ghost"),
              size: size ?? "icon-sm",
              className,
            })
          )}
          {...props}
        >
          {children}
        </ToolbarButton>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          {tooltip}
          <ShortcutDisplay shortcuts={shortcuts} />
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default EditorButton;
