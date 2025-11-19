"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { joinWaitlistAction } from "@/actions/waitlist-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth-client";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (formData: FormValues) => {
    startTransition(async () => {
      try {
        // Create the user account
        const { error } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: "/dashboard",
          bio: "",
        });

        if (error) {
          console.error("Sign up error:", error);
          toast.error(
            error.message || "Failed to create account. Please try again."
          );
        } else {
          const res = await joinWaitlistAction({
            name: formData.name,
            email: formData.email,
          });

          if (res.isInWaitlist) {
            toast.success("Sign up successful! You can now sign in.");
          } else {
            toast.success(
              "Account created! You'll be able to sign in once your account is approved."
            );
          }

          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id="signup-name"
                      placeholder="John Doe"
                      type="text"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      id="signup-email"
                      placeholder="m@example.com"
                      type="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-password">
                          Password
                        </FieldLabel>
                        <PasswordInput
                          {...field}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                          id="signup-password"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signup-confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <PasswordInput
                          {...field}
                          aria-invalid={fieldState.invalid}
                          disabled={isPending}
                          id="signup-confirm-password"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Button
                className="w-full"
                disabled={isPending}
                form="signup-form"
                type="submit"
              >
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link className="underline" href="/auth/signin">
                  Sign in
                </Link>
                .
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our{" "}
        <Link className="underline" href="#">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="underline" href="#">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
