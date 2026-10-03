import { useListPopularRecipes, useListRecentRecipes, useListCategories } from "@workspace/api-client-react";
import { RecipeCard, RecipeCardSkeleton } from "@/components/RecipeCard";
import { NaturalLanguageSearch } from "@/components/NaturalLanguageSearch";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const Reveal = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const Heading = ({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href: string; cta: string }) => (
  <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-serif text-4xl md:text-5xl">{title}</h2>
    </div>
    <Link href={href} className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-bronze hover:opacity-60 transition-opacity">
      {cta} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

export default function Home() {
  const { data: popular, isLoading: lp } = useListPopularRecipes({ limit: 4 });
  const { data: recent, isLoading: lr } = useListRecentRecipes({ limit: 4 });
  const { data: categories } = useListCategories();

  useDocumentMeta({
    title: "Fork & Flavor — Recipes, Precisely Written",
    description: "A curated recipe library with clear timing, honest ingredients, and substitutions that make sense.",
    canonicalPath: "/",
  });

  const feature = popular?.[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden bg-secondary text-white">
          <img src="/assets/hero.jpg" alt="A chef's board with fresh herbs and tomatoes" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
          <div className="relative z-10 container mx-auto px-6 text-center">
            <p className="mb-6 text-[11px] uppercase tracking-[0.4em] text-primary">The Recipe Library</p>
            <h1 className="mx-auto max-w-4xl font-serif text-6xl font-normal leading-[1.02] md:text-8xl">
              Recipes, <span className="italic">precisely</span> written.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg font-light text-white/80">
              Clear timing, honest ingredients, and substitutions that make sense.
            </p>
            <div className="mt-12"><NaturalLanguageSearch /></div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border py-10">
          <div className="container mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 px-6">
            {categories?.map((c) => (
              <Link key={c.name} href={`/recipes?category=${encodeURIComponent(c.name)}`} className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-bronze">
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section className="py-28">
          <div className="container mx-auto px-6">
            <Reveal><Heading eyebrow="Featured" title="From the collection" href="/recipes?sort=popular" cta="View all" /></Reveal>
            {feature && (
              <Reveal>
                <Link href={`/recipe/${feature.slug}`} className="group mb-20 grid items-center gap-10 md:grid-cols-[1.3fr_1fr] md:gap-20">
                  <div className="aspect-[5/4] overflow-hidden bg-muted">
                    <img src={feature.imageUrl} alt={feature.title} className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" />
                  </div>
                  <div>
                    <p className="eyebrow mb-4">{feature.category}</p>
                    <h3 className="font-serif text-4xl leading-tight md:text-6xl">{feature.title}</h3>
                    <div className="gold-divider mt-8 max-w-xs pt-4 text-muted-foreground tracking-[0.2em]">
                      {feature.totalMinutes != null ? `${feature.totalMinutes} min` : "Read the recipe"}
                    </div>
                  </div>
                </Link>
              </Reveal>
            )}
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {lp ? Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />) : popular?.slice(1, 4).map((r) => <Reveal key={r.id}><RecipeCard recipe={r} /></Reveal>)}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="bg-secondary py-32 text-secondary-foreground">
          <Reveal>
            <div className="container mx-auto max-w-3xl px-6 text-center">
              <p className="mb-6 text-[11px] uppercase tracking-[0.4em] text-primary">The Maison</p>
              <p className="font-serif text-3xl italic leading-snug md:text-5xl">
                A good recipe is exact, calm, and easy to follow when your hands are full.
              </p>
              <Link href="/about" className="mt-12 inline-block border-b border-primary pb-1 text-[11px] uppercase tracking-[0.28em] transition-opacity hover:opacity-60">
                Our philosophy
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Latest */}
        <section className="py-28">
          <div className="container mx-auto px-6">
            <Reveal><Heading eyebrow="New" title="Latest additions" href="/recipes?sort=recent" cta="View all" /></Reveal>
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
              {lr ? Array.from({ length: 4 }).map((_, i) => <RecipeCardSkeleton key={i} />) : recent?.map((r) => <Reveal key={r.id}><RecipeCard recipe={r} /></Reveal>)}
            </div>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
