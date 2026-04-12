import Link from "next/link";
import type { Service } from "@/content/services";

type ServiceListProps = {
  services: Service[];
  compact?: boolean;
};

export function ServiceList({ services, compact = false }: ServiceListProps) {
  return (
    <div className="grid gap-5">
      {services.map((service, index) => (
        <article
          key={service.slug}
          className="group surface grid gap-6 p-8 transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(15,23,42,0.12)] md:grid-cols-[0.16fr_0.5fr_0.34fr] md:items-start md:p-9"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </p>
          <div>
            <h3 className="font-display text-[2.3rem] leading-[1.02] tracking-[-0.03em] text-slate-950">
              {service.title}
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{service.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {service.outcomes.map((outcome) => (
                <span
                  key={outcome}
                  className="rounded-full border border-slate-200/90 bg-stone-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {outcome}
                </span>
              ))}
            </div>
            <div className="mt-7">
              {service.detailPage ? (
                <Link
                  href={`/services/${service.slug}`}
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 transition group-hover:text-teal-800"
                >
                  Review scope and deliverables
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 transition group-hover:text-teal-800"
                >
                  Scope this within an engagement
                </Link>
              )}
            </div>
          </div>
          <div className={compact ? "grid gap-3" : "grid gap-4"}>
            {(compact ? service.deliverables.slice(0, 3) : service.deliverables).map((item) => (
              <p
                key={item}
                className="border-b border-slate-200/80 pb-4 text-sm leading-7 text-slate-600 last:border-b-0 last:pb-0"
              >
                {item}
              </p>
            ))}
            {!compact ? (
              <p className="pt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Typical timeline: {service.timeline}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
