import { Footer } from "@/components/home/footer";
import { Navbar } from "@/components/site-layout/navbar";
import { cn } from "@/lib/utils";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/body antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] xl:[--footer-height:calc(var(--spacing)*24)]",
      )}
    >
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
