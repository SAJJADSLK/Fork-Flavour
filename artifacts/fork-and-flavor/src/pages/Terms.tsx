import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function Terms() {
  useDocumentMeta({
    title: "Terms of Service | Fork & Flavor",
    description: "The terms governing use of Fork & Flavor's recipe content.",
    canonicalPath: "/terms",
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          By using Fork & Flavor, you agree to the following terms. If you do
          not agree, please do not use the site.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Use of Content</h2>
        <p>
          Recipes, images, and text on this site are provided for personal,
          non-commercial use. Some recipe data is sourced from TheMealDB
          under its free public API and is credited accordingly on individual
          recipe pages.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">No Warranty</h2>
        <p>
          Recipes are provided "as is." Cooking times, ingredient
          substitutions, and nutrition estimates are guidance, not
          guarantees — always use your own judgment, especially around food
          safety and allergies.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Advertising</h2>
        <p>
          This site may display third-party advertisements, including through
          Google AdSense. We are not responsible for the content of ads served
          by third parties.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the site
          after changes constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
