import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NaturalLanguageSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/recipes?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
        <Search className="h-5 w-5" />
      </div>
      <Input
        type="search"
        placeholder='Try "chicken thighs and 20 minutes" or "creamy vegetarian pasta"...'
        className="w-full h-14 pl-12 pr-24 rounded-full text-base bg-background/95 backdrop-blur shadow-sm border-border hover:border-primary/50 focus-visible:ring-primary focus-visible:border-primary transition-all font-sans"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="absolute inset-y-1.5 right-1.5">
        <Button 
          type="submit" 
          size="sm" 
          className="h-full rounded-full px-6 font-semibold tracking-wide"
          disabled={!query.trim()}
        >
          Find
        </Button>
      </div>
    </form>
  );
}
