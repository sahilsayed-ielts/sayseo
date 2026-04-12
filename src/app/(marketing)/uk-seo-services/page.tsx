import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { regionalPages } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "UK SEO Services for Lead Generation and Local Growth",
  description:
    "SEO services for UK businesses that need stronger local visibility, better lead quality, and commercially focused search strategy.",
  path: "/uk-seo-services",
  keywords: ["UK SEO services", "local SEO UK", "SEO consultancy UK"],
});

export default function UkSeoServicesPage() {
  const region = regionalPages.uk;

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "UK SEO Services", path: "/uk-seo-services" },
          ]),
          buildCollectionPageSchema({
            name: "UK SEO services",
            description:
              "Regional SEO consulting support for UK-focused businesses and local growth campaigns.",
            path: "/uk-seo-services",
            items: [
              { name: "Technical SEO audit", path: "/services/technical-seo-audit" },
              { name: "Keyword research", path: "/services/keyword-research" },
              { name: "Competitor analysis", path: "/services/competitor-analysis" },
            ],
          }),
        ]}
      />
      <PageHero
        eyebrow="UK SEO services"
        title={region.title}
        description={region.description}
        highlights={region.highlights}
      />

      <section className="section-space">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="surface p-8 md:p-10">
            <p className="eyebrow">What matters in the UK market</p>
            <h2 className="section-title mt-4">Visibility needs to map to trust and conversion quality.</h2>
          </article>
          <div className="grid gap-6">
            {region.focus.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-7">
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container className="surface p-8 md:p-12">
          <p className="eyebrow">Common engagement types</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {region.engagements.map((item) => (
              <article key={item} className="rounded-[1.5rem] bg-stone-50 p-6 text-base leading-8 text-slate-600">
                {item}
              </article>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/contact">Discuss a UK SEO brief</ButtonLink>
          </div>
        </Container>
      </section>
      <InternalLinkPanel
        eyebrow="Relevant next pages"
        title="Useful next steps for UK-focused search growth planning."
        links={[
          {
            href: "/services/technical-seo-audit",
            title: "Technical SEO audit",
            description: "Useful when performance is inconsistent or the site is preparing to scale.",
          },
          {
            href: "/services/competitor-analysis",
            title: "Competitor analysis",
            description: "See where UK rivals are winning demand and how to position more intelligently.",
          },
          {
            href: "/contact",
            title: "Book a strategy call",
            description: "Discuss the commercial priorities and local search constraints shaping the brief.",
          },
        ]}
      />
    </>
  );
}
