import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", `${window.location.origin}${path}`);
}

/** Sets per-page title, meta description, OG/Twitter tags, and canonical URL. */
export function useDocumentMeta({ title, description, canonicalPath }: DocumentMetaOptions) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }
    setMetaTag("property", "og:title", title);
    setMetaTag("name", "twitter:title", title);
    if (canonicalPath) setCanonical(canonicalPath);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonicalPath]);
}
