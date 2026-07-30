import { useListRecipes, useListCategories } from "@workspace/api-client-react";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { NaturalLanguageSearch } from "@/components/NaturalLanguageSearch";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { AdUnit } from "@/components/AdUnit";

export default function Recipes() {
  const [location, setLocation] = useLocation();
  
  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const q = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sort = (searchParams.get("sort") as "popular" | "recent") || "recent";

  // Data fetching
  const { data: recipes, isLoading } = useListRecipes({ 
    query: q, 
    category: categoryFilter,
    sort 
  });
  
  const { data: categories } = useListCategories();

  useDocumentMeta({
    title: categoryFilter
      ? `${categoryFilter} Recipes | Fork & Flavor`
      : "Browse Recipes | Fork & Flavor",
    description: categoryFilter
      ? `Browse ${categoryFilter.toLowerCase()} recipes with clear ingredients, timing, and instructions.`
      : "Browse hundreds of recipes with clear ingredients, timing, and instructions — no life stories, just recipes that work.",
    canonicalPath: "/recipes",
  });

  // Handlers
  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(window.location.search);
    if (cat === categoryFilter) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setLocation(`${location}?${params.toString()}`);
  };

  const handleSortChange = (newSort: "popular" | "recent") => {
    const params = new URLSearchParams(window.location.search);
    params.set("sort", newSort);
    setLocation(`${location}?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    setLocation(`${location}?${params.toString()}`);
  };

  // Derive counts and unique dietary tags from current results
  const uniqueTags = useMemo(() => {
    if (!recipes) return [];
    const tags = new Set<string>();
    recipes.forEach(r => r.dietaryTags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [recipes]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header & Search */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold mb-8 text-center">Browse Recipes</h1>
          <div className="max-w-3xl mx-auto">
            <NaturalLanguageSearch />
            {q && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Showing results for:</span>
                <Badge variant="secondary" className="flex items-center gap-1 pl-3 pr-2 py-1">
                  "{q}"
                  <button onClick={clearSearch} className="rounded-full hover:bg-muted p-0.5" aria-label="Clear search">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <div className="flex items-center gap-2 font-serif font-semibold text-lg mb-4">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h2>Sort By</h2>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant={sort === "recent" ? "default" : "ghost"} 
                  className="justify-start font-medium"
                  onClick={() => handleSortChange("recent")}
                >
                  Most Recent
                </Button>
                <Button 
                  variant={sort === "popular" ? "default" : "ghost"} 
                  className="justify-start font-medium"
                  onClick={() => handleSortChange("popular")}
                >
                  Most Popular
                </Button>
              </div>
            </div>

            <div>
              <h2 className="font-serif font-semibold text-lg mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => (
                  <Badge
                    key={cat.name}
                    variant={categoryFilter === cat.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    {cat.name} ({cat.recipeCount})
                  </Badge>
                ))}
              </div>
            </div>

            {uniqueTags.length > 0 && (
              <div>
                <h2 className="font-serif font-semibold text-lg mb-4">Dietary</h2>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground font-medium">
                {isLoading ? "Loading recipes..." : `${recipes?.length || 0} recipes found`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
              </div>
            ) : recipes?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <p className="text-lg text-muted-foreground font-serif">No recipes found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocation("/recipes")}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recipes?.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
            {recipes && recipes.length > 0 && (
              <AdUnit slot="2222222222" className="min-h-[90px] mt-10" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
