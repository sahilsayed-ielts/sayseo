import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { detailServices } from "@/content/services";
import { navigation, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-10 overflow-hidden border-t border-slate-200/80 bg-slate-950 text-stone-200">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-6 lg:px-8">
        <div className="surface-dark grid gap-10 px-8 py-10 md:px-10 md:py-12 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-teal-300">
              sayseo.com
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
              Need clearer SEO priorities and a plan your team can trust?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
              Senior-led SEO consulting for UK and India businesses that need stronger
              enquiry quality, sharper execution priorities, and commercially credible
              search planning.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <ButtonLink href="/contact" variant="accent">
              Book a strategy call
            </ButtonLink>
            <ButtonLink href="/services" variant="dark-secondary">
              Explore services
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.7fr_0.7fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-300">
            Contact
          </p>
          <div className="mt-5 space-y-3 text-base leading-8 text-stone-300">
            <p>
              <a className="transition hover:text-white" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </p>
            <p>
              <a className="transition hover:text-white" href={`tel:${siteConfig.phoneHref}`}>
                {siteConfig.phone}
              </a>
            </p>
            <p className="pt-2 text-sm uppercase tracking-[0.18em] text-stone-400">
              London and Bengaluru
            </p>
            <p className="max-w-sm text-sm leading-7 text-stone-400">
              Independent SEO consultancy for service brands, B2B businesses, and local
              growth teams working across UK-first, India-first, and cross-market briefs.
            </p>
            <p className="max-w-sm text-sm leading-7 text-stone-400">
              Typical response time for new enquiries: within one business day.
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
            Explore
          </p>
          <ul className="mt-5 space-y-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="text-base text-stone-300 transition hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
            Core services
          </p>
          <ul className="mt-5 space-y-3">
            {detailServices.map((service) => (
              <li key={service.slug}>
                <Link
                  className="text-base text-stone-300 transition hover:text-white"
                  href={`/services/${service.slug}`}
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-400">
            Best fit
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-stone-300">
            <li>Founder-led service businesses</li>
            <li>In-house marketing teams needing senior SEO input</li>
            <li>B2B brands improving lead quality from search</li>
            <li>Local and multi-location growth campaigns</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-stone-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 sayseo.com. All rights reserved.</p>
          <p>Operating across London and Bengaluru for clients in the UK and India.</p>
        </div>
      </div>
    </footer>
  );
}
