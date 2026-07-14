import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db, recipesTable } from "./index";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Set SITE_URL once the app has a real domain (e.g. after publishing) so the
// sitemap advertises canonical, crawlable URLs instead of a placeholder.
const SITE_URL = (process.env.SITE_URL ?? "https://fork-and-flavor.replit.app").replace(/\/$/, "");

async function generateSitemap() {
  const rows = await db.query.recipesTable.findMany({
    columns: { slug: true, createdAt: true },
  });

  const staticUrls = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/recipes", changefreq: "daily", priority: "0.9" },
    { path: "/about", changefreq: "monthly", priority: "0.3" },
    { path: "/privacy", changefreq: "yearly", priority: "0.1" },
    { path: "/terms", changefreq: "yearly", priority: "0.1" },
  ];

  const urlEntries = [
    ...staticUrls.map(
      (u) =>
        `  <url><loc>${SITE_URL}${u.path}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    ),
    ...rows.map(
      (r) =>
        `  <url><loc>${SITE_URL}/recipe/${r.slug}</loc><lastmod>${r.createdAt.toISOString().slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>\n`;

  const outPath = resolve(__dirname, "../../../artifacts/fork-and-flavor/public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`Wrote sitemap with ${urlEntries.length} URLs to ${outPath}`);
  process.exit(0);
}

generateSitemap().catch((err) => {
  console.error(err);
  process.exit(1);
});
