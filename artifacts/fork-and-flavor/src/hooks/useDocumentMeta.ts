import { useEffect } from "react";

interface DocumentMetaOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
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

/** Sets per-page title, meta description, OG/Twitter tags, canonical URL, and social image. */
export function useDocumentMeta({ title, description, canonicalPath, ogImage }: DocumentMetaOptions) {
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
    setMetaTag("property", "og:type", "website");
    setMetaTag("name", "twitter:card", ogImage ? "summary_large_image" : "summary");

    if (ogImage) {
      setMetaTag("property", "og:image", ogImage);
      setMetaTag("name", "twitter:image", ogImage);
    }

    if (canonicalPath) {
      setCanonical(canonicalPath);
      setMetaTag("property", "og:url", `${window.location.origin}${canonicalPath}`);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonicalPath, ogImage]);
}
