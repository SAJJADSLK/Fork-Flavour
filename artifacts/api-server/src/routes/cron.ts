import { Router, type IRouter } from "express";
import { runSpoonacularImport } from "@workspace/db";

const router: IRouter = Router();

/**
 * Triggered once/day by Vercel Cron (see vercel.json "crons"). Vercel signs
 * cron requests with the `authorization: Bearer ${CRON_SECRET}` header
 * automatically, so this also doubles as auth against anyone else hitting
 * the endpoint directly.
 *
 * Safe to call more than once/day too — runSpoonacularImport tracks the
 * Spoonacular points already spent "today" in the DB and stops itself
 * before going over budget.
 */
router.get("/cron/import-recipes", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "SPOONACULAR_API_KEY is not configured" });
    return;
  }

  try {
    const result = await runSpoonacularImport({ apiKey, batchSize: 100 });
    res.json(result);
  } catch (err) {
    console.error("spoonacular import failed", err);
    res.status(500).json({ error: "Import failed", detail: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
