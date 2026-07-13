import { Link } from "wouter";
import { Clock, Star, Flame } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecipeSummary } from "@workspace/api-client-react";

interface RecipeCardProps {
  recipe: RecipeSummary;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.slug}`} className="block group h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-transparent hover:border-border bg-card">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background">
              {recipe.category}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            {recipe.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span className="font-medium text-foreground">{recipe.rating.toFixed(1)}</span>
                <span>({recipe.reviewCount})</span>
              </div>
            ) : (
              <span />
            )}
            {recipe.dietaryTags.length > 0 && (
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {recipe.dietaryTags[0]}
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-4 mt-2">
            {recipe.totalMinutes != null && (
              <div className="flex items-center gap-1.5" title="Total time">
                <Clock className="w-4 h-4" />
                <span>{recipe.totalMinutes}m</span>
              </div>
            )}
            <div className="flex items-center gap-1.5" title="Cooking method">
              <Flame className="w-4 h-4" />
              <span className="capitalize">{recipe.cookMethod}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecipeCardSkeleton() {
  return (
    <Card className="h-full border-transparent">
      <div className="aspect-[4/3] bg-muted animate-pulse rounded-t-lg" />
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
      </CardContent>
    </Card>
  );
}
