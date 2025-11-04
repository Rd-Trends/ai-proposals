"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { generateTemplateContent } from "@/actions/template-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

type AIOutputSuccessData = ReturnType<
  typeof generateTemplateContent
> extends Promise<infer U>
  ? U
  : never;

type AIGenerationData = {
  description: string;
  category?: string;
  tone?: string;
};

interface AITemplateGeneratorProps {
  onSuccess: (data: AIOutputSuccessData) => Promise<void> | void;
  hasRequiredData?: boolean;
  existingData?: Partial<AIGenerationData>;
}

export function AITemplateGenerator({
  onSuccess,
  hasRequiredData = false,
  existingData,
}: AITemplateGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<{ description: string }>({
    defaultValues: {
      description: existingData?.description || "",
    },
  });

  const handleGenerate = (data: AIGenerationData) => {
    startTransition(async () => {
      try {
        const result = await generateTemplateContent(data.description);
        await onSuccess(result);
        setOpen(false);
      } catch (error) {
        console.error("Error generating template:", error);
      }
    });
  };

  if (hasRequiredData) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() =>
          handleGenerate({ description: existingData?.description || "" })
        }
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="sr-only">Generating Template Content...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span className="sr-only">Generate with AI</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={isPending}>
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">Generate with AI</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full max-w-sm p-4"
        align="start"
        side="bottom"
        collisionPadding={16}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-medium">Generate Template with AI</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Provide a description of your proposal template and AI will
              generate the content for you.
            </p>
          </div>

          <form
            id="create-template-form"
            onSubmit={(e) => {
              e.preventDefault();
              // prevent submit button from submitting other forms on the page
              e.stopPropagation();

              form.handleSubmit(handleGenerate)(e);
            }}
            className="space-y-4"
          >
            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                rules={{ required: "Description is required" }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-template-description">
                      Template Description *
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="ai-template-description"
                      placeholder="Describe what kind of proposal template you want to create. For example: 'A web development proposal template for e-commerce projects including timeline, features, and pricing sections.'"
                      className="resize-none min-h-[120px] max-h-60"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    <FieldDescription>
                      Be specific about the type of proposal, industry, and key
                      sections you want included
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-template-form"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
