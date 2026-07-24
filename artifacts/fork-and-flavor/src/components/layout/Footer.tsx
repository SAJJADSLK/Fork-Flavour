import { Link } from "wouter";
import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 inline-flex">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">Fork & Flavor</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              The Intelligent Kitchen. Tested data, precise timing, and structured methods for home cooks who cook. No life stories, just recipes that work.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/recipes" className="hover:text-primary transition-colors">All Recipes</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Philosophy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Fork & Flavor. All rights reserved.</p>
          <p>Recipes sourced from <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">TheMealDB</a></p>
        </div>
      </div>
    </footer>
  );
}
