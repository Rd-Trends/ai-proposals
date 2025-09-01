"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROPOSAL_OUTCOME, type ProposalTracking } from "@/db";
import { updateProposal } from "@/lib/actions/proposal-actions";
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

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this status update..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
