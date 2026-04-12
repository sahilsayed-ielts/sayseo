import { ButtonLink } from "@/components/ui/button-link";
import { ServiceList } from "@/components/shared/service-list";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { services } from "@/content/services";

export function ServicesOverview() {
  return (
    <section className="section-space">
      <Container>
        <SectionHeading
          eyebrow="Services"
          title="Choose the SEO engagement that gets you to clearer priorities, stronger visibility, and better-fit enquiries."
          description="The offer stays focused on research, technical clarity, competitive insight, and senior consulting so buyers can choose the right engagement without wading through padded retainers or vague deliverables."
        />
        <div className="mt-12">
          <ServiceList services={services.slice(0, 6)} compact />
        </div>
        <div className="mt-8 surface-soft flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Not sure which service fits?
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base md:leading-8">
              Start with the business goal, current blockers, or the market you are
              prioritising. We will help you choose the most sensible first engagement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact">Tell us what you need</ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              Compare service options
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
