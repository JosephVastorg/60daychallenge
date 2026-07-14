"use client";

import * as React from "react";
import Link from "next/link";

const KEY = "sixty-consent";

/** Minimal GDPR consent banner. We only use strictly-necessary auth cookies. */
export function CookieConsent() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — skip */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-app p-3">
      <div className="cut surface border border-border p-3 flex items-center gap-3 shadow-lg">
        <p className="text-xs text-muted flex-1">
          We use strictly-necessary cookies to keep you signed in. See our{" "}
          <Link href="/legal/privacy" className="text-accent">
            privacy policy
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="cut btn-accent h-9 px-4 font-mono uppercase text-[11px] font-bold focusable shrink-0"
        >
          OK
        </button>
      </div>
    </div>
  );
}
