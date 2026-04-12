"use client";

import { FormEvent, useState } from "react";
import { siteConfig } from "@/content/site";

type FormState = {
  name: string;
  email: string;
  company: string;
  website: string;
  market: string;
  service: string;
  goals: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  website: "",
  market: "UK",
  service: "Technical SEO audit",
  goals: "",
};

const confidencePoints = [
  "Most new briefs receive a direct reply within one business day.",
  "Briefs are reviewed by a senior consultant, not routed into a generic sales queue.",
  "If there is a better-fit service or a smaller first step, we will say so.",
  "You can use the form for project work, retainers, or a scoping conversation.",
];

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `New SEO enquiry from ${form.company || form.name || "sayseo.com visitor"}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Company: ${form.company}`,
        `Website: ${form.website}`,
        `Primary market: ${form.market}`,
        `Interested service: ${form.service}`,
        "",
        "Goals / context:",
        form.goals,
      ].join("\n"),
    );

    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setStatus("Your email app should open with a prefilled SEO brief.");
  };

  return (
    <form onSubmit={handleSubmit} className="surface p-8 md:p-10">
      <p className="eyebrow">Project brief</p>
      <h2 className="mt-4 font-display text-4xl leading-tight text-slate-950">
        Share the context that will make the first conversation genuinely useful.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
        The goal is not to force a sale. It is to understand whether keyword research,
        competitor analysis, a technical audit, local SEO support, or broader consulting
        is the right next move for the business.
      </p>
      <div className="mt-6 inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">
        Typical response: within one business day
      </div>
      <div className="mt-6 grid gap-3">
        {confidencePoints.map((point) => (
          <p
            key={point}
            className="rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm leading-7 text-slate-600"
          >
            {point}
          </p>
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Company
          <input
            value={form.company}
            onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Website
          <input
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Primary market
          <select
            value={form.market}
            onChange={(event) => setForm((current) => ({ ...current, market: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          >
            <option>UK</option>
            <option>India</option>
            <option>Both UK and India</option>
            <option>International</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Priority service
          <select
            value={form.service}
            onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          >
            <option>Keyword research</option>
            <option>Competitor analysis</option>
            <option>Technical SEO audit</option>
            <option>On-page SEO</option>
            <option>Local SEO</option>
            <option>Content strategy</option>
            <option>Consulting</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">
          What should SEO improve over the next 6 to 12 months?
          <textarea
            required
            rows={6}
            value={form.goals}
            onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
            className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,118,110,0.18)] transition hover:-translate-y-0.5 hover:bg-teal-800"
        >
          Open your enquiry draft
        </button>
        <p className="text-sm text-slate-500">
          {status ||
            "This opens a prefilled email in your default mail app so you can send the brief straight away."}
        </p>
      </div>
    </form>
  );
}
