import { PageHero } from "@/components/shared/page-hero";
import { InternalLinkPanel } from "@/components/shared/internal-link-panel";
import { ButtonLink } from "@/components/ui/button-link";
import { JsonLd } from "@/components/ui/json-ld";
import { Container } from "@/components/ui/container";
import { blogPosts } from "@/content/editorial";
import { createMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildCollectionPageSchema } from "@/lib/schema";

export const metadata = createMetadata({
  title: "SEO Blog for Strategy, Technical Foundations, and Local Growth",
  description:
    "Read practical SEO articles on strategy, technical foundations, local visibility, and content systems for businesses in the UK and India.",
  path: "/blog",
  keywords: ["SEO blog", "technical SEO articles", "local SEO insights", "content strategy SEO"],
});

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          buildCollectionPageSchema({
            name: "SEO blog",
            description:
              "Editorial content on SEO strategy, technical foundations, local visibility, and content-led growth.",
            path: "/blog",
            items: blogPosts.map((post, index) => ({
              name: post.title,
              path: `/blog#post-${index + 1}`,
            })),
          }),
        ]}
      />
      <PageHero
        eyebrow="Insights"
        title="Search intelligence for founders, marketers, and in-house teams."
        description="The blog is designed as a future growth asset for sayseo.com. These placeholder articles show the editorial direction, information architecture, and internal-linking opportunities the site is ready to support."
        highlights={[
          "Commercial SEO strategy",
          "Technical audits and implementation",
          "Regional market insight for UK and India",
        ]}
      />

      <section className="section-space">
        <Container className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article key={post.title} id={`post-${blogPosts.indexOf(post) + 1}`} className="surface p-8 md:p-10">
              <p className="eyebrow">{post.category}</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-slate-950">
                {post.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{post.excerpt}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm uppercase tracking-[0.18em] text-slate-500">
                <span>{post.readTime}</span>
                <span>{post.audience}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/services" variant="secondary" className="px-4 py-2 text-xs">
                  Related services
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" className="px-0 py-0 text-xs uppercase tracking-[0.18em]">
                  Talk through this challenge
                </ButtonLink>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container className="surface p-8 md:p-12">
          <p className="eyebrow">Editorial roadmap</p>
          <h2 className="section-title mt-4">Built to grow into category pages, case studies, and topical clusters.</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            The current structure is intentionally ready for future article templates, author pages, topic hubs, and long-form educational content.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact" variant="secondary">
              Plan a content-led SEO roadmap
            </ButtonLink>
          </div>
        </Container>
      </section>
      <InternalLinkPanel
        eyebrow="Cluster-ready routes"
        title="Support pages already in place for future topic clusters and commercial linking."
        links={[
          {
            href: "/services",
            title: "Services hub",
            description: "Link informational content to commercial SEO offers without forcing the sell.",
          },
          {
            href: "/case-studies",
            title: "Case studies",
            description: "Connect strategic education to proof-oriented growth stories as authority builds.",
          },
          {
            href: "/uk-seo-services",
            title: "Regional landing pages",
            description: "Support future UK and India topic clusters with region-aware intent pages.",
          },
        ]}
      />
    </>
  );
}
