import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const home = location === "/";
  const clear = home && !scrolled && !mobileOpen;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-[11px] uppercase tracking-[0.28em] transition-opacity hover:opacity-60 ${
        location === href ? "underline underline-offset-8 decoration-primary" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${home ? "-mb-20" : ""} ${
        clear
          ? "bg-transparent text-white"
          : "bg-background/95 text-foreground backdrop-blur border-b border-border"
      }`}
    >
      <div className="container mx-auto h-20 px-6 flex items-center justify-between">
        {/* Left Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {link("/recipes", "Recipes")}
          {link("/about", "Maison")}
        </nav>

        {/* Brand Logo */}
        <Link
          href="/"
          className="font-serif text-2xl md:text-3xl tracking-[0.04em]"
          data-testid="link-home-logo"
        >
          Fork <span className="italic text-primary">&</span> Flavor
        </Link>

        {/* Right Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {link("/contact", "Contact")}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-current hover:opacity-75 transition-opacity"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background text-foreground border-b border-border px-6 py-8 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-6 text-center">
            <Link
              href="/"
              className={`text-sm uppercase tracking-[0.28em] font-medium py-2 ${location === "/" ? "text-primary font-bold" : "text-foreground"}`}
            >
              Home
            </Link>
            <Link
              href="/recipes"
              className={`text-sm uppercase tracking-[0.28em] font-medium py-2 ${location === "/recipes" ? "text-primary font-bold" : "text-foreground"}`}
            >
              Recipes
            </Link>
            <Link
              href="/about"
              className={`text-sm uppercase tracking-[0.28em] font-medium py-2 ${location === "/about" ? "text-primary font-bold" : "text-foreground"}`}
            >
              Maison
            </Link>
            <Link
              href="/contact"
              className={`text-sm uppercase tracking-[0.28em] font-medium py-2 ${location === "/contact" ? "text-primary font-bold" : "text-foreground"}`}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
