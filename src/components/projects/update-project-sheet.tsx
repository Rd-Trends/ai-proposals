"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Project } from "@/db";

interface UpdateProjectSheetProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateProjectSheet({
  project,
  open,
  onOpenChange,
}: UpdateProjectSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit {project.title}</SheetTitle>
          <SheetDescription>
            Update project details and information.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p className="text-muted-foreground text-sm">
            Project edit form will be implemented here.
          </p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
