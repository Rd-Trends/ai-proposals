"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProposal } from "@/actions/proposal-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PROPOSAL_OUTCOME,
  type ProposalTracking,
} from "@/lib/db/schema/proposals";
import { getProposalStatusLabel } from "./helpers";

const updateStatusSchema = z.object({
  currentOutcome: z.enum(PROPOSAL_OUTCOME),
  notes: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

type UpdateProposalStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ProposalTracking;
};

export function UpdateProposalStatusDialog({
  open,
  onOpenChange,
  proposal,
}: UpdateProposalStatusDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateStatusFormData>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      currentOutcome: proposal.currentOutcome || "proposal_sent",
      notes: proposal.notes || "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const res = await updateProposal(proposal.id, data);
        if (!res.success) {
          toast.error(res.error || "Failed to update proposal");
          return;
        }
        toast.success("Proposal updated successfully");
        startTransition(() => {
          onOpenChange?.(false);
          router.refresh();
        });
      } catch (error) {
        console.error("Error updating template:", error);
        toast.error("Failed to update template");
      }
    });
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Proposal Status</DialogTitle>
          <DialogDescription>
            Update the current status of your proposal submission
          </DialogDescription>
        </DialogHeader>

        <form id="update-proposal-status-form" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            <Controller
              control={form.control}
              name="currentOutcome"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="proposal-status">Status</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      aria-invalid={fieldState.invalid}
                      id="proposal-status"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPOSAL_OUTCOME.map((outcome) => (
                        <SelectItem key={outcome} value={outcome}>
                          {getProposalStatusLabel(outcome)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="proposal-notes">
                    Notes (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id="proposal-notes"
                    placeholder="Add any notes about this status update..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                form="update-proposal-status-form"
                type="submit"
              >
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
