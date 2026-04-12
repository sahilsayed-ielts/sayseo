import { CtaSection } from "@/components/sections/home/cta-section";
import { FaqPreview } from "@/components/sections/home/faq-preview";
import { Hero } from "@/components/sections/home/hero";
import { ProcessSection } from "@/components/sections/home/process-section";
import { ServicesOverview } from "@/components/sections/home/services-overview";
import { TrustStrip } from "@/components/sections/home/trust-strip";
import { TrustEvidence } from "@/components/sections/home/trust-evidence";
import { WhyChooseUs } from "@/components/sections/home/why-choose-us";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { JsonLd } from "@/components/ui/json-ld";
import { detailServices } from "@/content/services";
import { faqItems } from "@/content/site";
import { createMetadata } from "@/lib/metadata";
import {
  buildCollectionPageSchema,
  buildFaqSchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "@/lib/schema";

export const metadata = createMetadata({
  title: "SEO Consultancy for UK and India Businesses",
  description:
    "Senior-led SEO consultancy for UK and India businesses that need stronger visibility, better-quality leads, and commercially grounded search strategy.",
  path: "/",
  keywords: [
    "SEO consultancy UK and India",
    "SEO strategy services",
    "technical SEO consultant",
    "keyword research agency",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildWebsiteSchema(),
          buildFaqSchema(faqItems.slice(0, 4)),
          buildCollectionPageSchema({
            name: "sayseo.com services overview",
            description:
              "Core SEO services covering keyword research, competitor analysis, technical audits, and consulting support.",
            path: "/",
            items: detailServices.map((service) => ({
              name: service.title,
              path: `/services/${service.slug}`,
            })),
          }),
        ]}
      />
      <Hero />
      <TrustStrip />
      <WhyChooseUs />
      <ServicesOverview />
      <TrustEvidence />
      <ProcessSection />
      <InternalLinkPanel
        eyebrow="Popular routes"
        title="Start with the service or market page that matches the decision in front of you."
        links={[
          {
            href: "/services/technical-seo-audit",
            title: "Technical SEO audit",
            description: "For teams preparing a relaunch, migration, or structural clean-up.",
          },
          {
            href: "/services/keyword-research",
            title: "Keyword research",
            description: "For brands that need stronger page targeting and clearer demand mapping.",
          },
          {
            href: "/uk-seo-services",
            title: "UK SEO services",
            description: "Explore how the consultancy approaches trust-sensitive UK buying journeys.",
          },
        ]}
      />
      <FaqPreview />
      <CtaSection />
    </>
  );
}
