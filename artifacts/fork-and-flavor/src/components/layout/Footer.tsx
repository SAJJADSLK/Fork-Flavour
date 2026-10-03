import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-serif text-4xl tracking-[0.04em]">Fork <span className="italic text-primary">&</span> Flavor</p>
        <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed opacity-70">
          Recipes, precisely written. Clear timing, honest ingredients, and substitutions that make sense.
        </p>
        <nav className="mt-10 flex justify-center gap-8 text-[11px] uppercase tracking-[0.28em]">
          <Link href="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <Link href="/about" className="hover:text-primary transition-colors">Maison</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </nav>
        <div className="mx-auto mt-14 h-px max-w-xs bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <p className="mt-6 text-xs opacity-50">
          © {new Date().getFullYear()} Fork & Flavor · Recipes sourced from{" "}
          <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">TheMealDB</a>
        </p>
      </div>
    </footer>
  );
}
