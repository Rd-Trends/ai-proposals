"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InstallPWAPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const isIOSDevice =
      // biome-ignore lint/suspicious/noExplicitAny: navigator userAgent type check
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    setIsIOS(isIOSDevice);
    setIsStandalone(isStandaloneMode);

    // Show dialog automatically for iOS devices if not in standalone mode
    if (isIOSDevice && !isStandaloneMode) {
      setShowDialog(true);
    }
  }, []);

  if (isStandalone) {
    return null; // Don't show anything if already installed
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install App</DialogTitle>
          <DialogDescription>
            {isIOS ? (
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  To install this app on your iOS device:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Tap the share button{" "}
                    <span
                      role="img"
                      aria-label="share icon"
                      className="text-lg"
                    >
                      ⎋
                    </span>{" "}
                    at the bottom of your browser
                  </li>
                  <li>
                    Scroll down and tap "Add to Home Screen"{" "}
                    <span role="img" aria-label="plus icon" className="text-lg">
                      ➕
                    </span>
                  </li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pt-4">
                Install this app on your device for quick and easy access.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        {isIOS && (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Got It
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
