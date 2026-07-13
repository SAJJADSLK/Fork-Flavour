import { Router, type IRouter } from "express";
import { db, recipesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db.query.recipesTable.findMany();

  const byCategory = new Map<string, { imageUrl: string; count: number }>();
  for (const recipe of rows) {
    const existing = byCategory.get(recipe.category);
    if (existing) {
      existing.count += 1;
    } else {
      byCategory.set(recipe.category, {
        imageUrl: recipe.imageUrl,
        count: 1,
      });
    }
  }

  const categories = Array.from(byCategory.entries())
    .map(([name, { imageUrl, count }]) => ({
      name,
      imageUrl,
      recipeCount: count,
    }))
    .sort((a, b) => b.recipeCount - a.recipeCount);

  res.json(categories);
});

export default router;
