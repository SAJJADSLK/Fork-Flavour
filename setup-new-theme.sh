#!/usr/bin/env bash
set -e

# 1) overwrite index.css (new theme: Ink/Paper/Cayenne/Butter/Herb/Steel)
cat > artifacts/fork-and-flavor/src/index.css << 'INDEXCSS_EOF'
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
@import 'tailwindcss';
@import 'tw-animate-css';
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-card-border: hsl(var(--card-border));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-popover-border: hsl(var(--popover-border));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-border: var(--primary-border);

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-secondary-border: var(--secondary-border);

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-muted-border: var(--muted-border);

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-accent-border: var(--accent-border);

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-destructive-border: var(--destructive-border);

  --color-sidebar: hsl(var(--sidebar));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-primary-border: var(--sidebar-primary-border);
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-accent-border: var(--sidebar-accent-border);
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --font-sans: var(--app-font-sans);
  --font-serif: var(--app-font-serif);
  --font-mono: var(--app-font-mono);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/*
  ── Fork & Flavor, take two ──────────────────────────────────────────────
  Ink / Paper / Cayenne / Butter / Herb / Steel.
  A test-kitchen aesthetic: high-contrast ink-on-paper, one vivid punch of
  cayenne, mono numerals everywhere a time/temp/serving count appears (see
  the "order ticket" strip on RecipeCard) — like chits off a kitchen rail,
  not another cream-and-terracotta food blog.
*/

/* LIGHT MODE */
:root {
  --button-outline: rgba(23, 24, 28, 0.12);
  --badge-outline: rgba(23, 24, 28, 0.08);

  --opaque-button-border-intensity: -10;

  --elevate-1: rgba(23, 24, 28, 0.04);
  --elevate-2: rgba(23, 24, 28, 0.09);

  --background: 60 9% 96%;
  --foreground: 220 9% 10%;
  --border: 220 9% 10%;

  --card: 0 0% 100%;
  --card-foreground: 220 9% 10%;
  --card-border: 220 9% 10%;

  --sidebar: 60 9% 96%;
  --sidebar-foreground: 220 9% 10%;
  --sidebar-border: 220 9% 10%;
  --sidebar-primary: 14 100% 56%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 60 9% 90%;
  --sidebar-accent-foreground: 220 9% 10%;
  --sidebar-ring: 14 100% 56%;

  --popover: 0 0% 100%;
  --popover-foreground: 220 9% 10%;
  --popover-border: 220 9% 10%;

  /* Cayenne */
  --primary: 14 100% 56%;
  --primary-foreground: 0 0% 100%;

  /* Herb */
  --secondary: 154 42% 20%;
  --secondary-foreground: 60 9% 96%;

  --muted: 60 5% 90%;
  --muted-foreground: 220 6% 38%;

  /* Butter */
  --accent: 43 100% 63%;
  --accent-foreground: 220 9% 10%;

  --destructive: 0 72% 46%;
  --destructive-foreground: 0 0% 100%;

  --input: 220 9% 10%;
  --ring: 14 100% 56%;

  --chart-1: 14 100% 56%;
  --chart-2: 154 42% 20%;
  --chart-3: 43 100% 63%;
  --chart-4: 220 9% 10%;
  --chart-5: 220 6% 60%;

  --app-font-sans: 'IBM Plex Sans', sans-serif;
  --app-font-serif: 'Bricolage Grotesque', sans-serif;
  --app-font-mono: 'IBM Plex Mono', monospace;
  --radius: 0.375rem;

  --shadow-2xs: 2px 2px 0px 0px rgba(23, 24, 28, 1);
  --shadow-xs: 3px 3px 0px 0px rgba(23, 24, 28, 1);
  --shadow-sm: 4px 4px 0px 0px rgba(23, 24, 28, 1);
  --shadow: 5px 5px 0px 0px rgba(23, 24, 28, 1);
  --shadow-md: 6px 6px 0px 0px rgba(23, 24, 28, 1);
  --shadow-lg: 8px 8px 0px 0px rgba(23, 24, 28, 1);
  --shadow-xl: 10px 10px 0px 0px rgba(23, 24, 28, 1);
  --shadow-2xl: 14px 14px 0px 0px rgba(23, 24, 28, 1);

  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border: hsl(from hsl(var(--sidebar-accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border: hsl(from hsl(var(--primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border: hsl(from hsl(var(--secondary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border: hsl(from hsl(var(--muted)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border: hsl(from hsl(var(--accent)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border: hsl(from hsl(var(--destructive)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

.dark {
  --button-outline: rgba(245, 245, 241, 0.12);
  --badge-outline: rgba(245, 245, 241, 0.08);

  --opaque-button-border-intensity: 10;

  --elevate-1: rgba(245, 245, 241, 0.05);
  --elevate-2: rgba(245, 245, 241, 0.1);

  --background: 220 12% 8%;
  --foreground: 60 9% 96%;
  --border: 60 9% 90%;

  --card: 220 12% 11%;
  --card-foreground: 60 9% 96%;
  --card-border: 60 9% 82%;

  --sidebar: 220 12% 8%;
  --sidebar-foreground: 60 9% 96%;
  --sidebar-border: 60 9% 82%;
  --sidebar-primary: 14 100% 60%;
  --sidebar-primary-foreground: 220 9% 10%;
  --sidebar-accent: 220 12% 16%;
  --sidebar-accent-foreground: 60 9% 96%;
  --sidebar-ring: 14 100% 60%;

  --popover: 220 12% 11%;
  --popover-foreground: 60 9% 96%;
  --popover-border: 60 9% 82%;

  --primary: 14 100% 60%;
  --primary-foreground: 220 9% 10%;

  --secondary: 154 35% 55%;
  --secondary-foreground: 220 9% 10%;

  --muted: 220 10% 18%;
  --muted-foreground: 60 6% 70%;

  --accent: 43 100% 63%;
  --accent-foreground: 220 9% 10%;

  --destructive: 0 62.8% 40%;
  --destructive-foreground: 60 9% 96%;

  --input: 60 9% 82%;
  --ring: 14 100% 60%;

  --chart-1: 14 100% 60%;
  --chart-2: 154 35% 55%;
  --chart-3: 43 100% 63%;
  --chart-4: 60 9% 96%;
  --chart-5: 60 6% 55%;

  --shadow-2xs: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  --shadow-xs: 3px 3px 0px 0px rgba(0, 0, 0, 1);
  --shadow-sm: 4px 4px 0px 0px rgba(0, 0, 0, 1);
  --shadow: 5px 5px 0px 0px rgba(0, 0, 0, 1);
  --shadow-md: 6px 6px 0px 0px rgba(0, 0, 0, 1);
  --shadow-lg: 8px 8px 0px 0px rgba(0, 0, 0, 1);
  --shadow-xl: 10px 10px 0px 0px rgba(0, 0, 0, 1);
  --shadow-2xl: 14px 14px 0px 0px rgba(0, 0, 0, 1);
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply font-sans antialiased bg-background text-foreground selection:bg-primary/25 selection:text-foreground;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif tracking-tight;
  }
}

@layer utilities {
  input[type='search']::-webkit-search-cancel-button {
    @apply hidden;
  }
  [contenteditable][data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
  }

  /* "Order ticket" strip — the site's signature motif. A row of mono
     numerals (time / servings / difficulty) styled like a printed kitchen
     chit, used on recipe cards and the recipe detail hero. */
  .ticket-strip {
    @apply font-mono text-xs font-semibold uppercase tracking-wider;
    background-image: repeating-linear-gradient(
      to right,
      hsl(var(--foreground)) 0,
      hsl(var(--foreground)) 6px,
      transparent 6px,
      transparent 12px
    );
    background-position: top;
    background-size: 12px 2px;
    background-repeat: repeat-x;
  }
}

INDEXCSS_EOF

# 2) overwrite RecipeCard.tsx (adds the order-ticket signature strip)
cat > artifacts/fork-and-flavor/src/components/RecipeCard.tsx << 'RECIPECARD_EOF'
import { Link } from "wouter";
import { Clock, Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecipeSummary } from "@workspace/api-client-react";

interface RecipeCardProps {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.slug}`} className="block group h-full">
      <Card className="h-full overflow-hidden rounded-md border-2 border-card-border bg-card shadow-none transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-card-border">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm text-foreground border border-card-border rounded-sm">
              {recipe.category}
            </Badge>
          </div>
        </div>

        {/* Order-ticket strip: mono numerals, dashed rule, like a chit off the kitchen rail */}
        <div className="ticket-strip flex items-center justify-between px-4 py-2 pt-3 text-muted-foreground">
          <div className="flex items-center gap-3">
            {recipe.totalMinutes != null && (
              <span className="flex items-center gap-1" title="Total time">
                <Clock className="w-3.5 h-3.5" />
                {recipe.totalMinutes}m
              </span>
            )}
            <span className="flex items-center gap-1" title="Cooking method">
              {recipe.cookMethod}
            </span>
          </div>
          {recipe.reviewCount > 0 && (
            <span className="flex items-center gap-1 text-foreground" title="Rating">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              {recipe.rating.toFixed(1)}
            </span>
          )}
        </div>

        <CardHeader className="p-4 pt-2 pb-2">
          <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </CardHeader>

        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          {recipe.dietaryTags.length > 0 && (
            <span className="text-xs uppercase tracking-wider font-semibold text-secondary">
              {recipe.dietaryTags[0]}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="h-full rounded-md border-2 border-card-border shadow-none">
      <div className="aspect-[4/3] bg-muted animate-pulse border-b-2 border-card-border" />
      <div className="px-4 py-2 pt-3">
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </div>
      <CardHeader className="p-4 pt-2 pb-2 space-y-2">
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}


RECIPECARD_EOF

# 3) overwrite Navbar.tsx (bolder logo mark + border)
cat > artifacts/fork-and-flavor/src/components/layout/Navbar.tsx << 'NAVBAR_EOF'
import { Link, useLocation } from "wouter";
import { Search, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80" data-testid="link-home-logo">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-sm border-2 border-foreground">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-serif font-extrabold text-xl tracking-tight">Fork & Flavor</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-wide">
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
            <Button variant="ghost" size="icon" className="rounded-sm" aria-label="Search recipes">
              <Search className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

NAVBAR_EOF

echo "Theme files updated. Now run:"
echo "  git add -A && git commit -m \"Redesign theme: bold/modern Ink-Cayenne-Butter palette\" && git push"
