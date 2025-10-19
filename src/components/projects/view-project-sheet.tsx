"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Project } from "@/db";

interface ViewProjectSheetProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProjectSheet({
  project,
  open,
  onOpenChange,
}: ViewProjectSheetProps) {
  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">{project.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            {formattedDate
              ? `Created on ${formattedDate}`
              : "No date available"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] pr-4 mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Project Details
              </h3>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: project details is sanitized on input
                dangerouslySetInnerHTML={{ __html: project.details }}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
