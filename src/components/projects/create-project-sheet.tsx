"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createProjectAction } from "@/actions/project-actions";
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

type CreateProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      try {
        const res = await createProjectAction({
          ...data,
          userId: user?.id || "",
        });
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
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
          <FieldGroup className="space-y-4 px-4 pt-6">
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-project-title">
                    Project Title *
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    id="create-project-title"
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
                  <RichTextEditor
                    onChange={field.onChange}
                    placeholder="Describe your project in detail. Include challenges solved, technologies used, outcomes achieved, links to demos, and any other relevant information..."
                    value={field.value}
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
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                form="create-project-form"
                type="submit"
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
