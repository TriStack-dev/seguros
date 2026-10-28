"use client";

import { useLayoutEffect } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

export function PublicTagManager({ gtmId }: { gtmId: string }) {
  useLayoutEffect(() => {
    // Queue mount events before next/script initializes GTM after hydration.
    const queue: Record<string, unknown>[] = [];
    window.dataLayer ??= queue;
  }, []);
  return <GoogleTagManager gtmId={gtmId} />;
}
