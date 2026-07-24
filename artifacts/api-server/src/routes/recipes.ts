import { Router, type IRouter } from "express";
import { eq, desc, ilike, sql } from "drizzle-orm";
import { db, recipesTable, type RecipeRow } from "@workspace/db";
import {
  ListRecipesQueryParams,
  GetRecipeParams,
  SubstituteIngredientParams,
  SubstituteIngredientBody,
  RateRecipeParams,
  RateRecipeBody,
  type ErrorResponse,
} from "@workspace/api-zod";

function errorResponse(error: string): ErrorResponse {
  return { error };
}
import { rankRecipesByIntent } from "../lib/recipeSearch";
import { suggestSubstitution } from "../lib/substitutions";

// TheMealDB sometimes stores raw instruction text in the description field,
// starting with step numbers like "1." or "1 First, ...". Detect and replace
// these with a clean generated description so recipe pages have quality content.
const STEP_PREFIX_RE = /^\s*\d+\.?\s+/;
function sanitizeDescription(raw: string | null, title: string, cuisine: string | null, category: string | null): string {
  if (!raw || STEP_PREFIX_RE.test(raw)) {
    const parts: string[] = [];
    if (cuisine && cuisine !== "Unknown") parts.push(cuisine);
    if (category) parts.push(category.toLowerCase());
    const base = parts.length ? `A classic ${parts.join(" ")} dish` : "A delicious recipe";
    return `${base} — ${title}. Follow the step-by-step instructions and ingredient list below to make this at home.`;
  }
  return raw;
}

const router: IRouter = Router();

function toSummary(recipe: RecipeRow) {
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    description: sanitizeDescription(recipe.description, recipe.title, recipe.cuisine, recipe.category),
    category: recipe.category,
    imageUrl: recipe.imageUrl,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    totalMinutes: recipe.totalMinutes,
    dietaryTags: recipe.dietaryTags,
    cookMethod: recipe.cookMethod,
    rating: recipe.rating,
    reviewCount: recipe.reviewCount,
  };
}

function toDetail(recipe: RecipeRow) {
  return {
    ...toSummary(recipe),
    cuisine: recipe.cuisine,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    nutrition: {
      calories: recipe.caloriesPerServing,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
    },
    sourceUrl: recipe.sourceUrl,
    createdAt: recipe.createdAt.toISOString(),
  };
}

// There is no real popularity signal yet (no reviews have been collected),
// so "Popular" surfaces our own kitchen-tested recipes (no sourceUrl) ahead
// of the wider imported library, rather than faking a ranking.
router.get("/recipes/popular", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const rows = await db.query.recipesTable.findMany({
    orderBy: [
      sql`${recipesTable.sourceUrl} IS NOT NULL`,
      desc(recipesTable.reviewCount),
      desc(recipesTable.rating),
      desc(recipesTable.createdAt),
    ],
    limit,
  });
  res.json(rows.map(toSummary));
});

router.get("/recipes/recent", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const rows = await db.query.recipesTable.findMany({
    orderBy: [desc(recipesTable.createdAt)],
    limit,
  });
  res.json(rows.map(toSummary));
});

router.get("/recipes", async (req, res) => {
  const params = ListRecipesQueryParams.parse(req.query);

  let rows = await db.query.recipesTable.findMany(
    params.category
      ? { where: ilike(recipesTable.category, params.category) }
      : undefined,
  );

  if (params.query && params.query.trim().length > 0) {
    rows = rankRecipesByIntent(rows, params.query);
  } else if (params.sort === "popular") {
    // Same honest fallback as /recipes/popular: kitchen-tested originals
    // first, then reviewed/rated recipes, then most recent.
    rows = [...rows].sort((a, b) => {
      const aOriginal = a.sourceUrl == null;
      const bOriginal = b.sourceUrl == null;
      if (aOriginal !== bOriginal) return aOriginal ? -1 : 1;
      return (
        b.reviewCount - a.reviewCount ||
        b.rating - a.rating ||
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    });
  } else if (params.sort === "recent") {
    rows = [...rows].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  } else {
    rows = [...rows].sort((a, b) => b.rating - a.rating);
  }

  res.json(rows.map(toSummary));
});

router.get("/recipes/:slug", async (req, res) => {
  const { slug } = GetRecipeParams.parse(req.params);
  const recipe = await db.query.recipesTable.findFirst({
    where: eq(recipesTable.slug, slug),
  });
  if (!recipe) {
    res
      .status(404)
      .json(errorResponse(`No recipe found for "${slug}"`));
    return;
  }
  res.json(toDetail(recipe));
});

router.get("/recipes/:slug/related", async (req, res) => {
  const { slug } = GetRecipeParams.parse(req.params);
  const recipe = await db.query.recipesTable.findFirst({
    where: eq(recipesTable.slug, slug),
  });
  if (!recipe) {
    res
      .status(404)
      .json(errorResponse(`No recipe found for "${slug}"`));
    return;
  }

  const sameCategory = await db.query.recipesTable.findMany({
    where: eq(recipesTable.category, recipe.category),
  });
  const related = sameCategory
    .filter((r) => r.id !== recipe.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  res.json(related.map(toSummary));
});

// Readers submit a 1-5 star rating; we fold it into a running average rather
// than requiring accounts. This is the only source of real rating/review
// data on the site (no fabricated numbers).
router.post("/recipes/:slug/rate", async (req, res) => {
  const { slug } = RateRecipeParams.parse(req.params);
  const body = RateRecipeBody.parse(req.body);

  const recipe = await db.query.recipesTable.findFirst({
    where: eq(recipesTable.slug, slug),
  });
  if (!recipe) {
    res
      .status(404)
      .json(errorResponse(`No recipe found for "${slug}"`));
    return;
  }

  const newReviewCount = recipe.reviewCount + 1;
  const newRating =
    (recipe.rating * recipe.reviewCount + body.rating) / newReviewCount;

  const [updated] = await db
    .update(recipesTable)
    .set({
      rating: Math.round(newRating * 10) / 10,
      reviewCount: newReviewCount,
    })
    .where(eq(recipesTable.slug, slug))
    .returning();

  res.json({ rating: updated.rating, reviewCount: updated.reviewCount });
});

router.post("/recipes/:slug/substitute", async (req, res) => {
  const { slug } = SubstituteIngredientParams.parse(req.params);
  const body = SubstituteIngredientBody.parse(req.body);

  const recipe = await db.query.recipesTable.findFirst({
    where: eq(recipesTable.slug, slug),
  });
  if (!recipe) {
    res
      .status(404)
      .json(errorResponse(`No recipe found for "${slug}"`));
    return;
  }

  const suggestion = suggestSubstitution(body.ingredient);
  res.json({ ingredient: body.ingredient, suggestion });
});

export default router;
