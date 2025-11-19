"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function MagicLinkAuth() {
  const [isPending, startTransition] = useTransition();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (formData: FormValues) => {
    startTransition(async () => {
      const { error } = await authClient.signIn.magicLink({
        email: formData.email,
        callbackURL: "/dashboard",
      });
      if (error) {
        console.error("Error sending magic link:", error);
        toast.error(
          error.status === 401
            ? error.message || "Unauthorized"
            : "Failed to send magic link. Please try again."
        );
      } else {
        toast.success("Magic link sent! Check your email.");
        startTransition(() => {
          setEmailValue(formData.email);
          setIsEmailSent(true);
        });
      }
    });
  };

  if (isEmailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="font-bold text-2xl">Check your email</h2>
          <p className="text-gray-600">
            We&apos;ve sent a magic link to <strong>{emailValue}</strong>
          </p>
          <p className="text-gray-500 text-sm">
            Click the link in your email to sign in. The link will expire in 10
            minutes.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEmailSent(false);
            form.reset();
          }}
          variant="outline"
        >
          Try different email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl">Sign in to QuickRite</h2>
        <p className="text-gray-600">
          Enter your email and we&apos;ll send you a magic link to sign in
        </p>
      </div>
      <form id="magic-link-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                  id="magic-link-email"
                  placeholder="Enter your email"
                  type="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            className="w-full"
            disabled={isPending}
            form="magic-link-form"
            type="submit"
          >
            {isPending ? "Sending..." : "Send magic link"}
          </Button>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center text-xs">
        By signing in, you agree to our terms of service and privacy policy.
      </FieldDescription>
    </div>
  );
}
