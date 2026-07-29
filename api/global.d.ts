// artifacts/api-server/dist/app.mjs is an esbuild-bundled output file with no
// accompanying .d.ts. This ambient declaration lets api/index.ts import it
// without a TS7016 "implicitly has an 'any' type" error — the real type is
// asserted at the import site in api/index.ts.
declare module "*.mjs" {
  const value: unknown;
  export default value;
}
