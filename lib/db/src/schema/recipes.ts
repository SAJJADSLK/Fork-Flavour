import {
  pgTable,
  serial,
  text,
  integer,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  imageUrl: text("image_url").notNull(),
  prepMinutes: integer("prep_minutes"),
  cookMinutes: integer("cook_minutes"),
  totalMinutes: integer("total_minutes"),
  servings: integer("servings"),
  sourceUrl: text("source_url"),
  dietaryTags: text("dietary_tags").array().notNull().default([]),
  cookMethod: text("cook_method").notNull(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  // Ingredient[]: { item: string, note?: string | null }
  ingredients: jsonb("ingredients").notNull(),
  // InstructionStep[]: { step: number, text: string, timerMinutes?: number | null }
  instructions: jsonb("instructions").notNull(),
  caloriesPerServing: integer("calories_per_serving"),
  proteinG: integer("protein_g"),
  carbsG: integer("carbs_g"),
  fatG: integer("fat_g"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeRow = typeof recipesTable.$inferSelect;
