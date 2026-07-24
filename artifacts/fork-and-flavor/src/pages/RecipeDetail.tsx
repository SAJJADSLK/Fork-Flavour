import { useRoute } from "wouter";
import { useGetRecipe, useGetRelatedRecipes } from "@workspace/api-client-react";
import { SubstitutionHelper } from "@/components/SubstitutionHelper";
import { RecipeCard } from "@/components/RecipeCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Flame, ChefHat, Star, ArrowLeft, Lightbulb, Archive, HelpCircle, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useJsonLd } from "@/hooks/useJsonLd";
import { RecipeRating } from "@/components/RecipeRating";
import type { Recipe } from "@workspace/api-client-react";

// ── SEO helpers ────────────────────────────────────────────────────────────

function buildMetaDescription(recipe: Recipe): string {
  const time = recipe.totalMinutes ? ` in ${recipe.totalMinutes} minutes` : "";
  const serves = recipe.servings ? `, serves ${recipe.servings}` : "";
  const tags = recipe.dietaryTags.length ? ` (${recipe.dietaryTags.slice(0, 2).join(", ")})` : "";
  return `Learn how to make ${recipe.title}${time}${serves}${tags}. Step-by-step instructions, ingredient list, nutrition info and tips for the perfect ${recipe.cuisine ?? recipe.category} dish.`;
}

// ── Tips generator ─────────────────────────────────────────────────────────

const METHOD_TIPS: Record<string, string> = {
  roasted: "Preheat your oven fully before the dish goes in — an under-heated oven is the most common reason for uneven cooking.",
  stovetop: "Mise en place matters most on the stovetop. Have every ingredient prepped and within reach before the pan heats up.",
  baked: "Use the middle rack for the most even heat distribution unless the recipe specifies otherwise.",
  fried: "Dry your ingredients well before frying — surface moisture causes dangerous oil splatter and steams instead of crisps.",
  grilled: "Let the grill reach full temperature and oil the grates just before adding food to prevent sticking.",
  slow_cooked: "Resist lifting the lid during cooking — each peek adds 20-30 minutes to the cook time.",
  steamed: "Keep the water at a vigorous simmer, not a rolling boil, for gentler, more controlled steaming.",
};

const DIET_TIPS: Record<string, string> = {
  "Gluten-Free": "Double-check every packaged ingredient for hidden gluten — soy sauce, stock cubes, and spice blends are common culprits.",
  "Vegetarian": "Taste and adjust seasoning at the end; plant-based dishes often need a touch more salt or acid to balance.",
  "Vegan": "A squeeze of lemon juice or a dash of balsamic at the end can replace the depth that dairy or meat usually provides.",
  "Dairy-Free": "Canned full-fat coconut milk is an excellent 1-for-1 substitute for heavy cream in most sauces.",
  "High-Protein": "Let proteins rest after cooking — this keeps them juicy and improves texture significantly.",
  "Low-Calorie": "Bulk out the dish with extra vegetables to increase satiety without adding many calories.",
};

function generateTips(recipe: Recipe): string[] {
  const tips: string[] = [];
  const method = recipe.cookMethod?.toLowerCase().replace(/\s+/g, "_");
  if (method && METHOD_TIPS[method]) tips.push(METHOD_TIPS[method]);
  for (const tag of recipe.dietaryTags) {
    if (DIET_TIPS[tag]) { tips.push(DIET_TIPS[tag]); break; }
  }
  // Prep tip
  if ((recipe.prepMinutes ?? 0) >= 20) {
    tips.push("You can do all the prep work up to 24 hours ahead and keep it refrigerated — this makes day-of cooking much faster.");
  }
  // Serving tip
  if ((recipe.servings ?? 1) >= 6) {
    tips.push("This recipe scales well for meal prep — leftovers reheat beautifully and flavours often deepen overnight.");
  }
  if (tips.length < 2) {
    tips.push("Taste as you go and adjust seasoning in small increments — it's easier to add than to correct over-seasoning.");
  }
  return tips.slice(0, 3);
}

// ── Storage generator ──────────────────────────────────────────────────────

function generateStorage(recipe: Recipe): { fridge: string; freeze: string; reheat: string } {
  const method = recipe.cookMethod?.toLowerCase() ?? "";
  const isFried = method.includes("fry") || method.includes("fried");
  const isBaked = method.includes("bak");

  const fridge = `Store in an airtight container for up to ${isFried ? "2" : "4"} days.`;
  const freeze = isFried
    ? "Not ideal for freezing — the texture suffers. Best enjoyed fresh."
    : `Freeze in a sealed container for up to 3 months. Thaw overnight in the refrigerator before reheating.`;
  const reheat = isBaked
    ? "Reheat in a 325 °F oven covered with foil until warmed through. Avoid the microwave to preserve texture."
    : "Reheat gently on the stovetop over medium-low heat, adding a splash of water or stock to loosen. A microwave works for quick reheats — cover loosely and heat in 60-second intervals.";

  return { fridge, freeze, reheat };
}

// ── FAQ generator ─────────────────────────────────────────────────────────

interface FAQItem { q: string; a: string }

function generateFAQ(recipe: Recipe): FAQItem[] {
  const faq: FAQItem[] = [];

  if (recipe.totalMinutes) {
    faq.push({
      q: `How long does it take to make ${recipe.title}?`,
      a: `The total time is ${recipe.totalMinutes} minutes${recipe.prepMinutes ? ` (${recipe.prepMinutes} min prep` : ""}${recipe.cookMinutes ? `, ${recipe.cookMinutes} min cook` : ""}${recipe.prepMinutes ? ")" : ""}.`,
    });
  }

  if (recipe.servings) {
    faq.push({
      q: `How many people does this recipe serve?`,
      a: `This recipe makes ${recipe.servings} servings. Scale the ingredient quantities up or down proportionally for a different yield.`,
    });
  }

  if (recipe.dietaryTags.length > 0) {
    faq.push({
      q: `Is ${recipe.title} ${recipe.dietaryTags[0].toLowerCase()}?`,
      a: `Yes — this recipe is labeled ${recipe.dietaryTags.join(", ")}. Always verify that your specific ingredient brands meet any dietary requirements.`,
    });
  } else {
    faq.push({
      q: `Can this recipe be made vegetarian?`,
      a: `It depends on the ingredients. Review the full ingredient list and substitute any meat or animal products with plant-based alternatives as needed.`,
    });
  }

  faq.push({
    q: `Can I make ${recipe.title} ahead of time?`,
    a: `Yes. The dish can be prepared in advance and stored in the refrigerator for up to ${recipe.cookMethod?.toLowerCase().includes("fry") ? "2" : "3"} days. Reheat gently before serving for the best results.`,
  });

  return faq;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function RecipeDetail() {
  const [, params] = useRoute("/recipe/:slug");
  const slug = params?.slug ?? "";

  const { data: recipe, isLoading, isError } = useGetRecipe(slug);
  const { data: relatedRecipes } = useGetRelatedRecipes(slug);

  const metaDescription = recipe ? buildMetaDescription(recipe) : undefined;

  useDocumentMeta({
    title: recipe ? `${recipe.title} Recipe — How to Make It | Fork & Flavor` : "Recipe | Fork & Flavor",
    description: metaDescription,
    canonicalPath: `/recipe/${slug}`,
    ogImage: recipe?.imageUrl ?? undefined,
  });

  // Recipe structured data
  useJsonLd(
    recipe
      ? {
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: recipe.title,
          description: metaDescription,
          image: recipe.imageUrl ? [recipe.imageUrl] : undefined,
          recipeCategory: recipe.category,
          recipeCuisine: recipe.cuisine,
          recipeYield: recipe.servings != null ? `${recipe.servings} servings` : undefined,
          prepTime: recipe.prepMinutes != null ? `PT${recipe.prepMinutes}M` : undefined,
          cookTime: recipe.cookMinutes != null ? `PT${recipe.cookMinutes}M` : undefined,
          totalTime: recipe.totalMinutes != null ? `PT${recipe.totalMinutes}M` : undefined,
          keywords: [recipe.cuisine, recipe.category, recipe.cookMethod, ...recipe.dietaryTags].filter(Boolean).join(", "),
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
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,
          author: {
            "@type": "Organization",
            name: "Fork & Flavor",
            url: window.location.origin,
          },
          publisher: {
            "@type": "Organization",
            name: "Fork & Flavor",
            url: window.location.origin,
          },
        }
      : null,
  );

  // Breadcrumb structured data
  useJsonLd(
    recipe
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: window.location.origin },
            { "@type": "ListItem", position: 2, name: "Recipes", item: `${window.location.origin}/recipes` },
            { "@type": "ListItem", position: 3, name: recipe.title, item: `${window.location.origin}/recipe/${slug}` },
          ],
        }
      : null,
  );

  // FAQ structured data
  const faqItems = recipe ? generateFAQ(recipe) : [];
  useJsonLd(
    faqItems.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }
      : null,
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
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

  const tips = generateTips(recipe);
  const storage = generateStorage(recipe);

  return (
    <div className="min-h-screen bg-background pb-20">

      {/* ── Breadcrumb nav ─────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{recipe.title}</span>
        </div>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border pt-10 pb-16">
        <div className="container mx-auto px-4">
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
              {recipe.cuisine && (
                <div className="flex items-center gap-2" title="Cuisine">
                  <ChefHat className="w-5 h-5 text-foreground" />
                  <span>{recipe.cuisine}</span>
                </div>
              )}
              {recipe.cookMethod && (
                <div className="flex items-center gap-2" title="Cooking Method">
                  <Flame className="w-5 h-5 text-foreground" />
                  <span className="capitalize">{recipe.cookMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          {/* Main column */}
          <div className="space-y-12 min-w-0">

            {/* Hero image */}
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted border border-border shadow-sm">
              <img
                src={recipe.imageUrl}
                alt={`${recipe.title} — finished dish`}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>

            {/* Instructions */}
            <section aria-labelledby="instructions-heading">
              <h2 id="instructions-heading" className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">
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
            </section>

            {/* Tips & Notes */}
            {tips.length > 0 && (
              <section aria-labelledby="tips-heading" className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <h2 id="tips-heading" className="font-serif text-xl font-bold mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Tips & Notes
                </h2>
                <ul className="space-y-3">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Storage & Reheating */}
            <section aria-labelledby="storage-heading" className="bg-card border border-border rounded-xl p-6">
              <h2 id="storage-heading" className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                <Archive className="w-5 h-5 text-primary" />
                Storage & Reheating
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-foreground mb-0.5">Refrigerator</dt>
                  <dd className="text-muted-foreground leading-relaxed">{storage.fridge}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="font-semibold text-foreground mb-0.5">Freezer</dt>
                  <dd className="text-muted-foreground leading-relaxed">{storage.freeze}</dd>
                </div>
                <Separator />
                <div>
                  <dt className="font-semibold text-foreground mb-0.5">Reheating</dt>
                  <dd className="text-muted-foreground leading-relaxed">{storage.reheat}</dd>
                </div>
              </dl>
            </section>

            {/* FAQ */}
            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqItems.map(({ q, a }, i) => (
                  <details key={i} className="group bg-card border border-border rounded-xl">
                    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-sm select-none hover:text-primary transition-colors">
                      {q}
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform text-lg leading-none shrink-0">⌄</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
                  </details>
                ))}
              </div>
            </section>

            {/* Source attribution */}
            {recipe.sourceUrl && (
              <p className="text-xs text-muted-foreground">
                Recipe data courtesy of{" "}
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  TheMealDB
                </a>.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-24">

            {/* Quick Stats */}
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

            {/* Ingredients */}
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
                        <span className="text-muted-foreground text-sm block mt-0.5">{ingredient.note}</span>
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
              <p className="text-xs text-muted-foreground mt-3">Estimates only. Actual values vary by ingredient brand and portion size.</p>
            </div>

          </aside>
        </div>
      </div>

      {/* Related Recipes + bottom ad */}
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
