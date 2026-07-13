import { useListPopularRecipes, useListRecentRecipes, useListCategories } from "@workspace/api-client-react";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { NaturalLanguageSearch } from "@/components/NaturalLanguageSearch";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { data: popularRecipes, isLoading: isLoadingPopular } = useListPopularRecipes({ limit: 4 });
  const { data: recentRecipes, isLoading: isLoadingRecent } = useListRecentRecipes({ limit: 4 });
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero.jpg" 
            alt="Professional kitchen counter" 
            className="w-full h-full object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/10" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center mt-20">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 backdrop-blur-sm">The Intelligent Kitchen</Badge>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-foreground">
            Structured data.<br/>Not life stories.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-sans">
            Tested recipes designed for home cooks who cook. Precise timing, accurate nutrition, and substitutions that make sense.
          </p>
          
          <NaturalLanguageSearch />
        </div>
      </section>

      {/* Categories Browser */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))
            ) : (
              categories?.map((category) => (
                <Link key={category.name} href={`/recipes?category=${encodeURIComponent(category.name)}`}>
                  <div className="group relative h-32 rounded-lg overflow-hidden cursor-pointer">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                      <span className="font-serif font-semibold text-lg">{category.name}</span>
                      <span className="text-xs text-white/80 mt-1">{category.recipeCount} recipes</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Popular Recipes */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">Popular Right Now</h2>
              <p className="text-muted-foreground">The most cooked and highest rated recipes this week.</p>
            </div>
            <Link href="/recipes?sort=popular" className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4">
              View all popular <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingPopular ? (
              Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            ) : (
              popularRecipes?.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Philosophy Banner */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl font-bold mb-6">Our Philosophy</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We believe a recipe is a piece of software for your kitchen. It should be tested, documented, and structured. When you're standing in your kitchen at 11pm on a Tuesday, you need instructions, not inspiration.
          </p>
          <Link href="/about" className="inline-flex items-center justify-center h-10 px-8 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            Read the Manifesto
          </Link>
        </div>
      </section>

      {/* Recent Recipes */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">Latest additions</h2>
              <p className="text-muted-foreground">Fresh from our test kitchen to yours.</p>
            </div>
            <Link href="/recipes?sort=recent" className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4">
              View all new recipes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingRecent ? (
              Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />)
            ) : (
              recentRecipes?.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Ensure Badge is imported in the file that needs it
import { Badge } from "@/components/ui/badge";