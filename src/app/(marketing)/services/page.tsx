import { PageHero } from "@/components/shared/page-hero";
import { ServiceList } from "@/components/shared/service-list";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { detailServices, services } from "@/content/services";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "SEO Services for Strategy, Audits, and Growth Consulting",
  description:
    "Explore keyword research, competitor analysis, technical SEO audits, local SEO, content strategy, and consulting services from sayseo.com.",
  path: "/services",
  keywords: [
    "SEO services UK",
    "SEO services India",
    "technical SEO audit services",
    "keyword research services",
  ],
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          buildCollectionPageSchema({
            name: "SEO services",
            description:
              "SEO consultancy services for keyword research, competitor analysis, technical audits, and growth consulting.",
            path: "/services",
            items: detailServices.map((service) => ({
              name: service.title,
              path: `/services/${service.slug}`,
            })),
          }),
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="SEO services built to support better decisions and stronger organic performance."
        description="Every service is designed to be strategic, actionable, and useful to real operating teams. We focus on the levers that improve visibility, improve conversion intent, and make growth more durable."
        highlights={[
          "Research-led planning",
          "Technical and content depth",
          "Retainers, projects, and advisory",
        ]}
      />

      <section className="section-space">
        <Container>
          <ServiceList services={services} />
        </Container>
      </section>
    </>
  );
}
