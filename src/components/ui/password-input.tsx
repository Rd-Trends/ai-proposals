"use client";

import { Eye, EyeOff } from "lucide-react";
import React from "react";
import type { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  showToggle?: boolean;
};

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <InputGroup className={className}>
      <InputGroupInput type={showPassword ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={togglePasswordVisibility}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
