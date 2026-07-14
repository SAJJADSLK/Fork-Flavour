import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function About() {
  useDocumentMeta({
    title: "Our Philosophy | Fork & Flavor",
    description: "Why Fork & Flavor exists: structured, tested recipe data over life stories.",
    canonicalPath: "/about",
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/about.jpg" 
            alt="Precise vegetable cutting" 
            className="w-full h-full object-cover object-center opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center mt-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.1] mb-6">
            The Intelligent Kitchen
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl -mt-10 relative z-20">
        <div className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-sm text-lg text-muted-foreground leading-relaxed space-y-8 font-sans">
          
          <p className="text-xl md:text-2xl text-foreground font-serif leading-snug">
            We built Fork & Flavor because we were tired of scrolling past 2,000 words about someone's trip to Tuscany just to find out how long to roast a chicken.
          </p>

          <p>
            Cooking at home shouldn't require parsing a memoir. A recipe is a piece of software for your kitchen. It should be structured, reliable, and easy to execute when you're standing at the counter with messy hands at 11pm on a Tuesday.
          </p>

          <div className="space-y-6 my-12 py-10 border-y border-border">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-8">Our Manifesto</h2>
            
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-xl mb-2 font-serif">Structure over prose.</h3>
                <p>We present data clearly. Ingredients, steps, timing, and nutrition. No fluff, no filler, just the information you need to cook.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-xl mb-2 font-serif">Real recipes, never generated.</h3>
                <p>Our founding recipes are tested in our own kitchen. We've also built a much larger library sourced from TheMealDB's public database, credited on every page it appears — never invented, never AI-written. We use AI only to help you search ("chicken thighs and 20 minutes") and suggest substitutions, never to write a recipe.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-xl mb-2 font-serif">Context-aware substitution.</h3>
                <p>Missing an ingredient? Our AI sous-chef understands the context of the recipe and gives you a substitution that actually works for the dish you're making, not just a generic equivalent.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground text-xl mb-2 font-serif">Less, but better.</h3>
                <p>We don't need to have a million recipes. We just need to have the ones that work.</p>
              </div>
            </div>
          </div>

          <p>
            Welcome to a better way to cook. No noise, just flavor.
          </p>

          <div className="pt-8">
            <Link href="/recipes" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Start Cooking <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
