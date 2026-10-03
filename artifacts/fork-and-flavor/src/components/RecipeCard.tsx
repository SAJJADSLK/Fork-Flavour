import { Link } from "wouter";
import { Star } from "lucide-react";
import type { RecipeSummary } from "@workspace/api-client-react";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipe/${recipe.slug}`} className="block group h-full">
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      </div>
      <div className="gold-divider mt-5 flex items-center justify-between pt-3 text-muted-foreground">
        <span className="tracking-[0.2em]">{recipe.category}</span>
        <span className="flex items-center gap-3 tracking-[0.2em]">
          {recipe.totalMinutes != null && <span>{recipe.totalMinutes} min</span>}
          {recipe.reviewCount > 0 && (
            <span className="flex items-center gap-1 text-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" />
              {recipe.rating.toFixed(1)}
            </span>
          )}
        </span>
      </div>
      <h3 className="mt-3 font-serif text-2xl leading-tight line-clamp-2 transition-colors group-hover:text-bronze">
        {recipe.title}
      </h3>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse bg-muted" />
      <div className="mt-5 h-3 w-1/2 animate-pulse bg-muted" />
      <div className="mt-4 h-6 w-3/4 animate-pulse bg-muted" />
    </div>
  );
}
