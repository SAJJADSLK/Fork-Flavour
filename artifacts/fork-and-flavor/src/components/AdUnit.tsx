import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, ADSENSE_ENABLED } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdUnitProps {
  /** The ad unit slot ID from your AdSense dashboard. */
  slot: string;
  className?: string;
  format?: string;
}

/**
 * Renders a single AdSense display ad unit. Renders nothing until
 * VITE_ADSENSE_CLIENT_ID is configured, so the layout never shows broken
 * or empty ad boxes in the meantime.
 */
export function AdUnit({ slot, className, format = "auto" }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense script not ready yet or blocked (ad blocker) — safe to ignore.
    }
  }, []);

  if (!ADSENSE_ENABLED) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
