"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateProjectAction } from "@/actions/project-actions";
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
import type { Project } from "@/lib/db/schema/projects";
import { SimpleEditor } from "../tiptap/simple-editor";
import { ScrollArea } from "../ui/scroll-area";

type UpdateProjectSheetProps = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const res = await updateProjectAction(project.id, data);
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="h-lvh" side="bottom">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Update your project details and information.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="max-h-full overflow-y-auto">
          <form id="update-project-form" onSubmit={handleSubmit}>
            <FieldGroup className="space-y-4 px-4 pt-6">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="update-project-title">
                      Project Title *
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id="update-project-title"
                      placeholder="e.g., E-commerce Website for Fashion Brand"
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
                control={form.control}
                name="details"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-project-details">
                      Project Details *
                    </FieldLabel>
                    <SimpleEditor
                      {...field}
                      error={fieldState.invalid}
                      placeholder="Describe your project in detail. Include challenges solved, technologies used, outcomes achieved, links to demos, and any other relevant information..."
                      value={field.value}
                    />
                    <FieldDescription>
                      Use the rich text editor to format your project details.
                      You can add headings, lists, links, and more.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="flex justify-center items-center gap-3 py-6">
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isPending}
                  form="update-project-form"
                  type="submit"
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
