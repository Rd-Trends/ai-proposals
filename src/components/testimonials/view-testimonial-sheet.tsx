"use client";

import { MessageSquareQuote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Testimonial } from "@/lib/db/schema/testimonials";

type ViewTestimonialSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: Testimonial;
};

export function ViewTestimonialSheet({
  open,
  onOpenChange,
  testimonial,
}: ViewTestimonialSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            Testimonial Details
          </SheetTitle>
          <SheetDescription>
            View the complete testimonial information.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium text-muted-foreground text-sm">
                Client Name
              </h3>
              <p className="text-base">{testimonial.clientName}</p>
            </div>

            {testimonial.clientTitle && (
              <div>
                <h3 className="mb-2 font-medium text-muted-foreground text-sm">
                  Client Title
                </h3>
                <p className="text-base">{testimonial.clientTitle}</p>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-medium text-muted-foreground text-sm">
                Testimonial
              </h3>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-base italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            </div>

            {testimonial.projectTitle && (
              <div>
                <h3 className="mb-2 font-medium text-muted-foreground text-sm">
                  Related Project
                </h3>
                <p className="text-base">{testimonial.projectTitle}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="mb-1 font-medium text-muted-foreground">
                    Created
                  </h3>
                  <p>{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-muted-foreground">
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
