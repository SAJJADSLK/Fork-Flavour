import { useState } from "react";
import { useSubstituteIngredient } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

interface SubstitutionHelperProps {
  recipeSlug: string;
}

export function SubstitutionHelper({ recipeSlug }: SubstitutionHelperProps) {
  const [ingredient, setIngredient] = useState("");
  const [note, setNote] = useState("");
  
  const substituteMutation = useSubstituteIngredient();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient.trim()) return;
    
    substituteMutation.mutate({
      slug: recipeSlug,
      data: {
        ingredient: ingredient.trim(),
        ...(note.trim() ? { note: note.trim() } : {})
      }
    });
  };
  
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-serif">Missing an ingredient?</CardTitle>
            <CardDescription>Ask our AI sous-chef for a recipe-aware substitution.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <label htmlFor="ingredient" className="text-sm font-medium text-foreground">
                What are you missing?
              </label>
              <Input
                id="ingredient"
                placeholder="e.g. Heavy cream"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="bg-background"
                disabled={substituteMutation.isPending}
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="note" className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Context (optional)</span>
              </label>
              <Input
                id="note"
                placeholder="e.g. I need it to be dairy-free"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background"
                disabled={substituteMutation.isPending}
              />
            </div>
            
            <div className="flex items-end pb-0.5">
              <Button 
                type="submit" 
                disabled={!ingredient.trim() || substituteMutation.isPending}
                className="w-full md:w-auto"
              >
                {substituteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking
                  </>
                ) : (
                  "Find Substitute"
                )}
              </Button>
            </div>
          </div>
        </form>

        {substituteMutation.isError && (
          <div className="mt-6 p-4 rounded-md border border-destructive/50 bg-destructive/10 text-destructive flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Failed to find a substitution</p>
              <p className="opacity-90">Please try again or rephrase your ingredient.</p>
            </div>
          </div>
        )}

        {substituteMutation.isSuccess && substituteMutation.data && (
          <div className="mt-6 p-5 rounded-md border border-primary/20 bg-background shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
            <h4 className="font-serif font-semibold text-lg text-primary mb-2">
              Instead of {substituteMutation.data.ingredient}:
            </h4>
            <p className="text-foreground leading-relaxed">
              {substituteMutation.data.suggestion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
