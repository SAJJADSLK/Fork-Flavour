// AdSense is only enabled once a publisher ID is configured via
// VITE_ADSENSE_CLIENT_ID (format: "ca-pub-XXXXXXXXXXXXXXXX"). Until then the
// site runs ad-free rather than shipping broken ad requests.
export const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID as
  | string
  | undefined;

export const ADSENSE_ENABLED = Boolean(ADSENSE_CLIENT_ID);

let scriptLoaded = false;

/** Injects Google's AdSense loader script once, enabling Auto ads site-wide. */
export function loadAdSenseScript() {
  if (!ADSENSE_ENABLED || scriptLoaded || typeof document === "undefined") return;
  scriptLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
