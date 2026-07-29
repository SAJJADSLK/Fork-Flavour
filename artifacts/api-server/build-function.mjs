import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

// This bundles src/app.ts (the Express app itself, no app.listen()/PORT
// requirement) into a single self-contained ESM file at dist/app.mjs.
//
// Why this exists separately from build.mjs (which bundles src/index.ts,
// the standalone server entry point used by `pnpm run start`):
//
// @workspace/api-zod and @workspace/db declare their package.json "exports"
// pointing directly at raw TypeScript source (./src/index.ts) rather than
// compiled output. That's fine for local dev (tsx) and the Vite frontend
// build (which bundles through .ts natively), but Vercel's serverless
// function builder compiles files individually rather than bundling — so at
// runtime it tries to `import` those workspace packages via Node's plain
// ESM resolver, follows "exports" to the raw .ts file, and fails with
// ERR_MODULE_NOT_FOUND because Node can't execute .ts and the file isn't
// even included in the deployed function output.
//
// Bundling src/app.ts with esbuild here inlines @workspace/api-zod and
// @workspace/db (and everything else not in `external` below) directly into
// dist/app.mjs, so there's nothing left to resolve at runtime for those
// packages. api/index.ts imports this file instead of the raw src/app.ts.
async function buildFunction() {
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/app.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: path.resolve(artifactDir, "dist"),
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Keep this list in sync with build.mjs — same rationale: packages that
    // can't or shouldn't be bundled (native addons, packages that load
    // sibling files via path traversal, etc).
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

buildFunction().catch((err) => {
  console.error(err);
  process.exit(1);
});
