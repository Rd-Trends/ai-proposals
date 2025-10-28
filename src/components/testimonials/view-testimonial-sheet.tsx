"use client";

import { MessageSquareQuote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Testimonial } from "@/lib/db";

interface ViewTestimonialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: Testimonial;
}

export function ViewTestimonialSheet({
  open,
  onOpenChange,
  testimonial,
}: ViewTestimonialSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            Testimonial Details
          </SheetTitle>
          <SheetDescription>
            View the complete testimonial information.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-6 px-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Client Name
              </h3>
              <p className="text-base">{testimonial.clientName}</p>
            </div>

            {testimonial.clientTitle && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Client Title
                </h3>
                <p className="text-base">{testimonial.clientTitle}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Testimonial
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-base italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            </div>

            {testimonial.projectTitle && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Related Project
                </h3>
                <p className="text-base">{testimonial.projectTitle}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">
                    Created
                  </h3>
                  <p>{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground mb-1">
                    Last Updated
                  </h3>
                  <p>{new Date(testimonial.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
