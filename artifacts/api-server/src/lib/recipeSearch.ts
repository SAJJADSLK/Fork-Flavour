import type { RecipeRow } from "@workspace/db";

const DIETARY_KEYWORDS: Record<string, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten free": "Gluten-Free",
  "gluten-free": "Gluten-Free",
  "high protein": "High-Protein",
  "high-protein": "High-Protein",
};

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "with",
  "for",
  "of",
  "in",
  "on",
  "i",
  "have",
  "some",
  "make",
  "something",
  "want",
  "need",
  "recipe",
  "dish",
  "minute",
  "minutes",
  "min",
  "mins",
]);

export interface ParsedIntent {
  maxTotalMinutes: number | null;
  dietaryTags: string[];
  keywords: string[];
}

/**
 * Rule-based "search with intent" parser. Extracts a time budget, dietary
 * constraints, and remaining keyword tokens (ingredients/mood/etc.) from a
 * free-text query like "chicken thighs and 20 minutes".
 */
export function parseSearchIntent(query: string): ParsedIntent {
  const lower = query.toLowerCase();

  let maxTotalMinutes: number | null = null;
  const timeMatch = lower.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/);
  if (timeMatch) {
    const value = parseInt(timeMatch[1], 10);
    maxTotalMinutes = /hour|hr/.test(timeMatch[2]) ? value * 60 : value;
  }

  const dietaryTags: string[] = [];
  for (const [needle, tag] of Object.entries(DIETARY_KEYWORDS)) {
    if (lower.includes(needle) && !dietaryTags.includes(tag)) {
      dietaryTags.push(tag);
    }
  }

  const keywords = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .filter((word) => !/^\d+$/.test(word));

  return { maxTotalMinutes, dietaryTags, keywords };
}

function scoreRecipe(recipe: RecipeRow, intent: ParsedIntent): number {
  let score = 0;

  if (intent.maxTotalMinutes !== null && recipe.totalMinutes !== null) {
    if (recipe.totalMinutes <= intent.maxTotalMinutes) {
      score += 3;
    } else {
      score -= 2;
    }
  }

  for (const tag of intent.dietaryTags) {
    if (recipe.dietaryTags.includes(tag)) {
      score += 3;
    } else {
      score -= 3;
    }
  }

  const haystack =
    `${recipe.title} ${recipe.description} ${recipe.category} ${recipe.cuisine} ${recipe.cookMethod} ${recipe.dietaryTags.join(" ")}`.toLowerCase();

  for (const keyword of intent.keywords) {
    if (haystack.includes(keyword)) {
      score += 2;
    }
  }

  // Small tie-breaking nudge toward well-reviewed recipes.
  score += recipe.rating / 10;

  return score;
}

/** Ranks recipes by relevance to a natural-language query. */
export function rankRecipesByIntent(
  recipes: RecipeRow[],
  query: string,
): RecipeRow[] {
  const intent = parseSearchIntent(query);
  return [...recipes]
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe, intent) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ recipe }) => recipe);
}
