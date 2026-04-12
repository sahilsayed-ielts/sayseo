import Link from "next/link";

type InternalLink = {
  href: string;
  title: string;
  description: string;
};

type InternalLinkPanelProps = {
  eyebrow: string;
  title: string;
  links: InternalLink[];
};

export function InternalLinkPanel({
  eyebrow,
  title,
  links,
}: InternalLinkPanelProps) {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="surface p-8 md:p-12">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4">{title}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="surface-soft block p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
              >
                <h3 className="text-xl font-semibold text-slate-950">{link.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
