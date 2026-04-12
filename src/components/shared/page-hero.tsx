import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
};

export function PageHero({
  eyebrow,
  title,
  description,
  highlights,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 pt-18 pb-22 md:pt-28 md:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.13),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute inset-0 site-grid opacity-15" />
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-display text-[3.3rem] leading-[0.96] tracking-[-0.04em] text-slate-950 md:text-[5.6rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-[42rem] text-lg leading-[1.9] text-slate-600">{description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/contact">Book a strategy call</ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              Review services
            </ButtonLink>
          </div>
        </div>

        <div className="surface p-8 md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            What this page covers
          </p>
          <ul className="mt-6 space-y-4 text-base leading-8 text-slate-600">
            {highlights.map((item, index) => (
              <li
                key={item}
                className="grid grid-cols-[auto_1fr] gap-4 border-b border-slate-200/80 pb-4 last:border-b-0 last:pb-0"
              >
                <span className="pt-1 text-sm font-semibold text-teal-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 rounded-[1.5rem] bg-slate-950 px-5 py-5 text-stone-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
              Best for
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-300">
              Teams that want senior-level SEO direction, commercially sensible priorities,
              and a clearer path from visibility to qualified enquiry.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
