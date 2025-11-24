import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cva, type VariantProps } from "class-variance-authority";
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const Toolbar = ({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root>) => {
  return (
    <ToolbarPrimitive.Root
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
};

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ToolbarToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

const ToolbarToggleGroup = ({
  className,
  variant,
  size = "sm",
  spacing = 0.5,
  children,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }) => {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}>
      <ToolbarToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToolbarToggleGroupContext.Provider>
    </ToolbarPrimitive.ToggleGroup>
  );
};

const ToolbarToggleItem = ({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> &
  VariantProps<typeof toggleVariants>) => {
  const context = useContext(ToolbarToggleGroupContext);

  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    />
  );
};

const ToolbarSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Separator>) => {
  return (
    <ToolbarPrimitive.Separator
      className={cn("mx-1 h-4 w-px bg-border", className)}
      {...props}
    />
  );
};

const ToolbarButton = ({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) => {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};

const ToolbarLink = ToolbarPrimitive.Link;

export {
  Toolbar,
  ToolbarToggleItem,
  ToolbarToggleGroup,
  ToolbarSeparator,
  ToolbarButton,
  ToolbarLink,
};
