/**
 * Curated ingredient substitution knowledge base. Keeps the "sous-chef"
 * feature honest and deterministic -- it suggests real, tested swaps rather
 * than fabricating an answer for an ingredient it knows nothing about.
 */
interface SubstitutionEntry {
  match: RegExp;
  suggestion: (ingredient: string) => string;
}

const SUBSTITUTIONS: SubstitutionEntry[] = [
  {
    match: /buttermilk/i,
    suggestion: () =>
      "Stir 1 tablespoon lemon juice or white vinegar into 1 cup of milk and let it sit for 5 minutes until it curdles slightly -- a near-perfect stand-in for buttermilk in both flavor and acidity.",
  },
  {
    match: /heavy cream/i,
    suggestion: () =>
      "Whisk 3/4 cup milk with 1/3 cup melted butter for a workable substitute. It won't whip into peaks, but it performs well in sauces, soups, and baking.",
  },
  {
    match: /\bbutter\b/i,
    suggestion: () =>
      "Swap in an equal amount of neutral oil (like grapeseed or avocado oil) for cooking, or a 1:1 amount of coconut oil in baking for a similar fat content, though the flavor and texture will shift slightly.",
  },
  {
    match: /\begg\b|\beggs\b/i,
    suggestion: () =>
      "For binding in baked goods, use 1 tablespoon ground flaxseed mixed with 3 tablespoons water per egg, rested for 5 minutes until gel-like. For richness in savory dishes, a mashed ripe banana or 1/4 cup unsweetened applesauce works in sweeter bakes.",
  },
  {
    match: /white wine/i,
    suggestion: () =>
      "Use an equal amount of chicken or vegetable stock with a teaspoon of lemon juice or white wine vinegar whisked in -- it reintroduces the acidity the wine would have added.",
  },
  {
    match: /miso/i,
    suggestion: () =>
      "Tahini mixed with a splash of soy sauce and a pinch of sugar mimics miso's salty, umami depth reasonably well, though it won't have the same fermented complexity.",
  },
  {
    match: /fresh (thyme|rosemary|basil|parsley|cilantro|mint)/i,
    suggestion: (ingredient) =>
      `Use dried ${ingredient.replace(/fresh\s*/i, "").trim()} at about a third of the amount called for -- dried herbs are more concentrated. Add it earlier in cooking so it has time to rehydrate and bloom.`,
  },
  {
    match: /parmesan|pecorino/i,
    suggestion: () =>
      "Any hard, aged grating cheese works here -- Grana Padano, aged Gouda, or even nutritional yeast with a pinch of salt for a dairy-free version with a similar savory punch.",
  },
  {
    match: /soy sauce/i,
    suggestion: () =>
      "Tamari is a near 1:1 swap (and gluten-free). In a pinch, Worcestershire sauce cut with a little water gets close to the same salty depth.",
  },
  {
    match: /lemon/i,
    suggestion: () =>
      "Lime juice is the closest substitute measure-for-measure. White wine vinegar diluted slightly with water also works when you just need the acidity, not the citrus aroma.",
  },
  {
    match: /garlic/i,
    suggestion: () =>
      "Use 1/8 teaspoon garlic powder per clove called for, or a similar amount of garlic paste. The flavor will be milder and less sharp than fresh.",
  },
  {
    match: /shallot/i,
    suggestion: () =>
      "A small onion (about a third the volume) with a minced garlic clove added gets you close to a shallot's sweet, mild-onion character.",
  },
  {
    match: /panko|breadcrumb/i,
    suggestion: () =>
      "Crushed crackers, cornflakes, or torn stale bread pulsed in a food processor all work as a crunchy coating substitute.",
  },
];

const FALLBACK = (ingredient: string) =>
  `We don't have a tested substitution on file for "${ingredient}" yet. As a general rule, look for an ingredient with a similar fat content, acidity, or role in the recipe (binding, leavening, or flavor) -- and start with a smaller amount, tasting as you go.`;

export function suggestSubstitution(ingredient: string): string {
  const trimmed = ingredient.trim();
  for (const entry of SUBSTITUTIONS) {
    if (entry.match.test(trimmed)) {
      return entry.suggestion(trimmed);
    }
  }
  return FALLBACK(trimmed);
}
