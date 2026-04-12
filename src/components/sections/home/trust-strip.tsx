import { Container } from "@/components/ui/container";
import { trustStripItems } from "@/content/site";

export function TrustStrip() {
  return (
    <section className="-mt-6 pb-8">
      <Container className="surface grid gap-3 p-4 md:grid-cols-4 md:p-5">
        {trustStripItems.map((item) => (
          <article key={item.title} className="rounded-[1.5rem] border border-slate-200/70 bg-stone-50/80 px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {item.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </Container>
    </section>
  );
}
