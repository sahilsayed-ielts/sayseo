import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { regionalPages } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "India SEO Services for Category Growth and Organic Demand",
  description:
    "SEO services for India-focused businesses that need stronger category visibility, better regional relevance, and scalable organic growth planning.",
  path: "/india-seo-services",
  keywords: ["India SEO services", "SEO consultancy India", "local SEO India"],
});

export default function IndiaSeoServicesPage() {
  const region = regionalPages.india;

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "India SEO Services", path: "/india-seo-services" },
          ]),
          buildCollectionPageSchema({
            name: "India SEO services",
            description:
              "SEO consulting support for India-focused brands, category growth plans, and scalable content architecture.",
            path: "/india-seo-services",
            items: [
              { name: "Keyword research", path: "/services/keyword-research" },
              { name: "Competitor analysis", path: "/services/competitor-analysis" },
              { name: "Technical SEO audit", path: "/services/technical-seo-audit" },
            ],
          }),
        ]}
      />
      <PageHero
        eyebrow="India SEO services"
        title={region.title}
        description={region.description}
        highlights={region.highlights}
      />

      <section className="section-space">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="surface p-8 md:p-10">
            <p className="eyebrow">What matters in India</p>
            <h2 className="section-title mt-4">Search growth needs market sensitivity, not imported playbooks.</h2>
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
            <ButtonLink href="/contact">Discuss an India SEO brief</ButtonLink>
          </div>
        </Container>
      </section>
      <InternalLinkPanel
        eyebrow="Relevant next pages"
        title="Useful next steps for India-focused search growth planning."
        links={[
          {
            href: "/services/keyword-research",
            title: "Keyword research",
            description: "Map category demand, regional intent, and scalable topic structure.",
          },
          {
            href: "/services/competitor-analysis",
            title: "Competitor analysis",
            description: "Understand where the market is crowded and where differentiation is realistic.",
          },
          {
            href: "/contact",
            title: "Book a strategy call",
            description: "Scope the right blend of SEO strategy, content architecture, and execution support.",
          },
        ]}
      />
    </>
  );
}
