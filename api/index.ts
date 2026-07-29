/**
 * Vercel Serverless Function — API entry point.
 *
 * This imports a PRE-BUNDLED copy of the Express app
 * (artifacts/api-server/dist/app.mjs — built by
 * `pnpm --filter @workspace/api-server run build:function`, see
 * vercel.json's buildCommand) rather than the raw TypeScript source.
 *
 * Why: @workspace/api-zod and @workspace/db declare package.json "exports"
 * that point directly at raw .ts source files (no compiled output). Vercel's
 * serverless function builder compiles files individually rather than
 * bundling, so importing the raw source directly used to fail at runtime
 * with ERR_MODULE_NOT_FOUND — Node tried to resolve those workspace
 * packages via their "exports" field, found a .ts file, and couldn't load
 * it (it wasn't even included in the deployed function output).
 * dist/app.mjs is a single esbuild bundle with those packages already
 * inlined, so there's nothing left to resolve at runtime.
 *
 * `artifacts/api-server` has its own package.json with "type": "module", so
 * dist/app.mjs is an ES module. This function's entry point (api/index.ts)
 * sits under the workspace root package.json, which has no "type" field and
 * therefore compiles to CommonJS. A CJS file cannot `require()` an ESM
 * file, so we lazily `import()` it instead — the module is cached after the
 * first invocation, so this only costs an extra await on cold start.
 *
 * Required environment variables in Vercel dashboard:
 *   DATABASE_URL  — PostgreSQL connection string (Neon, Supabase, Railway, etc.)
 *   NODE_ENV      — set to "production"
 */
import type { IncomingMessage, ServerResponse } from "http";

// Loosely typed on purpose: dist/app.mjs is plain compiled JS with no
// declaration file, and api/ isn't a workspace package so it can't resolve
// "express" types from its own location anyway (see history of this file
// for the TS2307 this caused previously).
type RequestHandler = (req: IncomingMessage, res: ServerResponse) => unknown;

let appPromise: Promise<RequestHandler> | undefined;

function getApp(): Promise<RequestHandler> {
  if (!appPromise) {
    appPromise = (
      import("../artifacts/api-server/dist/app.mjs") as Promise<{
        default: RequestHandler;
      }>
    ).then((mod) => mod.default);
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
