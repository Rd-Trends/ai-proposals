"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createProject } from "@/actions/project-actions";
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
import { useSession } from "@/lib/auth-client";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const { data: sessionData } = useSession();
  const user = sessionData?.user;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InsertProject>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      details: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const res = await createProject({ ...data, userId: user?.id || "" });
        if (!res.success) {
          toast.error(res.error || "Failed to create project");
          return;
        }
        toast.success("Project created successfully");
        form.reset();
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error submitting project:", error);
        toast.error("Failed to create project");
      }
    });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Project
          </SheetTitle>
          <SheetDescription>
            Add a new project to your portfolio for referencing in proposals.
            Fill in the details below.
          </SheetDescription>
        </SheetHeader>

        <form id="create-project-form" onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4 pt-6 px-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-project-title">
                    Project Title *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-project-title"
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
                  <FieldLabel htmlFor="create-project-details">
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
                form="create-project-form"
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
                    Create Project
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
  title: z.string().min(1, "Title is required"),
  details: z.string().min(1, "Details are required"),
});

type InsertProject = z.infer<typeof schema>;
