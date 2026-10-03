import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const home = location === "/";
  const clear = home && !scrolled;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const link = (href: string, label: string) => (
    <Link href={href} className={`text-[11px] uppercase tracking-[0.28em] transition-opacity hover:opacity-60 ${location === href ? "underline underline-offset-8 decoration-primary" : ""}`}>
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 h-20 w-full transition-colors duration-500 ${home ? "-mb-20" : ""} ${
        clear ? "bg-transparent text-white" : "bg-background/90 text-foreground backdrop-blur border-b border-border"
      }`}
    >
      <div className="container mx-auto h-full px-6 grid grid-cols-3 items-center">
        <nav className="flex items-center gap-6">{link("/recipes", "Recipes")}</nav>
        <Link href="/" className="justify-self-center font-serif text-2xl md:text-3xl tracking-[0.04em]" data-testid="link-home-logo">
          Fork <span className="italic text-primary">&</span> Flavor
        </Link>
        <nav className="flex items-center gap-6 justify-self-end">{link("/about", "Maison")}</nav>
      </div>
    </header>
  );
}
