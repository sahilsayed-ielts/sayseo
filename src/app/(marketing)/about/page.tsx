import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { whyChooseUs } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "About Our SEO Consultancy",
  description:
    "Meet sayseo.com, a senior-led SEO consultancy helping businesses across the UK and India build durable, commercially grounded organic growth systems.",
  path: "/about",
});

const principles = [
  {
    title: "Strategy before activity",
    description:
      "We do not start with checklists. We start with search intent, revenue goals, commercial priorities, and the constraints your team is actually working with.",
  },
  {
    title: "Clear thinking, clearly communicated",
    description:
      "Every audit, roadmap, and recommendation is built so founders, marketers, and developers can act on it without translating consultant jargon.",
  },
  {
    title: "Senior-led delivery",
    description:
      "The work is led by experienced strategists who understand technical SEO, local search, content systems, and how all of them affect qualified pipeline.",
  },
];

const marketNotes = [
  "Search strategies tailored for UK buying journeys, local pack visibility, and service-led lead generation.",
  "India market planning that accounts for geographic scale, price sensitivity, multilingual intent, and category maturity.",
  "Engagements structured for founder-led businesses, in-house marketing teams, and agencies that need specialist support.",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <PageHero
        eyebrow="About sayseo.com"
        title="A premium SEO partner for businesses that need clarity, not noise."
        description="sayseo.com exists to help ambitious brands make stronger decisions about search. We blend technical depth, commercial judgement, and calm execution so SEO becomes a growth lever the whole business can trust."
        highlights={[
          "UK and India market focus",
          "Senior-led consulting model",
          "Built for long-term organic growth",
        ]}
      />

      <section className="section-space">
        <Container className="grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <article key={principle.title} className="surface p-8">
              <p className="eyebrow mb-4">Principle</p>
              <h2 className="font-display text-3xl leading-tight text-slate-950">
                {principle.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {principle.description}
              </p>
            </article>
          ))}
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container className="surface grid gap-10 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12">
          <div>
            <p className="eyebrow">Where we work best</p>
            <h2 className="section-title mt-4">
              Built for regional nuance and executive-level trust.
            </h2>
          </div>
          <div className="space-y-6">
            {marketNotes.map((note) => (
              <p key={note} className="border-b border-slate-200/80 pb-6 text-base leading-8 text-slate-600 last:border-b-0 last:pb-0">
                {note}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70 py-20">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Why teams hire us</p>
            <h2 className="section-title mt-4">The qualities clients want to feel from day one.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whyChooseUs.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-slate-200/80 bg-stone-50 p-7">
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <ButtonLink href="/contact">Start a conversation</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
