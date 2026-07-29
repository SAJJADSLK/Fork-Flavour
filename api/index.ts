/**
 * Vercel Serverless Function — API entry point.
 *
 * Vercel's @vercel/node runtime compiles this TypeScript file and traces all
 * imports (including pnpm workspace packages) automatically. The Express app
 * exported from artifacts/api-server/src/app handles all routing; Vercel just
 * calls it as a standard (req, res) handler.
 *
 * Required environment variables in Vercel dashboard:
 *   DATABASE_URL  — PostgreSQL connection string (Neon, Supabase, Railway, etc.)
 *   NODE_ENV      — set to "production"
 */
import type { IncomingMessage, ServerResponse } from "http";

// `artifacts/api-server` has its own package.json with "type": "module", so
// Vercel's @vercel/node builder emits app.js as an ES module. This function's
// entry point (api/index.ts) sits under the workspace root package.json,
// which has no "type" field and therefore compiles to CommonJS. A CJS file
// cannot `require()` an ESM file, so we lazily `import()` it instead — the
// module is cached after the first invocation, so this only costs an extra
// await on cold start.
type AppModule = typeof import("../artifacts/api-server/src/app.js");
type ExpressApp = AppModule["default"];

let appPromise: Promise<ExpressApp> | undefined;

function getApp() {
  if (!appPromise) {
    appPromise = import("../artifacts/api-server/src/app.js").then(
      (mod) => mod.default,
    );
  }
  return appPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await getApp();
  return app(req, res);
}
