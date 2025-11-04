"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateTemplate } from "@/actions/template-actions";
import { AITemplateGenerator } from "@/components/templates/ai-template-generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { PROPOSAL_TONE, type Template } from "@/lib/db";

interface UpdateTemplateSheetProps {
  template: Template;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpdateTemplateSheet({
  template,
  open,
  onOpenChange,
}: UpdateTemplateSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTag, setNewTag] = useState("");

  const form = useForm<UpdateTemplateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: template.title,
      description: template.description || "",
      content: template.content,
      tone: template.tone,
      category: template.category || "",
      tags: template.tags || [],
      status: template.status,
      isPublic: template.isPublic,
      isFavorite: template.isFavorite,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    startTransition(async () => {
      try {
        const res = await updateTemplate(template.id, data);
        if (!res.success) {
          toast.error(res.error || "Failed to update template");
          return;
        }
        toast.success("Template updated successfully");
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

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Update Template
          </SheetTitle>
          <SheetDescription>
            Update your proposal template. Make changes to improve your
            template&apos;s effectiveness.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6 px-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-template-title">
                    Title *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="update-template-title"
                    placeholder="e.g., Web Development Proposal"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    A clear, descriptive name for your template
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-template-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="update-template-description"
                    placeholder="Briefly describe what this template is for..."
                    className="resize-none"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Optional description to help you identify this template
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="update-template-category">
                      Category
                    </FieldLabel>
                    <Input
                      {...field}
                      id="update-template-category"
                      placeholder="e.g., web development"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="tone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="update-template-tone">Tone</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="update-template-tone"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPOSAL_TONE.map((tone) => (
                          <SelectItem
                            key={tone}
                            value={tone}
                            className="capitalize"
                          >
                            {tone}
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
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {form.watch("tags").length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.watch("tags").map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel htmlFor="update-template-content">
                    Content *
                  </FieldLabel>
                  <AITemplateGenerator
                    existingData={{
                      description: form.watch("description"),
                      category: form.watch("category"),
                      tone: form.watch("tone"),
                    }}
                    hasRequiredData={!!form.watch("description")}
                    onSuccess={(data) => {
                      form.setValue("content", data.content);
                      if (data.category) {
                        form.setValue("category", data.category);
                      }
                      if (data.tone) {
                        form.setValue("tone", data.tone);
                      }
                      if (data.description) {
                        form.setValue("description", data.description);
                      }
                    }}
                  />
                </div>
                <Textarea
                  {...field}
                  id="update-template-content"
                  placeholder="Enter your template content here. You can use placeholders like {{client_name}}, {{project_description}}, etc."
                  className="resize-none min-h-[200px]"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                />
                <FieldDescription>
                  Use placeholders like {`{{client_name}}`} for dynamic content
                  that can be filled in later
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="update-template-status">
                    Status
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="update-template-status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Draft templates won&apos;t be shown in your active templates
                    list
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="isPublic"
                control={form.control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="update-template-isPublic">
                        Public Template
                      </FieldLabel>
                      <FieldDescription className="text-xs">
                        Allow others to discover and use this template
                      </FieldDescription>
                    </div>
                    <input
                      {...field}
                      id="update-template-isPublic"
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      className="h-4 w-4"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                  </Field>
                )}
              />

              <Controller
                name="isFavorite"
                control={form.control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="update-template-isFavorite">
                        Favorite
                      </FieldLabel>
                      <FieldDescription className="text-xs">
                        Mark this template as a favorite
                      </FieldDescription>
                    </div>
                    <input
                      {...field}
                      id="update-template-isFavorite"
                      type="checkbox"
                      checked={value}
                      onChange={onChange}
                      className="h-4 w-4"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 py-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
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
                  Update Template
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  tone: z.enum(PROPOSAL_TONE),
  category: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "active", "archived"]),
  isPublic: z.boolean(),
  isFavorite: z.boolean(),
});

type UpdateTemplateFormData = z.infer<typeof schema>;
