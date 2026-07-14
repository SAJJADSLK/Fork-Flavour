import { useState } from "react";
import { Star, Check } from "lucide-react";
import { useRateRecipe, getGetRecipeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface RecipeRatingProps {
  slug: string;
  rating: number;
  reviewCount: number;
}

function votedKey(slug: string) {
  return `fork-and-flavor:rated:${slug}`;
}

/**
 * Lets a reader leave a 1-5 star rating for a recipe. No accounts — one vote
 * per browser, tracked in localStorage. This is the site's only real rating
 * signal (no fabricated numbers), so it directly powers the on-page average
 * and the recipe's JSON-LD aggregateRating.
 */
export function RecipeRating({ slug, rating, reviewCount }: RecipeRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [alreadyVoted, setAlreadyVoted] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(votedKey(slug)) != null,
  );
  const { mutate, isPending } = useRateRecipe();
  const queryClient = useQueryClient();

  const submit = (value: number) => {
    if (alreadyVoted || isPending) return;
    mutate(
      { slug, data: { rating: value } },
      {
        onSuccess: () => {
          localStorage.setItem(votedKey(slug), String(value));
          setAlreadyVoted(true);
          queryClient.invalidateQueries({ queryKey: getGetRecipeQueryKey(slug) });
        },
      },
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="font-serif text-xl font-bold mb-1">
        {reviewCount > 0 ? "Reader ratings" : "Be the first to rate this"}
      </h3>
      {reviewCount > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {rating.toFixed(1)} average from {reviewCount} {reviewCount === 1 ? "rating" : "ratings"}
        </p>
      )}
      {alreadyVoted ? (
        <p className="flex items-center gap-2 text-sm text-primary font-medium mt-2">
          <Check className="w-4 h-4" /> Thanks for rating this recipe!
        </p>
      ) : (
        <div
          className="flex items-center gap-1 mt-2"
          onMouseLeave={() => setHovered(0)}
          role="radiogroup"
          aria-label="Rate this recipe"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={isPending}
              aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              onMouseEnter={() => setHovered(value)}
              onClick={() => submit(value)}
              className="p-0.5 disabled:opacity-50"
            >
              <Star
                className={cn(
                  "w-7 h-7 transition-colors",
                  (hovered || 0) >= value ? "fill-amber-500 text-amber-500" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
