"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateTestimonial } from "@/actions/testimonial-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Testimonial } from "@/db";

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

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 px-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah Johnson" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the client who provided this testimonial
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CEO at TechCorp" {...field} />
                    </FormControl>
                    <FormDescription>
                      The client's role and company (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did the client say about your work?"
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The testimonial text from your client
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., E-commerce Website Redesign"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The project this testimonial is related to (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 py-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
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
          </form>
        </Form>
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
