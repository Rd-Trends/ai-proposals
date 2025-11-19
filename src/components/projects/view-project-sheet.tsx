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
import type { Project } from "@/lib/db/schema/projects";

type ViewProjectSheetProps = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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
    <Sheet onOpenChange={onOpenChange} open={open}>
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

        <ScrollArea className="mt-6 h-[calc(100vh-140px)] pr-4">
          <div className="space-y-6 px-4">
            <div>
              <h3 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
                Project Details
              </h3>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: project details is sanitized on input
                dangerouslySetInnerHTML={{ __html: project.details }}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
