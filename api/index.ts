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
import app from "../artifacts/api-server/src/app";

export default app;
