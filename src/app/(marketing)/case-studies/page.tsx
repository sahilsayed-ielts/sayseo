import { PageHero } from "@/components/shared/page-hero";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { caseStudies } from "@/content/editorial";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "SEO Case Studies and Growth Examples",
  description:
    "Preview anonymised SEO case studies across SaaS, local services, and B2B categories to see how sayseo.com approaches growth planning.",
  path: "/case-studies",
  keywords: ["SEO case studies", "SEO growth examples", "SEO consulting results"],
});

export default function CaseStudiesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Case Studies", path: "/case-studies" },
          ]),
          buildCollectionPageSchema({
            name: "SEO case studies",
            description:
              "Anonymised examples of SEO growth planning across SaaS, local, and B2B categories.",
            path: "/case-studies",
            items: caseStudies.map((study, index) => ({
              name: study.title,
              path: `/case-studies#study-${index + 1}`,
            })),
          }),
        ]}
      />
      <PageHero
        eyebrow="Case studies"
        title="Selected growth stories from strategy-led SEO engagements."
        description="These examples are realistic placeholders that show how we frame outcomes, communicate decisions, and connect SEO work to real business movement."
        highlights={[
          "Anonymised for discretion",
          "Focused on qualified growth",
          "Blending technical, local, and content SEO",
        ]}
      />

      <section className="section-space">
        <Container className="grid gap-6">
          {caseStudies.map((study) => (
            <article
              key={study.title}
              id={`study-${caseStudies.indexOf(study) + 1}`}
              className="surface grid gap-6 p-8 md:grid-cols-[0.4fr_0.6fr] md:p-10"
            >
              <div>
                <p className="eyebrow">{study.market}</p>
                <h2 className="mt-4 font-display text-4xl leading-tight text-slate-950">
                  {study.title}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{study.summary}</p>
              </div>
              <div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {study.impact.map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] bg-stone-50 p-5">
                      <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-base leading-8 text-slate-600">
                  {study.approach}
                </p>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container className="surface p-8 text-center md:p-12">
          <p className="eyebrow">Need a similar outcome?</p>
          <h2 className="section-title mt-4">Let’s scope the fastest path to meaningful SEO traction.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            We can review your current visibility, identify the biggest structural opportunities, and outline what a sensible engagement should look like.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact">Book a strategy call</ButtonLink>
          </div>
        </Container>
      </section>
      <InternalLinkPanel
        eyebrow="Keep exploring"
        title="Use these pages to turn example outcomes into a clearer SEO plan."
        links={[
          {
            href: "/services",
            title: "Explore services",
            description: "See which service line best matches the type of growth challenge in front of you.",
          },
          {
            href: "/blog",
            title: "Read the blog",
            description: "Build context through practical thinking on SEO strategy, audits, and local visibility.",
          },
          {
            href: "/contact",
            title: "Book a strategy call",
            description: "Discuss what a realistic, commercially sensible SEO engagement should look like.",
          },
        ]}
      />
    </>
  );
}
