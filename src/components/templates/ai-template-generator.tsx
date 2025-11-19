"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { generateTemplateContentAction } from "@/actions/template-actions";
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
  typeof generateTemplateContentAction
> extends Promise<infer U>
  ? U
  : never;

type AIGenerationData = {
  description: string;
  category?: string;
  tone?: string;
};

type AITemplateGeneratorProps = {
  onSuccess: (data: AIOutputSuccessData) => Promise<void> | void;
  hasRequiredData?: boolean;
  existingData?: Partial<AIGenerationData>;
};

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
        const result = await generateTemplateContentAction(data.description);
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
        disabled={isPending}
        onClick={() =>
          handleGenerate({ description: existingData?.description || "" })
        }
        size="icon"
        type="button"
        variant="outline"
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
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button disabled={isPending} size="icon" type="button" variant="ghost">
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">Generate with AI</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-full max-w-sm p-4"
        collisionPadding={16}
        side="bottom"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-medium">Generate Template with AI</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Provide a description of your proposal template and AI will
              generate the content for you.
            </p>
          </div>

          <form
            className="space-y-4"
            id="create-template-form"
            onSubmit={(e) => {
              e.preventDefault();
              // prevent submit button from submitting other forms on the page
              e.stopPropagation();

              form.handleSubmit(handleGenerate)(e);
            }}
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ai-template-description">
                      Template Description *
                    </FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="max-h-60 min-h-[120px] resize-none"
                      disabled={isPending}
                      id="ai-template-description"
                      placeholder="Describe what kind of proposal template you want to create. For example: 'A web development proposal template for e-commerce projects including timeline, features, and pricing sections.'"
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
                rules={{ required: "Description is required" }}
              />
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                disabled={isPending}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                form="create-template-form"
                type="submit"
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
