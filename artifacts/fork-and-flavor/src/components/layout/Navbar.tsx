import { Link, useLocation } from "wouter";
import { Search, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80" data-testid="link-home-logo">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">Fork & Flavor</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link 
            href="/recipes" 
            className={`transition-colors hover:text-primary ${location === "/recipes" ? "text-primary" : "text-muted-foreground"}`}
          >
            Recipes
          </Link>
          <Link 
            href="/about" 
            className={`transition-colors hover:text-primary ${location === "/about" ? "text-primary" : "text-muted-foreground"}`}
          >
            Philosophy
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/recipes" className="hidden md:flex">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Search recipes">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
