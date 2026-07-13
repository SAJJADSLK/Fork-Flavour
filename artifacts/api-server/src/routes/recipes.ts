import { Router, type IRouter } from "express";
import { eq, desc, ilike } from "drizzle-orm";
import { db, recipesTable, type RecipeRow } from "@workspace/db";
import {
  ListRecipesQueryParams,
  GetRecipeParams,
  SubstituteIngredientParams,
  SubstituteIngredientBody,
  type ErrorResponse,
} from "@workspace/api-zod";

function errorResponse(error: string): ErrorResponse {
  return { error };
}
import { rankRecipesByIntent } from "../lib/recipeSearch";
import { suggestSubstitution } from "../lib/substitutions";

const router: IRouter = Router();

function toSummary(recipe: RecipeRow) {
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
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

router.get("/recipes/popular", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const rows = await db.query.recipesTable.findMany({
    orderBy: [desc(recipesTable.reviewCount), desc(recipesTable.rating)],
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
    rows = [...rows].sort(
      (a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating,
    );
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
