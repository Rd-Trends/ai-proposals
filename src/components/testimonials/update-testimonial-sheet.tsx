"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateTestimonial } from "@/actions/testimonial-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Testimonial } from "@/lib/db";

interface UpdateTestimonialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: Testimonial;
}

export function UpdateTestimonialSheet({
  open,
  onOpenChange,
  testimonial,
}: UpdateTestimonialSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateTestimonialForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: testimonial.clientName || "",
      clientTitle: testimonial.clientTitle || "",
      content: testimonial.content || "",
      projectTitle: testimonial.projectTitle || "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!testimonial) return;

    startTransition(async () => {
      try {
        const res = await updateTestimonial(testimonial.id, data);
        if (!res.success) {
          toast.error(res.error || "Failed to update testimonial");
          return;
        }
        toast.success("Testimonial updated successfully");
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error updating testimonial:", error);
        toast.error("Failed to update testimonial");
      }
    });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Testimonial
          </SheetTitle>
          <SheetDescription>
            Update the testimonial details below.
          </SheetDescription>
        </SheetHeader>

        <form id="update-testimonial-form" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4 pt-6 px-4">
            <Controller
              name="clientName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-testimonial-client-name">
                    Client Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-testimonial-client-name"
                    placeholder="e.g., Sarah Johnson"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    The name of the client who provided this testimonial
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="clientTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-testimonial-client-title">
                    Client Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-testimonial-client-title"
                    placeholder="e.g., CEO at TechCorp"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    The client's role and company (optional)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-testimonial-content">
                    Testimonial *
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="update-testimonial-content"
                    placeholder="What did the client say about your work?"
                    className="min-h-[150px] resize-none"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    The testimonial text from your client
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="projectTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-testimonial-project-title">
                    Project Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-testimonial-project-title"
                    placeholder="e.g., E-commerce Website Redesign"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    The project this testimonial is related to (optional)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3 py-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="update-testimonial-form"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Testimonial
                  </>
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  );
}

const schema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  clientTitle: z.string().max(100).optional(),
  content: z.string().min(1, "Testimonial content is required"),
  projectTitle: z.string().max(255).optional(),
});

type UpdateTestimonialForm = z.infer<typeof schema>;
