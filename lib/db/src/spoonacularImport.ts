/**
 * Spoonacular importer — pulls recipes from Spoonacular's free tier
 * (https://spoonacular.com/food-api) and loads them into the recipes table.
 *
 * Spoonacular's free plan grants 150 "points" per day. A plain search
 * request costs ~1 point regardless of how many results it returns, but
 * fetching full recipe details costs ~1 point PER recipe. So each run:
 *   1. calls /recipes/complexSearch once (cheap) to get the next page of IDs
 *   2. calls /recipes/informationBulk once for those IDs (the expensive part)
 * That keeps a 100-recipe run to roughly ~101 points, safely under the
 * 150/day cap even if something else nibbles the quota that day.
 *
 * Progress (pagination cursor) and how many points we've already spent
 * today are persisted in the `import_state` table, so this is safe to call
 * repeatedly (e.g. from a daily Vercel Cron hitting an API route) without
 * re-fetching recipes already imported or blowing the daily budget.
 *
 * Manual run: scripts/node_modules/.bin/tsx src/spoonacularImport.ts
 */
import { eq, sql } from "drizzle-orm";
import { db } from "./index.js";
import { recipesTable, type InsertRecipe } from "./schema/recipes.js";
import { importStateTable } from "./schema/importState.js";

const SOURCE = "spoonacular";
const BASE = "https://api.spoonacular.com";

// Stay comfortably under the free tier's 150 points/day cap.
const DAILY_POINT_BUDGET = 140;
const DEFAULT_BATCH_SIZE = 100;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await sleep(1000 * Math.pow(2, attempt));
      continue;
    }
    if (res.status === 402) {
      throw new SpoonacularQuotaExceededError();
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Spoonacular request failed (${res.status}): ${url} ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }
  throw new Error(`Spoonacular request failed (429 after ${retries} retries): ${url}`);
}

export class SpoonacularQuotaExceededError extends Error {
  constructor() {
    super("Spoonacular daily quota exceeded (HTTP 402).");
    this.name = "SpoonacularQuotaExceededError";
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<\/(p|li|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

const COOK_METHOD_KEYWORDS: [string, string][] = [
  ["grill", "Grilled"],
  ["roast", "Roasted"],
  ["bake", "Baked"],
  ["fry", "Fried"],
  ["saute", "Sauteed"],
  ["sauté", "Sauteed"],
  ["boil", "Boiled"],
  ["simmer", "Simmered"],
  ["steam", "Steamed"],
  ["slow cook", "Slow-Cooked"],
  ["stir-fry", "Stir-Fried"],
  ["stir fry", "Stir-Fried"],
  ["poach", "Poached"],
  ["marinate", "Marinated"],
];

function inferCookMethod(text: string): string {
  const lower = text.toLowerCase();
  for (const [needle, label] of COOK_METHOD_KEYWORDS) {
    if (lower.includes(needle)) return label;
  }
  return "Stovetop";
}

interface SpoonacularSearchResult {
  results: { id: number }[];
  totalResults: number;
}

interface SpoonacularIngredient {
  original: string;
}

interface SpoonacularStep {
  number: number;
  step: string;
  length?: { number: number; unit: string };
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  summary?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  readyInMinutes?: number;
  preparationMinutes?: number | null;
  cookingMinutes?: number | null;
  servings?: number;
  cuisines?: string[];
  dishTypes?: string[];
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: { steps: SpoonacularStep[] }[];
  instructions?: string;
}

function buildDescription(summary: string | undefined, title: string): string {
  if (summary) {
    const text = stripHtml(summary).replace(/\s+/g, " ").trim();
    const sentences = text.split(/(?<=[.!?])\s/).filter((s) => s.trim().length > 0);
    const short = sentences.slice(0, 2).join(" ").trim();
    if (short.length > 30 && short.length < 320) return short;
  }
  return `A delicious recipe for ${title}.`;
}

function buildInstructions(recipe: SpoonacularRecipe): { step: number; text: string; timerMinutes: number | null }[] {
  const analyzed = recipe.analyzedInstructions?.[0]?.steps;
  if (analyzed && analyzed.length > 0) {
    return analyzed.map((s) => ({
      step: s.number,
      text: s.step,
      timerMinutes: s.length?.number ?? null,
    }));
  }
  const raw = recipe.instructions ? stripHtml(recipe.instructions) : "";
  const parts = raw.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const finalParts = parts.length > 0 ? parts : [`See the full recipe at the source link for instructions.`];
  return finalParts.map((text, i) => ({ step: i + 1, text, timerMinutes: null }));
}

function buildDietaryTags(recipe: SpoonacularRecipe): string[] {
  const tags: string[] = [];
  if (recipe.vegan) tags.push("Vegan");
  if (recipe.vegetarian) tags.push("Vegetarian");
  if (recipe.glutenFree) tags.push("Gluten-Free");
  if (recipe.dairyFree) tags.push("Dairy-Free");
  return tags;
}

function toInsertRecipe(recipe: SpoonacularRecipe, usedSlugs: Set<string>): InsertRecipe | null {
  const ingredients = (recipe.extendedIngredients ?? []).map((i) => ({
    item: i.original,
    note: null,
  }));
  if (ingredients.length === 0) return null;

  let slug = `${slugify(recipe.title)}-${recipe.id}`;
  if (usedSlugs.has(slug)) slug = `${slug}-dup`;
  usedSlugs.add(slug);

  const instructions = buildInstructions(recipe);
  const instructionText = instructions.map((s) => s.text).join(" ");
  const cookMethod = inferCookMethod(`${instructionText} ${recipe.title}`);
  const cuisine = recipe.cuisines?.[0] || "International";
  const category = recipe.dishTypes?.[0] || "Uncategorized";

  return {
    slug,
    title: recipe.title,
    description: buildDescription(recipe.summary, recipe.title),
    category,
    cuisine,
    imageUrl: recipe.image || "",
    prepMinutes: recipe.preparationMinutes ?? null,
    cookMinutes: recipe.cookingMinutes ?? null,
    totalMinutes: recipe.readyInMinutes ?? null,
    servings: recipe.servings ?? null,
    sourceUrl: recipe.sourceUrl || recipe.spoonacularSourceUrl || `https://spoonacular.com/recipes/${slugify(recipe.title)}-${recipe.id}`,
    dietaryTags: buildDietaryTags(recipe),
    cookMethod,
    rating: 0,
    reviewCount: 0,
    ingredients,
    instructions,
    caloriesPerServing: null,
    proteinG: null,
    carbsG: null,
    fatG: null,
  };
}

async function getOrInitState() {
  const existing = await db.query.importStateTable.findFirst({
    where: eq(importStateTable.source, SOURCE),
  });
  if (existing) return existing;
  const [created] = await db
    .insert(importStateTable)
    .values({ source: SOURCE, cursor: 0, pointsUsedToday: 0, lastRunDate: todayUTC(), totalImported: 0 })
    .returning();
  return created;
}

export interface SpoonacularImportResult {
  inserted: number;
  skipped: number;
  pointsUsed: number;
  cursorBefore: number;
  cursorAfter: number;
  reachedEndOfCatalog: boolean;
  quotaExceeded: boolean;
  message: string;
}

/**
 * Runs one import batch. Safe to call once/day (e.g. from a cron-triggered
 * API route) or multiple times a day — it tracks points spent "today" (UTC)
 * in the DB and will refuse to spend past DAILY_POINT_BUDGET regardless of
 * how many times it's invoked.
 */
export async function runSpoonacularImport(opts: {
  apiKey: string;
  batchSize?: number;
}): Promise<SpoonacularImportResult> {
  const batchSize = Math.min(opts.batchSize ?? DEFAULT_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  const state = await getOrInitState();
  const today = todayUTC();
  const pointsUsedToday = state.lastRunDate === today ? state.pointsUsedToday : 0;
  const remainingBudget = DAILY_POINT_BUDGET - pointsUsedToday;

  if (remainingBudget <= 1) {
    return {
      inserted: 0,
      skipped: 0,
      pointsUsed: 0,
      cursorBefore: state.cursor,
      cursorAfter: state.cursor,
      reachedEndOfCatalog: false,
      quotaExceeded: true,
      message: `Daily budget already used (${pointsUsedToday}/${DAILY_POINT_BUDGET} points). Try again after 00:00 UTC.`,
    };
  }

  // 1 point for the search call, ~1 point per recipe fetched in bulk.
  const affordableCount = Math.max(0, Math.min(batchSize, remainingBudget - 1));
  if (affordableCount === 0) {
    return {
      inserted: 0,
      skipped: 0,
      pointsUsed: 0,
      cursorBefore: state.cursor,
      cursorAfter: state.cursor,
      reachedEndOfCatalog: false,
      quotaExceeded: true,
      message: `Not enough remaining budget today (${remainingBudget} points left).`,
    };
  }

  let pointsUsed = 0;
  let inserted = 0;
  let skipped = 0;
  let reachedEndOfCatalog = false;

  try {
    const searchUrl =
      `${BASE}/recipes/complexSearch?number=${affordableCount}&offset=${state.cursor}` +
      `&sort=id&sortDirection=asc&addRecipeInformation=false&apiKey=${opts.apiKey}`;
    const search = await fetchJson<SpoonacularSearchResult>(searchUrl);
    pointsUsed += 1;

    const ids = search.results.map((r) => r.id);
    if (ids.length === 0) {
      reachedEndOfCatalog = state.cursor > 0;
      return {
        inserted: 0,
        skipped: 0,
        pointsUsed,
        cursorBefore: state.cursor,
        cursorAfter: state.cursor,
        reachedEndOfCatalog,
        quotaExceeded: false,
        message: reachedEndOfCatalog
          ? "Reached the end of Spoonacular's catalog for this query; cursor left in place."
          : "No results returned from Spoonacular.",
      };
    }

    const bulkUrl = `${BASE}/recipes/informationBulk?ids=${ids.join(",")}&includeNutrition=false&apiKey=${opts.apiKey}`;
    const recipes = await fetchJson<SpoonacularRecipe[]>(bulkUrl);
    pointsUsed += ids.length;

    const usedSlugs = new Set<string>();
    for (const recipe of recipes) {
      const row = toInsertRecipe(recipe, usedSlugs);
      if (!row) {
        skipped++;
        continue;
      }
      const result = await db
        .insert(recipesTable)
        .values(row)
        .onConflictDoNothing({ target: recipesTable.slug })
        .returning({ id: recipesTable.id });
      if (result.length > 0) inserted++;
      else skipped++;
    }

    const newCursor = state.cursor + ids.length;
    const newPointsUsedToday = (state.lastRunDate === today ? state.pointsUsedToday : 0) + pointsUsed;

    await db
      .insert(importStateTable)
      .values({
        source: SOURCE,
        cursor: newCursor,
        pointsUsedToday: newPointsUsedToday,
        lastRunDate: today,
        totalImported: state.totalImported + inserted,
      })
      .onConflictDoUpdate({
        target: importStateTable.source,
        set: {
          cursor: newCursor,
          pointsUsedToday: newPointsUsedToday,
          lastRunDate: today,
          totalImported: sql`${importStateTable.totalImported} + ${inserted}`,
          updatedAt: sql`now()`,
        },
      });

    return {
      inserted,
      skipped,
      pointsUsed,
      cursorBefore: state.cursor,
      cursorAfter: newCursor,
      reachedEndOfCatalog: ids.length < affordableCount,
      quotaExceeded: false,
      message: `Imported ${inserted} recipes (${skipped} skipped/duplicate), using ${pointsUsed} Spoonacular points.`,
    };
  } catch (err) {
    if (err instanceof SpoonacularQuotaExceededError) {
      // Record whatever points we'd already spent this call before hitting 402.
      const newPointsUsedToday = (state.lastRunDate === today ? state.pointsUsedToday : 0) + pointsUsed;
      await db
        .insert(importStateTable)
        .values({ source: SOURCE, cursor: state.cursor, pointsUsedToday: newPointsUsedToday, lastRunDate: today, totalImported: state.totalImported })
        .onConflictDoUpdate({
          target: importStateTable.source,
          set: { pointsUsedToday: newPointsUsedToday, lastRunDate: today, updatedAt: sql`now()` },
        });
      return {
        inserted,
        skipped,
        pointsUsed,
        cursorBefore: state.cursor,
        cursorAfter: state.cursor,
        reachedEndOfCatalog: false,
        quotaExceeded: true,
        message: "Spoonacular returned 402 — daily quota exceeded on their end.",
      };
    }
    throw err;
  }
}

// Allow running standalone: scripts/node_modules/.bin/tsx src/spoonacularImport.ts
const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    console.error("SPOONACULAR_API_KEY must be set.");
    process.exit(1);
  }
  runSpoonacularImport({ apiKey })
    .then((result) => {
      console.log(result.message);
      console.log(result);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
