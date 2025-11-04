"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProfile } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/lib/auth-client";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success("Profile updated successfully");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error);
      }
    });
  });

  return (
    <form id="profile-form" onSubmit={handleSubmit}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-name">Name</FieldLabel>
              <Input
                {...field}
                id="profile-name"
                placeholder="Your name"
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input
                {...field}
                id="profile-email"
                type="email"
                placeholder="your.email@example.com"
                aria-invalid={fieldState.invalid}
                disabled
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="profile-bio">Professional Bio</FieldLabel>
              <Textarea
                {...field}
                id="profile-bio"
                placeholder="Describe your professional background, key skills, expertise, notable projects, achievements, and what makes you unique as a freelancer..."
                className="min-h-[240px]"
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />
              <FieldDescription>
                Describe your expertise, experience, and what makes you stand
                out as a freelancer.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          form="profile-form"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
