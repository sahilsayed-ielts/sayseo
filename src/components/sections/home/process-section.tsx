import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/content/site";

export function ProcessSection() {
  return (
    <section className="section-space border-y border-slate-200/80 bg-white/55">
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="A buying and delivery process designed to reduce uncertainty early."
          description="The aim is to help your team understand fit, scope, and priorities quickly, then move into work that is structured enough to implement and defend internally."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="surface relative overflow-hidden p-7">
              <div className="absolute right-5 top-4 font-display text-6xl leading-none text-slate-100">
                {index + 1}
              </div>
              <p className="relative text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step {index + 1}
              </p>
              <h3 className="relative mt-5 text-2xl font-semibold text-slate-950">{step.title}</h3>
              <p className="relative mt-4 text-base leading-8 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
