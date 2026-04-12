import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { siteHighlights } from "@/content/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-stone-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.2),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(250,250,249,0.08),transparent_18%),linear-gradient(180deg,rgba(13,24,48,0.96)_0%,rgba(15,23,42,1)_100%)]" />
      <div className="absolute inset-0 site-grid opacity-25" />
      <Container className="relative grid min-h-[calc(100svh-6.25rem)] items-center gap-14 py-18 md:py-20 lg:grid-cols-[1fr_0.92fr]">
        <div>
          <p className="fade-in-up text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-300">
            Senior-led SEO consultancy for UK and India
          </p>
          <h1 className="fade-in-up-delay mt-6 max-w-[13ch] font-display text-[3.7rem] leading-[0.92] tracking-[-0.05em] md:text-[6.6rem]">
            Turn search into better-fit enquiries with clearer SEO direction.
          </h1>
          <p className="fade-in-up-delay-2 mt-6 max-w-[41rem] text-lg leading-[1.9] text-stone-300">
            sayseo.com helps ambitious businesses across the UK and India build a more
            commercially useful search channel through keyword research, competitor
            analysis, technical SEO audits, local growth planning, and senior consulting
            support.
          </p>
          <div className="fade-in-up-delay-2 mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/contact" variant="accent">
              Book a strategy call
            </ButtonLink>
            <ButtonLink href="/services" variant="dark-secondary">
              Review services
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-[40rem] text-sm leading-7 text-stone-400">
            Direct senior input from first brief to final prioritisation, with operating
            context across London, the wider UK, Bengaluru, and India-focused growth
            campaigns.
          </p>
          <p className="mt-3 max-w-[40rem] text-sm leading-7 text-stone-400">
            Best for founder-led businesses, in-house marketing teams, and service brands
            that need clearer SEO priorities before committing bigger budgets.
          </p>
          <div className="mt-10 grid gap-4 text-sm leading-7 text-stone-300 sm:grid-cols-3">
            {siteHighlights.map((item) => (
              <p key={item} className="border-t border-white/10 pt-4">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="relative h-[430px] md:h-[520px]">
          <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_30px_100px_rgba(15,23,42,0.35)] backdrop-blur-sm" />
          <div className="glow-ring absolute left-1/2 top-[46%] h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/30 md:h-[24rem] md:w-[24rem]" />
          <div className="absolute left-1/2 top-[46%] h-[11rem] w-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/5 backdrop-blur md:h-[15rem] md:w-[15rem]" />
          <div className="absolute left-6 top-6 z-20 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-teal-200">
            Search demand mapping
          </div>
          <div className="float-slow absolute right-8 top-14 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-stone-200">
            London service leads
          </div>
          <div className="float-slow absolute left-8 top-24 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-stone-200 [animation-delay:1.4s]">
            Bengaluru growth ops
          </div>
          <div className="absolute bottom-8 left-8 right-8 z-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold">6</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                Core SEO disciplines
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold">2</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                Priority markets
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold">1</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                Senior consultant team
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
