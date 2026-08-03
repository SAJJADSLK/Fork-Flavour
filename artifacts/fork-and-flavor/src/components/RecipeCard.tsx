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

        {/* Gold-line divider: slim fading gold hairline above fine uppercase meta text */}
        <div className="gold-divider flex items-center justify-between px-4 py-2 pt-3 text-muted-foreground">
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


