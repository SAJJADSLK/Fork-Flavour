---
name: Orval codegen name collisions
description: Two distinct Orval/openapi-spec pitfalls that produce confusing TypeScript errors after codegen, and how to fix each at the spec level.
---

**Pitfall 1 — combined path+query params on one operation.**
If an operation has both a path parameter and one or more query parameters (e.g. `GET /things/{id}/related?limit=`), Orval's zod generator and its types generator can both emit a same-named `<OperationId>Params` export, causing `TS2308: Module has already exported a member named ...`.

**Why:** it's a naming heuristic collision between the two Orval output targets (api-client-react's types file vs. api-zod's schema file), not a real duplicate definition.

**How to apply:** simplest fix is to avoid mixing path params with query params on the same operation where possible — e.g. drop an optional `limit` query param and hardcode the limit server-side, or split into a separate query-only endpoint. Re-run codegen after editing `lib/api-spec/openapi.yaml`.

**Pitfall 2 — a schema name (e.g. `ErrorResponse`) is exported as both a zod value and a plain TS type from different generated files, both re-exported via the same barrel (`export *`).**
Usage sites see `TS2693: 'X' only refers to a type, but is being used as a value here` when calling `.parse()` on it, because the ambiguous re-export resolves to the type-only version.

**How to apply:** don't call `.parse()` on shared response schemas in route handlers — import the schema `type` only and construct/return a plain object literal (or a small local helper function) matching that type instead.
