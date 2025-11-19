import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Controls the pixel size of the icon mark (height/width). */
  size?: number;
  /** Show the wordmark text next to the icon. */
  withText?: boolean;
};

const LogoMark = ({
  size = 24,
  className,
  ariaLabel,
}: {
  size?: number;
  className?: string;
  ariaLabel?: string;
}) => (
  <svg
    aria-label={ariaLabel}
    className={cn("shrink-0", className)}
    fill="none"
    height={size}
    role="img"
    viewBox="0 0 32 32"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="logo-gradient"
        x1="0"
        x2="32"
        y1="32"
        y2="0"
      >
        <stop stopColor="hsl(262 83% 58%)" />
        <stop offset="1" stopColor="hsl(189 94% 43%)" />
      </linearGradient>
    </defs>
    {/* Background rounded square */}
    <rect
      fill="url(#logo-gradient)"
      height="28"
      rx="8"
      width="28"
      x="2"
      y="2"
    />
    {/* Quote marks to represent conversation/proposals */}
    <rect
      fill="white"
      height="8"
      opacity="0.95"
      rx="1.5"
      width="5"
      x="10"
      y="11"
    />
    <rect
      fill="white"
      height="8"
      opacity="0.8"
      rx="1.5"
      width="5"
      x="17"
      y="11"
    />
    {/* Small sparkle */}
    <circle cx="23.5" cy="8.5" fill="white" opacity="0.9" r="1.5" />
  </svg>
);

export function Logo({ className, size = 24, withText = true }: LogoProps) {
  return (
    <div
      className={cn("inline-flex select-none items-center gap-2", className)}
    >
      <LogoMark ariaLabel={withText ? undefined : "QuickRite"} size={size} />
      {withText ? (
        <span className="font-semibold text-lg tracking-tight">QuickRite</span>
      ) : null}
    </div>
  );
}
