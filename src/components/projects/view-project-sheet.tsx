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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{project.title}</SheetTitle>
          <SheetDescription>
            View project details and information.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p className="text-muted-foreground text-sm">
            Project view details will be implemented here.
          </p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
