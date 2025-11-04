"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareQuote, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createTestimonial } from "@/actions/testimonial-actions";
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
import { useSession } from "@/lib/auth-client";

interface CreateTestimonialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTestimonialSheet({
  open,
  onOpenChange,
}: CreateTestimonialSheetProps) {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InsertTestimonial>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: "",
      clientTitle: "",
      content: "",
      projectTitle: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const res = await createTestimonial({
          ...data,
          userId: user?.id || "",
        });
        if (!res.success) {
          toast.error(res.error || "Failed to create testimonial");
          return;
        }
        toast.success("Testimonial created successfully");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error submitting testimonial:", error);
        toast.error("Failed to create testimonial");
      }
    });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            Add New Testimonial
          </SheetTitle>
          <SheetDescription>
            Save client testimonials to reference in your proposals and build
            credibility.
          </SheetDescription>
        </SheetHeader>

        <form id="create-testimonial-form" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4 pt-6 px-4">
            <Controller
              name="clientName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="testimonial-client-name">
                    Client Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="testimonial-client-name"
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
                  <FieldLabel htmlFor="testimonial-client-title">
                    Client Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="testimonial-client-title"
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
                  <FieldLabel htmlFor="testimonial-content">
                    Testimonial *
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="testimonial-content"
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
                  <FieldLabel htmlFor="testimonial-project-title">
                    Project Title
                  </FieldLabel>
                  <Input
                    {...field}
                    id="testimonial-project-title"
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
                form="create-testimonial-form"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Testimonial
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

type InsertTestimonial = z.infer<typeof schema>;
