import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export function CtaSection() {
  return (
    <section className="section-space">
      <Container>
        <div className="surface-dark overflow-hidden px-8 py-12 md:px-12 md:py-16">
          <p className="eyebrow text-teal-300">Next step</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <h2 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] md:text-6xl">
                If SEO already matters to the business, the next step should be clearer than it is today.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300">
                We’ll review the current position, identify the highest-value search opportunities,
                and recommend the most sensible scope, whether that means a focused audit, a research
                package, regional SEO planning, or ongoing strategic support.
              </p>
              <div className="mt-8 flex flex-wrap gap-6 text-sm uppercase tracking-[0.18em] text-stone-400">
                <span>Response within one business day</span>
                <span>UK and India focus</span>
                <span>Projects and retainers</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <ButtonLink href="/contact" variant="accent">
                Book a strategy call
              </ButtonLink>
              <ButtonLink href="/about" variant="dark-secondary">
                See how we work
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
