"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Slide-up bottom sheet on mobile, centered on larger screens. Reduced-motion safe (CSS). */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full sm:max-w-app max-h-[92dvh] overflow-y-auto no-scrollbar",
          "cut-lg surface animate-slide-up",
          className,
        )}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 px-4 h-14 surface border-b border-border z-10">
          <h2 className="font-mono uppercase tracking-wide text-sm font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center h-9 w-9 cut surface-2 text-muted hover:text-text focusable"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
