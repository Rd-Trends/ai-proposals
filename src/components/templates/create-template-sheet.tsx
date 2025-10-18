"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createTemplate } from "@/actions/template-actions";
import { useAuth } from "@/components/auth/auth-provider";
import { AITemplateGenerator } from "@/components/templates/ai-template-generator";
import { Badge } from "@/components/ui/badge";
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
import { PROPOSAL_TONE } from "@/db";

interface CreateTemplateSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTemplateSheet({
  open,
  onOpenChange,
}: CreateTemplateSheetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTag, setNewTag] = useState("");

  const form = useForm<InsertTemplate>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      tone: "professional",
      category: "",
      tags: [],
      status: "draft",
      isPublic: false,
      isFavorite: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    console.log(data);
    startTransition(async () => {
      try {
        const res = await createTemplate({ ...data, userId: user?.id || "" });
        if (!res.success) {
          toast.error(res.error || "Failed to create template");
          return;
        }
        toast.success("Template created successfully");
        startTransition(() => {
          form.reset();
          onOpenChange?.(false);
          router.refresh();
        });
      } catch (error) {
        console.error("Error submitting template:", error);
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
            <FileText className="h-5 w-5" />
            Create New Template
          </SheetTitle>
          <SheetDescription>
            Create a new proposal template to use for future projects. Fill in
            the details below.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 px-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Web Development Proposal"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe what this template is for..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help you identify this template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., web development" {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        Help organize your templates
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
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

            <FormField
              control={form.control}
              name="content"
              rules={{ required: "Content is required" }}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-4">
                    <FormLabel>Content *</FormLabel>
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
                  <FormControl>
                    <Textarea
                      placeholder="Enter your template content here. You can use placeholders like {{client_name}}, {{project_description}}, etc."
                      className="resize-none min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use placeholders like {`{{client_name}}`} for dynamic
                    content that can be filled in later
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>

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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft templates won&apos;t be shown in your active
                      templates list
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
                onClick={() => onOpenChange?.(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Template
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

type InsertTemplate = z.infer<typeof schema>;
