import { useRoute } from "wouter";
import { useGetRecipe, useGetRelatedRecipes } from "@workspace/api-client-react";
import { SubstitutionHelper } from "@/components/SubstitutionHelper";
import { RecipeCard } from "@/components/RecipeCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Flame, ChefHat, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { RecipeRating } from "@/components/RecipeRating";

export default function RecipeDetail() {
  const [, params] = useRoute("/recipe/:slug");
  const slug = params?.slug || "";

  const { data: recipe, isLoading, isError } = useGetRecipe(slug);
  const { data: relatedRecipes } = useGetRelatedRecipes(slug);

  useDocumentMeta({
    title: recipe ? `${recipe.title} Recipe | Fork & Flavor` : "Recipe | Fork & Flavor",
    description: recipe?.description,
    canonicalPath: `/recipe/${slug}`,
  });

  useJsonLd(
    recipe
      ? {
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: recipe.title,
          description: recipe.description,
          image: recipe.imageUrl ? [recipe.imageUrl] : undefined,
          recipeCategory: recipe.category,
          recipeCuisine: recipe.cuisine,
          recipeYield: recipe.servings != null ? `${recipe.servings} servings` : undefined,
          prepTime: recipe.prepMinutes != null ? `PT${recipe.prepMinutes}M` : undefined,
          cookTime: recipe.cookMinutes != null ? `PT${recipe.cookMinutes}M` : undefined,
          totalTime: recipe.totalMinutes != null ? `PT${recipe.totalMinutes}M` : undefined,
          recipeIngredient: recipe.ingredients.map((i) =>
            i.note ? `${i.item} (${i.note})` : i.item,
          ),
          recipeInstructions: recipe.instructions.map((step) => ({
            "@type": "HowToStep",
            text: step.text,
          })),
          nutrition:
            recipe.nutrition.calories != null
              ? {
                  "@type": "NutritionInformation",
                  calories: `${recipe.nutrition.calories} calories`,
                  proteinContent: recipe.nutrition.proteinG != null ? `${recipe.nutrition.proteinG}g` : undefined,
                  carbohydrateContent: recipe.nutrition.carbsG != null ? `${recipe.nutrition.carbsG}g` : undefined,
                  fatContent: recipe.nutrition.fatG != null ? `${recipe.nutrition.fatG}g` : undefined,
                }
              : undefined,
          aggregateRating:
            recipe.reviewCount > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: recipe.rating,
                  reviewCount: recipe.reviewCount,
                }
              : undefined,
        }
      : null,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Recipe Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the recipe you're looking for.</p>
        <Link href="/recipes" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header section */}
      <div className="bg-card border-b border-border pt-10 pb-16">
        <div className="container mx-auto px-4">
          <Link href="/recipes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Browse recipes
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
              {recipe.category}
            </Badge>
            {recipe.dietaryTags.map(tag => (
              <Badge key={tag} variant="outline" className="capitalize text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] mb-6">
            {recipe.title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed mb-8 font-sans">
            {recipe.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            {recipe.reviewCount > 0 && (
              <>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-foreground text-base">{recipe.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">({recipe.reviewCount} reviews)</span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
              </>
            )}
            
            <div className="flex items-center gap-6 text-muted-foreground">
              {recipe.totalMinutes != null && (
                <div className="flex items-center gap-2" title="Total Time">
                  <Clock className="w-5 h-5 text-foreground" />
                  <span>{recipe.totalMinutes}m</span>
                </div>
              )}
              {recipe.servings != null && (
                <div className="flex items-center gap-2" title="Servings">
                  <Users className="w-5 h-5 text-foreground" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
              <div className="flex items-center gap-2" title="Cuisine">
                <ChefHat className="w-5 h-5 text-foreground" />
                <span>{recipe.cuisine}</span>
              </div>
              <div className="flex items-center gap-2" title="Cooking Method">
                <Flame className="w-5 h-5 text-foreground" />
                <span className="capitalize">{recipe.cookMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
          
          {/* Main Content: Image & Instructions */}
          <div className="space-y-12 min-w-0">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted border border-border shadow-sm">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded flex items-center justify-center text-lg">2</span>
                Instructions
              </h2>
              <div className="space-y-8">
                {recipe.instructions.map((instruction) => (
                  <div key={instruction.step} className="flex gap-6 group">
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center font-serif font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        {instruction.step}
                      </div>
                      {instruction.step !== recipe.instructions.length && (
                        <div className="w-px h-full bg-border mt-4 group-hover:bg-primary/20 transition-colors" />
                      )}
                    </div>
                    <div className="pb-8 pt-1.5">
                      <p className="text-lg leading-relaxed text-foreground">
                        {instruction.text}
                      </p>
                      {instruction.timerMinutes && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Set timer for {instruction.timerMinutes} minutes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Ingredients, Timings, Nutrition */}
          <div className="space-y-8 lg:sticky lg:top-24">
            
            {/* Quick Stats Box */}
            {(recipe.prepMinutes != null || recipe.cookMinutes != null || recipe.totalMinutes != null) && (
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-border text-center">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Prep</p>
                    <p className="font-serif text-xl font-medium">{recipe.prepMinutes != null ? `${recipe.prepMinutes}m` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Cook</p>
                    <p className="font-serif text-xl font-medium">{recipe.cookMinutes != null ? `${recipe.cookMinutes}m` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total</p>
                    <p className="font-serif text-xl font-medium text-primary">{recipe.totalMinutes != null ? `${recipe.totalMinutes}m` : "—"}</p>
                  </div>
                </div>
              </div>
            )}

            <RecipeRating slug={recipe.slug} rating={recipe.rating} reviewCount={recipe.reviewCount} />

            <SubstitutionHelper recipeSlug={recipe.slug} />

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded flex items-center justify-center text-lg">1</span>
                Ingredients
              </h2>
              <ul className="space-y-4">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                    <div>
                      <span className="text-foreground font-medium">{ingredient.item}</span>
                      {ingredient.note && (
                        <span className="text-muted-foreground text-sm block mt-0.5">
                          {ingredient.note}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutrition */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-4">Nutrition per serving</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground mb-1">Cals</p>
                  <p className="font-medium">{recipe.nutrition.calories || "—"}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground mb-1">Protein</p>
                  <p className="font-medium">{recipe.nutrition.proteinG ? `${recipe.nutrition.proteinG}g` : "—"}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground mb-1">Carbs</p>
                  <p className="font-medium">{recipe.nutrition.carbsG ? `${recipe.nutrition.carbsG}g` : "—"}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-muted-foreground mb-1">Fat</p>
                  <p className="font-medium">{recipe.nutrition.fatG ? `${recipe.nutrition.fatG}g` : "—"}</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {recipe.sourceUrl && (
        <div className="container mx-auto px-4 pt-4">
          <p className="text-xs text-muted-foreground">
            Recipe data courtesy of{" "}
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              TheMealDB
            </a>
            .
          </p>
        </div>
      )}

      {/* Related Recipes */}
      {relatedRecipes && relatedRecipes.length > 0 && (
        <div className="border-t border-border bg-card mt-12 py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold mb-8">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedRecipes.map(related => (
                <RecipeCard key={related.id} recipe={related} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
