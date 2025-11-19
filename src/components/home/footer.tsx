import Link from "next/link";
import { Container } from "@/components/site-layout/container";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-secondary/20 border-t bg-secondary/50 px-4 text-secondary-foreground md:px-10">
      <Container className="py-12" size="full">
        {/* <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold mb-4 block">
              QuickRite
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered proposal generator for freelancers. Create winning
              proposals in minutes and land more clients.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@aiproposals.com"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div> */}

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {currentYear} QuickRite. All rights reserved.
          </p>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <Link className="transition-colors hover:text-foreground" href="#">
              Privacy Policy
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
