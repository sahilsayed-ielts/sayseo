import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { trustSignalsExtended } from "@/content/site";

export function TrustEvidence() {
  return (
    <section className="section-space">
      <Container className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="surface p-8 md:p-10">
          <p className="eyebrow">Trust and proof</p>
          <h2 className="section-title mt-4">
            Built to earn confidence before a buyer ever gets on a call.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Strong SEO consultancies reduce uncertainty before they try to sell anything.
            That means clearer scope, grounded expectations, and proof that speaks to
            commercial judgement rather than vanity metrics.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/case-studies">Review growth examples</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Discuss your brief
            </ButtonLink>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {trustSignalsExtended.map((item) => (
            <article key={item.title} className="surface-soft p-6">
              <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
