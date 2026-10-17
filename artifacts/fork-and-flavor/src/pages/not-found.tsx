import { Link } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  useDocumentMeta({
    title: "Page Not Found | Fork & Flavor",
    description: "The recipe or page you are looking for cannot be found.",
    canonicalPath: "/404",
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-bold">404 Error</p>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
          Recipe Not Found
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          The dish or culinary article you are searching for might have moved, been renamed, or is temporarily unavailable in our kitchen.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="font-medium">
            <Link href="/recipes">
              <ArrowLeft className="w-4 h-4 mr-2" /> Explore Recipes
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
