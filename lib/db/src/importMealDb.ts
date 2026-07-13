/**
 * One-off importer: pulls recipes from TheMealDB (https://www.themealdb.com),
 * a free public recipe API (no API key required; "1" is TheMealDB's published
 * test key for the free tier), and loads them into the recipes table.
 *
 * Run with: scripts/node_modules/.bin/tsx src/importMealDb.ts
 */
import { db } from "./index";
import { recipesTable, type InsertRecipe } from "./schema/recipes";

const BASE = "https://www.themealdb.com/api/json/v1/1";

interface MealDbCategory {
  strCategory: string;
}
interface MealDbListItem {
  idMeal: string;
}
interface MealDbFull {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  [key: string]: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, retries = 5): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      const backoff = 1000 * Math.pow(2, attempt);
      await sleep(backoff);
      continue;
    }
    if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
    return (await res.json()) as T;
  }
  throw new Error(`Request failed (429 after ${retries} retries): ${url}`);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const MEAT_WORDS = [
  "chicken", "beef", "pork", "lamb", "goat", "mutton", "rabbit", "quail",
  "bacon", "sausage", "turkey", "duck", "veal", "venison", "ham", "mince",
  "steak", "prosciutto", "chorizo", "pepperoni", "salami", "gammon",
  "tripe", "liver", "kidney", "gizzard", "bison", "elk", "pheasant",
  "fish", "salmon", "tuna", "shrimp", "prawn", "crab", "lobster", "cod",
  "anchov", "squid", "mussel", "oyster", "clam", "gelatine", "gelatin",
];
const DAIRY_EGG_WORDS = [
  "milk", "cream", "butter", "cheese", "yogurt", "yoghurt", "egg", "honey",
  "mayonnaise", "ghee",
];

/**
 * TheMealDB's own category is a more reliable meat/veg signal than scanning
 * ingredient text (e.g. "Goat" and "Seafood" categories don't always spell
 * out an obvious meat word), so it takes priority; ingredient scanning is
 * the fallback for categories that don't declare diet explicitly.
 */
function inferDietaryTags(category: string, ingredients: string[]): string[] {
  const meatCategories = new Set(["Beef", "Chicken", "Lamb", "Pork", "Goat", "Seafood"]);
  if (category === "Vegan") return ["Vegan", "Vegetarian"];
  if (category === "Vegetarian") return ["Vegetarian"];
  if (meatCategories.has(category)) return [];

  const haystack = ingredients.join(" ").toLowerCase();
  const hasMeat = MEAT_WORDS.some((w) => haystack.includes(w));
  const hasDairyOrEgg = DAIRY_EGG_WORDS.some((w) => haystack.includes(w));
  const tags: string[] = [];
  if (!hasMeat) {
    tags.push("Vegetarian");
    if (!hasDairyOrEgg) tags.push("Vegan");
  }
  return tags;
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

function inferCookMethod(instructions: string): string {
  const lower = instructions.toLowerCase();
  for (const [needle, label] of COOK_METHOD_KEYWORDS) {
    if (lower.includes(needle)) return label;
  }
  return "Stovetop";
}

// Header-only lines (no sentence punctuation, short) that some TheMealDB
// entries prepend, e.g. "Equipment", "Dutch Oven", "Instructions".
const HEADER_LINE = /^[A-Za-z][A-Za-z\s&/-]{1,30}$/;

function stripPreamble(raw: string): string {
  const cleaned = raw.replace(/\r\n/g, "\n").trim();
  const lines = cleaned.split(/\n+/).map((l) => l.trim());
  // If there's a standalone "Instructions" header line, drop everything up to it.
  const instructionsIdx = lines.findIndex((l) => /^instructions:?$/i.test(l));
  const startIdx = instructionsIdx >= 0 ? instructionsIdx + 1 : 0;
  return lines
    .slice(startIdx)
    .filter((l) => l.length > 0 && !HEADER_LINE.test(l))
    .join("\n");
}

function buildDescription(title: string, category: string, area: string, instructions: string): string {
  const body = stripPreamble(instructions).replace(/\s+/g, " ");
  const sentences = body.split(/(?<=[.!?])\s/).filter((s) => s.trim().length > 0);
  const summary = sentences.slice(0, 2).join(" ").trim();
  const intro = `A ${area} ${category.toLowerCase()} recipe.`;
  if (summary.length > 30 && summary.length < 320) {
    return summary;
  }
  return `${intro} ${title}.`;
}

function splitInstructions(raw: string): { step: number; text: string; timerMinutes: null }[] {
  const cleaned = stripPreamble(raw);
  // TheMealDB instructions are usually newline-separated steps, sometimes
  // already numbered, sometimes one long paragraph.
  let parts = cleaned
    .split(/\n+/)
    .map((s) => s.replace(/^\s*(step\s*)?\d+[.):-]?\s*/i, "").trim())
    .filter((s) => s.length > 0);

  if (parts.length <= 1) {
    parts = cleaned
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
  }

  if (parts.length === 0) parts = [cleaned || raw.trim()];

  return parts.map((text, i) => ({ step: i + 1, text, timerMinutes: null }));
}

async function withConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: limit }, run));
  return results;
}

async function main() {
  const { categories } = await fetchJson<{ categories: MealDbCategory[] }>(
    `${BASE}/categories.php`,
  );
  console.log(`Found ${categories.length} categories on TheMealDB.`);

  const idSet = new Map<string, string>(); // idMeal -> category (first seen)
  for (const cat of categories) {
    const { meals } = await fetchJson<{ meals: MealDbListItem[] | null }>(
      `${BASE}/filter.php?c=${encodeURIComponent(cat.strCategory)}`,
    );
    for (const m of meals ?? []) {
      if (!idSet.has(m.idMeal)) idSet.set(m.idMeal, cat.strCategory);
    }
  }
  const ids = Array.from(idSet.keys());
  console.log(`Found ${ids.length} unique meals across all categories.`);

  let inserted = 0;
  let skipped = 0;
  const usedSlugs = new Set<string>();

  await withConcurrency(ids, 3, async (id) => {
    try {
      await sleep(150);
      const detail = await fetchJson<{ meals: MealDbFull[] | null }>(
        `${BASE}/lookup.php?i=${id}`,
      );
      const meal = detail.meals?.[0];
      if (!meal) {
        skipped++;
        return;
      }

      const ingredients: { item: string; note: string | null }[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = (meal[`strIngredient${i}`] || "").trim();
        const measure = (meal[`strMeasure${i}`] || "").trim();
        if (!name) continue;
        ingredients.push({
          item: measure ? `${measure} ${name}` : name,
          note: null,
        });
      }
      if (ingredients.length === 0) {
        skipped++;
        return;
      }

      let slug = slugify(meal.strMeal);
      if (usedSlugs.has(slug)) slug = `${slug}-${meal.idMeal}`;
      usedSlugs.add(slug);

      const area = meal.strArea || "International";
      const category = meal.strCategory || idSet.get(id) || "Uncategorized";
      const instructions = splitInstructions(meal.strInstructions || "");
      const dietaryTags = inferDietaryTags(category, ingredients.map((i) => i.item));
      const cookMethod = inferCookMethod(meal.strInstructions || "");

      const row: InsertRecipe = {
        slug,
        title: meal.strMeal,
        description: buildDescription(meal.strMeal, category, area, meal.strInstructions || ""),
        category,
        cuisine: area,
        imageUrl: meal.strMealThumb,
        prepMinutes: null,
        cookMinutes: null,
        totalMinutes: null,
        servings: null,
        dietaryTags,
        cookMethod,
        rating: 0,
        reviewCount: 0,
        ingredients,
        instructions,
        caloriesPerServing: null,
        proteinG: null,
        carbsG: null,
        fatG: null,
        sourceUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
      };

      await db.insert(recipesTable).values(row).onConflictDoNothing({
        target: recipesTable.slug,
      });
      inserted++;
    } catch (err) {
      console.error(`Failed to import meal ${id}:`, err);
      skipped++;
    }
  });

  console.log(`Imported ${inserted} recipes, skipped ${skipped}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
