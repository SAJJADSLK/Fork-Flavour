import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

/**
 * Tracks pagination + daily-quota bookkeeping for external recipe importers
 * (e.g. Spoonacular) so a cron-triggered run knows where the previous run
 * left off and won't blow past the provider's daily point budget.
 */
export const importStateTable = pgTable("import_state", {
  source: text("source").primaryKey(), // e.g. "spoonacular"
  cursor: integer("cursor").notNull().default(0), // offset into the provider's result set
  pointsUsedToday: integer("points_used_today").notNull().default(0),
  lastRunDate: text("last_run_date"), // "YYYY-MM-DD", used to reset pointsUsedToday
  totalImported: integer("total_imported").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ImportStateRow = typeof importStateTable.$inferSelect;

