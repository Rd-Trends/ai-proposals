"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { addToWaitlistAction } from "@/actions/waitlist-actions";
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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  invitedBy: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AddWaitlistSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddWaitlistSheet({
  open,
  onOpenChange,
}: AddWaitlistSheetProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      invitedBy: "admin",
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await addToWaitlistAction(
          data.email,
          data.invitedBy || "admin",
          data.notes,
        );
        toast.success("Waitlist entry added successfully");
        form.reset();
        onOpenChange(false);
      } catch {
        toast.error("Failed to add waitlist entry");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Waitlist Entry</SheetTitle>
          <SheetDescription>
            Add a new email to the waitlist to grant platform access
          </SheetDescription>
        </SheetHeader>
        <form
          id="add-waitlist-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 px-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-waitlist-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="add-waitlist-email"
                    type="email"
                    placeholder="user@example.com"
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                  />
                  <FieldDescription>
                    The email address to add to the waitlist
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="invitedBy"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-waitlist-invitedBy">
                    Invited By
                  </FieldLabel>
                  <Input
                    {...field}
                    id="add-waitlist-invitedBy"
                    placeholder="admin"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Who is inviting this user (optional)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="add-waitlist-notes">Notes</FieldLabel>
                  <Textarea
                    {...field}
                    id="add-waitlist-notes"
                    placeholder="Add any relevant notes..."
                    className="resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Optional notes about this invitation
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Field orientation="horizontal" className="mt-6 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="add-waitlist-form" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Entry
            </Button>
          </Field>
        </form>
      </SheetContent>
    </Sheet>
  );
}
