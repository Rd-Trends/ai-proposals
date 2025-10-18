"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  ExternalLink,
  FolderPlus,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createProject } from "@/actions/project-actions";
import { useAuth } from "@/components/auth/auth-provider";
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
import { PROJECT_TYPE } from "@/db";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newUrl, setNewUrl] = useState({ title: "", url: "" });

  const form = useForm<InsertProject>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      type: "case_study",
      category: "",
      urls: [],
      completedAt: null,
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
        startTransition(() => {
          form.reset();
          onOpenChange(false);
          router.refresh();
        });
      } catch (error) {
        console.error("Error submitting project:", error);
        toast.error("Failed to create project");
      }
    });
  });

  const addUrl = () => {
    if (newUrl.title.trim() && newUrl.url.trim()) {
      const currentUrls = form.getValues("urls");
      const urlExists = currentUrls.some(
        (url) =>
          url.url === newUrl.url.trim() || url.title === newUrl.title.trim(),
      );

      if (!urlExists) {
        form.setValue("urls", [...currentUrls, { ...newUrl }]);
        setNewUrl({ title: "", url: "" });
      } else {
        toast.error("URL or title already exists");
      }
    }
  };

  const removeUrl = (index: number) => {
    const currentUrls = form.getValues("urls");
    form.setValue(
      "urls",
      currentUrls.filter((_, i) => i !== index),
    );
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent, field: "title" | "url") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "title" && newUrl.title.trim()) {
        // Focus URL field
        document.getElementById("url-input")?.focus();
      } else if (field === "url" && newUrl.url.trim() && newUrl.title.trim()) {
        addUrl();
      }
    }
  };

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
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., E-commerce Website for Fashion Brand"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive name for your project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief one-line description of the project..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A concise summary for quick reference (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the project, including challenges solved, technologies used, and outcomes achieved..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed project description for use in proposals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROJECT_TYPE.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="capitalize"
                            >
                              {type.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., web development, mobile app"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Help organize your projects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="completedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            field.onChange(date);
                          }}
                        />
                        <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      When was this project completed? (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Project URLs */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Links</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Link title (e.g., Live Demo)"
                    value={newUrl.title}
                    onChange={(e) =>
                      setNewUrl({ ...newUrl, title: e.target.value })
                    }
                    onKeyDown={(e) => handleUrlKeyDown(e, "title")}
                  />
                  <div className="flex gap-2">
                    <Input
                      id="url-input"
                      placeholder="https://example.com"
                      value={newUrl.url}
                      onChange={(e) =>
                        setNewUrl({ ...newUrl, url: e.target.value })
                      }
                      onKeyDown={(e) => handleUrlKeyDown(e, "url")}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addUrl}
                      variant="outline"
                      size="sm"
                      disabled={!newUrl.title.trim() || !newUrl.url.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {form.watch("urls").length > 0 && (
                  <div className="space-y-2">
                    {form.watch("urls").map((url, index) => (
                      <div
                        key={`${url.title}-${url.url}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">
                              {url.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {url.url}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeUrl(index)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(PROJECT_TYPE),
  category: z.string().optional(),
  urls: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    }),
  ),
  completedAt: z.date().nullable(),
});

type InsertProject = z.infer<typeof schema>;
