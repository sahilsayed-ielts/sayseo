import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/shared/faq-list";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { PageHero } from "@/components/shared/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { detailServices, getServiceBySlug } from "@/content/services";
import { createMetadata } from "@/lib/metadata";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
} from "@/lib/schema";

type ServicePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return detailServices.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service || !service.detailPage) {
    return createMetadata({
      title: "SEO Services",
      description: "Explore the SEO services available from sayseo.com.",
      path: "/services",
    });
  }

  return createMetadata({
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.summary,
    path: `/services/${service.slug}`,
    keywords: [
      service.title,
      `${service.title} services`,
      "SEO consultancy",
      "SEO services UK and India",
    ],
  });
}

export default async function ServiceDetailPage({
  params,
}: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service || !service.detailPage) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
          buildServiceSchema(service),
          ...(service.faqItems?.length ? [buildFaqSchema(service.faqItems)] : []),
        ]}
      />

      <PageHero
        eyebrow="Service detail"
        title={service.title}
        description={service.intro}
        highlights={service.outcomes}
      />

      <section className="pt-8">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
          >
            <Link href="/" className="transition hover:text-slate-950">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="transition hover:text-slate-950">
              Services
            </Link>
            <span>/</span>
            <span className="text-slate-950">{service.title}</span>
          </nav>
        </Container>
      </section>

      <section className="section-space">
        <Container className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="surface p-8 md:p-10">
            <p className="eyebrow">Best fit</p>
            <h2 className="section-title mt-4">Where this engagement is most valuable.</h2>
            <ul className="mt-8 space-y-4 text-base leading-8 text-slate-600">
              {service.idealFor.map((item) => (
                <li key={item} className="border-b border-slate-200/80 pb-4 last:border-b-0 last:pb-0">
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-dark p-8 md:p-10">
            <p className="eyebrow text-teal-300">What you get</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight">
              Practical outputs a team can use immediately.
            </h2>
            <ul className="mt-8 space-y-4 text-base leading-8 text-stone-300">
              {service.deliverables.map((item) => (
                <li key={item} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm uppercase tracking-[0.24em] text-teal-300">
              Typical turnaround: {service.timeline}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="accent">
                Ask about this service
              </ButtonLink>
              <ButtonLink href="/services" variant="dark-secondary">
                Explore all services
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm leading-7 text-stone-400">
              New service enquiries are usually answered within one business day.
            </p>
          </section>
        </Container>
      </section>

      {service.packageTitle && service.packageIncludes?.length ? (
        <section className="pb-20 md:pb-28">
          <Container className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <aside className="surface p-8 md:p-10">
              <p className="eyebrow">Indicative format</p>
              <h2 className="section-title mt-4">{service.packageTitle}</h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                {service.packageSummary}
              </p>
              <div className="mt-8">
                <ButtonLink href="/contact">Discuss package fit</ButtonLink>
              </div>
            </aside>
            <section className="surface p-8 md:p-10">
              <p className="eyebrow">Common inclusions</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {service.packageIncludes.map((item) => (
                  <article key={item} className="rounded-[1.35rem] bg-stone-50 p-5">
                    <p className="text-sm leading-7 text-slate-700">{item}</p>
                  </article>
                ))}
              </div>
            </section>
          </Container>
        </section>
      ) : null}

      <section className="pb-20 md:pb-28">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface p-8 md:p-12">
            <p className="eyebrow">Commercial outcomes</p>
            <h2 className="section-title mt-4">What this should improve in practical terms.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {service.advantages.map((advantage) => (
                <article key={advantage.title} className="rounded-[1.5rem] bg-stone-50 p-6">
                  <h3 className="text-xl font-semibold text-slate-950">{advantage.title}</h3>
                  <p className="mt-3 text-base leading-8 text-slate-600">
                    {advantage.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <aside className="surface-dark p-8 md:p-10">
            <p className="eyebrow text-teal-300">Next step</p>
            <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.03em] text-white">
              Need help deciding if this is the right engagement?
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-300">
              We can review your current position, expected outcomes, and the most
              sensible scope before you commit to a project.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="accent">
                Book a strategy call
              </ButtonLink>
              <ButtonLink href="/services" variant="dark-secondary">
                Compare services
              </ButtonLink>
            </div>
            <p className="mt-5 text-sm leading-7 text-stone-400">
              If this is not the right first engagement, we will point you to the better-fit scope.
            </p>
          </aside>
        </Container>
      </section>

      {service.process?.length ? (
        <section className="pb-20 md:pb-28">
          <Container className="surface p-8 md:p-12">
            <p className="eyebrow">How it runs</p>
            <h2 className="section-title mt-4">A focused engagement with clear stages and clear handoff.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {service.process.map((step, index) => (
                <article key={step.title} className="rounded-[1.5rem] bg-stone-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Stage {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-base leading-8 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {service.faqItems?.length ? (
        <section className="pb-20 md:pb-28">
          <Container className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="eyebrow">Service FAQ</p>
              <h2 className="section-title mt-4">Answers to the questions teams usually ask before committing.</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                These answers are designed to make the scope clearer and give your team
                a more practical sense of how the work would fit.
              </p>
            </div>
            <FaqList items={service.faqItems} />
          </Container>
        </section>
      ) : null}

      <section className="pb-20 md:pb-28">
        <Container className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="surface-dark p-8 md:p-10">
            <p className="eyebrow text-teal-300">Why teams move forward</p>
            <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.03em] text-white">
              The value is usually in clarity, not just deliverables.
            </h2>
            <p className="mt-5 text-base leading-8 text-stone-300">
              Most buyers come to this stage because the current SEO picture is unclear,
              internal priorities are competing, or the business needs a more defensible
              next step before investing further.
            </p>
          </aside>
          <section className="surface p-8 md:p-10">
            <p className="eyebrow">Useful proof paths</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link href="/case-studies" className="surface-soft block p-5 transition hover:-translate-y-0.5">
                <h3 className="text-lg font-semibold text-slate-950">Case studies</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Review anonymised growth examples and commercial framing.
                </p>
              </Link>
              <Link href="/blog" className="surface-soft block p-5 transition hover:-translate-y-0.5">
                <h3 className="text-lg font-semibold text-slate-950">SEO insights</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Read how we think about strategy, audits, and implementation.
                </p>
              </Link>
              <Link href="/contact" className="surface-soft block p-5 transition hover:-translate-y-0.5">
                <h3 className="text-lg font-semibold text-slate-950">Enquire now</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Start with your brief and we’ll help shape the right scope.
                </p>
              </Link>
            </div>
          </section>
        </Container>
      </section>

      <InternalLinkPanel
        eyebrow="Keep exploring"
        title="Use these pages to compare adjacent services, regional routes, and the next conversion step."
        links={[
          {
            href: "/services",
            title: "Services hub",
            description: "Compare this engagement with the wider service offer and delivery formats.",
          },
          {
            href: service.slug === "keyword-research" ? "/uk-seo-services" : "/services/keyword-research",
            title:
              service.slug === "keyword-research"
                ? "UK SEO services"
                : "Keyword research services",
            description:
              service.slug === "keyword-research"
                ? "See how demand mapping fits into UK-focused local and service-led growth."
                : "Explore how research and targeting shape stronger SEO direction.",
          },
          {
            href: "/contact",
            title: "Book a strategy call",
            description: "Talk through your current constraints, expected outcomes, and sensible next scope.",
          },
        ]}
      />
    </>
  );
}
