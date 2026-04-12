import { ContactForm } from "@/components/shared/contact-form";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { PageHero } from "@/components/shared/page-hero";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { contactExpectations, inquiryReasons, siteConfig } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildContactPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "Contact Our SEO Consultancy",
  description:
    "Start a conversation with sayseo.com about SEO strategy, technical audits, local growth, or consulting support for UK and India markets.",
  path: "/contact",
  keywords: ["contact SEO consultant", "book SEO strategy call", "SEO consultancy enquiry"],
});

const checklist = [
  "You need senior SEO thinking without building a large in-house team first.",
  "Your current traffic is not converting into the right type of lead.",
  "You want clear priorities across technical SEO, content, local visibility, and consulting support.",
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          buildContactPageSchema(),
        ]}
      />
      <PageHero
        eyebrow="Contact"
        title="Start with the business context, and we’ll reply with the right SEO next step."
        description="Use the brief below to start a practical conversation about what the business needs next. The goal is clarity on fit, scope, and sensible priorities, with a typical response inside one business day."
        highlights={[
          "Reply within one business day",
          "Senior-led scoping conversation",
          "Projects, retainers, and advisory",
        ]}
      />

      <section className="section-space">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />
          <aside className="surface p-8 md:p-10">
            <p className="eyebrow">Direct contact</p>
            <div className="mt-6 space-y-5 text-base leading-8 text-slate-600">
              <p>
                Email:{" "}
                <a className="font-semibold text-slate-950" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </p>
              <p>
                Phone:{" "}
                <a className="font-semibold text-slate-950" href={`tel:${siteConfig.phoneHref}`}>
                  {siteConfig.phone}
                </a>
              </p>
              <p>Primary markets: London, the wider UK, Bengaluru, and pan-India growth campaigns.</p>
              <p>Typical response time: within one business day for new enquiries.</p>
            </div>
            <div className="mt-10 rounded-[1.5rem] bg-stone-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Best fit
              </p>
              <ul className="mt-4 space-y-4 text-base leading-8 text-slate-600">
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="mt-10 rounded-[1.5rem] bg-slate-950 p-6 text-stone-100">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
                Good reasons to enquire
              </p>
              <ul className="mt-4 space-y-4 text-sm leading-7 text-stone-300">
                {inquiryReasons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container className="surface p-8 md:p-12">
          <p className="eyebrow">What happens next</p>
          <h2 className="section-title mt-4">The inquiry process is designed to be low-friction and commercially useful.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {contactExpectations.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] bg-stone-50 p-6">
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-base leading-8 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <InternalLinkPanel
        eyebrow="Before you enquire"
        title="If you need a little more confidence first, these pages are the best next stop."
        links={[
          {
            href: "/services",
            title: "Compare services",
            description: "Review which engagement is closest to the challenge the business is facing right now.",
          },
          {
            href: "/case-studies",
            title: "Review growth examples",
            description: "See how the consultancy frames outcomes, scope, and commercial movement.",
          },
          {
            href: "/about",
            title: "Learn how we work",
            description: "Understand the consulting approach before deciding whether to start a conversation.",
          },
        ]}
      />
    </>
  );
}
