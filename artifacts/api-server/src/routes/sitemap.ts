import { Router, type IRouter } from "express";
import { db } from "@workspace/db";

const router: IRouter = Router();

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Live sitemap built from the database, so every recipe (including ones the
 * daily import adds) is listed. Served at /sitemap.xml via a vercel.json rewrite.
 */
router.get("/sitemap.xml", async (_req, res) => {
  const site = (process.env.SITE_URL ?? "https://forkflavour.com").replace(/\/$/, "");
  const rows = await db.query.recipesTable.findMany({
    columns: { slug: true, createdAt: true },
  });

  const pages = ["/", "/recipes", "/about", "/privacy", "/terms"];
  const urls = [
    ...pages.map((p) => `  <url><loc>${site}${p}</loc></url>`),
    ...rows.map(
      (r) =>
        `  <url><loc>${esc(`${site}/recipe/${r.slug}`)}</loc><lastmod>${r.createdAt.toISOString().slice(0, 10)}</lastmod></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  res
    .status(200)
    .type("application/xml")
    .set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    .send(xml);
});

export default router;
