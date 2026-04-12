import type { FAQItem } from "@/content/site";

type FaqListProps = {
  items: FAQItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <details key={item.question} className="surface group p-6 md:p-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-slate-700">
            <span>{item.question}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-stone-50 text-2xl leading-none text-slate-400 transition group-open:rotate-45 group-open:text-teal-700">
              +
            </span>
          </summary>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
