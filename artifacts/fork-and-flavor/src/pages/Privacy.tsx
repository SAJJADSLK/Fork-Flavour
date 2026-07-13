export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Fork & Flavor ("we", "us") publishes recipe content for home cooks.
          This page explains what data is collected when you visit the site
          and how it is used.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Information We Collect</h2>
        <p>
          We do not require an account to browse or search recipes. We do not
          collect names, email addresses, or payment information through this
          site.
        </p>
        <p>
          Like most websites, our server automatically logs standard technical
          information (such as IP address, browser type, and pages visited)
          for security and diagnostic purposes.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Cookies & Advertising</h2>
        <p>
          This site may display ads served by Google AdSense. Google and its
          partners may use cookies and similar technologies to serve ads based
          on your prior visits to this and other websites. You can opt out of
          personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Google Ads Settings
          </a>
          , or generally at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            www.aboutads.info/choices
          </a>
          .
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Recipe Data</h2>
        <p>
          Some recipes on this site are sourced from{" "}
          <a
            href="https://www.themealdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            TheMealDB
          </a>
          , a free public recipe database, and are credited on each recipe
          page. Other recipes are original to Fork & Flavor.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Continued use of the
          site after changes constitutes acceptance of the updated policy.
        </p>

        <h2 className="font-serif text-2xl font-bold text-foreground pt-4">Contact</h2>
        <p>
          Questions about this policy can be directed through the contact
          information listed on our About page.
        </p>
      </div>
    </div>
  );
}
