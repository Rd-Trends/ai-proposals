"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { PROPOSAL_OUTCOME, type ProposalTracking } from "@/lib/db";
import { getProposalStatusLabel } from "./helpers";

const updateStatusSchema = z.object({
  status: z.enum(PROPOSAL_OUTCOME),
  notes: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

interface UpdateProposalStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ProposalTracking;
}

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
      status: proposal.currentOutcome || "proposal_sent",
      notes: proposal.notes || "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="proposal-status">Status</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="proposal-status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposal_sent">
                        {getProposalStatusLabel("proposal_sent")}
                      </SelectItem>
                      <SelectItem value="proposal_viewed">
                        {getProposalStatusLabel("proposal_viewed")}
                      </SelectItem>
                      <SelectItem value="client_responded">
                        {getProposalStatusLabel("client_responded")}
                      </SelectItem>
                      <SelectItem value="interviewed">
                        {getProposalStatusLabel("interviewed")}
                      </SelectItem>
                      <SelectItem value="job_awarded">
                        {getProposalStatusLabel("job_awarded")}
                      </SelectItem>
                      <SelectItem value="proposal_rejected">
                        {getProposalStatusLabel("proposal_rejected")}
                      </SelectItem>
                      <SelectItem value="no_response">
                        {getProposalStatusLabel("no_response")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FieldLabel htmlFor="proposal-notes">
                    Notes (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="proposal-notes"
                    placeholder="Add any notes about this status update..."
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="update-proposal-status-form"
                disabled={isPending}
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
