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
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label={ariaLabel}
    className={cn("shrink-0", className)}
    role="img"
  >
    <defs>
      <linearGradient
        id="logo-gradient"
        x1="0"
        y1="32"
        x2="32"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="hsl(262 83% 58%)" />
        <stop offset="1" stopColor="hsl(189 94% 43%)" />
      </linearGradient>
    </defs>
    {/* Background rounded square */}
    <rect
      x="2"
      y="2"
      width="28"
      height="28"
      rx="8"
      fill="url(#logo-gradient)"
    />
    {/* Quote marks to represent conversation/proposals */}
    <rect
      x="10"
      y="11"
      width="5"
      height="8"
      rx="1.5"
      fill="white"
      opacity="0.95"
    />
    <rect
      x="17"
      y="11"
      width="5"
      height="8"
      rx="1.5"
      fill="white"
      opacity="0.8"
    />
    {/* Small sparkle */}
    <circle cx="23.5" cy="8.5" r="1.5" fill="white" opacity="0.9" />
  </svg>
);

export function Logo({ className, size = 24, withText = true }: LogoProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <LogoMark size={size} ariaLabel={withText ? undefined : "QuickRite"} />
      {withText ? (
        <span className="text-lg font-semibold tracking-tight">QuickRite</span>
      ) : null}
    </div>
  );
}
