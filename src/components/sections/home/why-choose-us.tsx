import { Container } from "@/components/ui/container";
import { whyChooseUs } from "@/content/site";

export function WhyChooseUs() {
  return (
    <section className="section-space">
      <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="surface-dark p-8 md:p-10">
          <p className="eyebrow text-teal-300">Why sayseo.com</p>
          <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
            Built for teams that want sharper judgement, not just more SEO output.
          </h2>
          <p className="mt-5 text-base leading-8 text-stone-300">
            The consultancy model is deliberately senior, commercially grounded, and
            calm in how it prioritises. That makes it easier for founders, marketers,
            and developers to move with confidence.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {whyChooseUs.map((item) => (
            <article key={item.title} className="surface-soft p-7">
              <h3 className="text-2xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
