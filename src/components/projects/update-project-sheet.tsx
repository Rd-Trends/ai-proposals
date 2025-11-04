"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateProject } from "@/actions/project-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Project } from "@/lib/db";

interface UpdateProjectSheetProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  details: z.string().min(1, "Details are required"),
});

type UpdateProject = z.infer<typeof schema>;

export function UpdateProjectSheet({
  project,
  open,
  onOpenChange,
}: UpdateProjectSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProject>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project.title,
      details: project.details,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const res = await updateProject(project.id, data);
        if (!res.success) {
          toast.error(res.error || "Failed to update project");
          return;
        }
        toast.success("Project updated successfully");
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error updating project:", error);
        toast.error("Failed to update project");
      }
    });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Update your project details and information.
          </SheetDescription>
        </SheetHeader>

        <form id="update-project-form" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4 pt-6 px-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-project-title">
                    Project Title *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-project-title"
                    placeholder="e.g., E-commerce Website for Fashion Brand"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    A clear, descriptive name for your project
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="details"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-project-details">
                    Project Details *
                  </FieldLabel>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your project in detail. Include challenges solved, technologies used, outcomes achieved, links to demos, and any other relevant information..."
                  />
                  <FieldDescription>
                    Use the rich text editor to format your project details. You
                    can add headings, lists, links, and more.
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
                form="update-project-form"
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
                    Update Project
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
