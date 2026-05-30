'use client'

import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SchemaTab = 'faq' | 'howto' | 'article' | 'local' | 'breadcrumb'

interface FAQItem { id: string; question: string; answer: string }
interface HowToStep { id: string; name: string; text: string }
interface BreadcrumbItem { id: string; name: string; url: string }

const genId = () => Math.random().toString(36).slice(2, 9)

// ─── JSON-LD builders ─────────────────────────────────────────────────────────

function buildFAQ(items: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.filter((i) => i.question && i.answer).map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}

function buildHowTo(
  name: string, description: string, totalTime: string, steps: HowToStep[],
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(description ? { description } : {}),
    ...(totalTime ? { totalTime: `PT${totalTime}M` } : {}),
    step: steps.filter((s) => s.name || s.text).map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name || `Step ${i + 1}`,
      text: s.text,
    })),
  }
}

function buildArticle(
  headline: string, description: string, imageUrl: string,
  authorName: string, datePublished: string, dateModified: string,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    author: { '@type': 'Person', name: authorName || 'Unknown' },
    publisher: { '@type': 'Organization', name: 'SaySEO', url: 'https://sayseo.co.uk' },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  }
}

function buildLocalBusiness(
  name: string, businessType: string, streetAddress: string, city: string,
  postcode: string, country: string, telephone: string, website: string,
  mondayFriday: string, saturday: string, sunday: string,
): object {
  const hours = []
  if (mondayFriday) hours.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: mondayFriday.split('-')[0]?.trim(), closes: mondayFriday.split('-')[1]?.trim() })
  if (saturday) hours.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: saturday.split('-')[0]?.trim(), closes: saturday.split('-')[1]?.trim() })
  if (sunday) hours.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: sunday.split('-')[0]?.trim(), closes: sunday.split('-')[1]?.trim() })

  return {
    '@context': 'https://schema.org',
    '@type': businessType || 'LocalBusiness',
    name,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: city,
      postalCode: postcode,
      addressCountry: country || 'GB',
    },
    ...(telephone ? { telephone } : {}),
    ...(website ? { url: website } : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
  }
}

function buildBreadcrumb(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.filter((i) => i.name && i.url).map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.name,
      item: i.url,
    })),
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
      />
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors shrink-0"
      aria-label="Remove"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </button>
  )
}

// ─── Tab forms ────────────────────────────────────────────────────────────────

function FAQForm({ items, setItems }: { items: FAQItem[]; setItems: (v: FAQItem[]) => void }) {
  const add = () => setItems([...items, { id: genId(), question: '', answer: '' }])
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id))
  const update = (id: string, key: 'question' | 'answer', val: string) =>
    setItems(items.map((i) => i.id === id ? { ...i, [key]: val } : i))

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Q&A {idx + 1}</span>
            {items.length > 1 && <RemoveButton onClick={() => remove(item.id)} />}
          </div>
          <div className="space-y-3">
            <Input label="Question" value={item.question} onChange={(v) => update(item.id, 'question', v)} placeholder="What is your most common question?" required />
            <Textarea label="Answer" value={item.answer} onChange={(v) => update(item.id, 'answer', v)} placeholder="Provide a clear, complete answer to the question above." rows={2} />
          </div>
        </div>
      ))}
      <AddButton onClick={add} label="Add another Q&A" />
    </div>
  )
}

function HowToForm({
  name, setName, desc, setDesc, time, setTime, steps, setSteps,
}: {
  name: string; setName: (v: string) => void; desc: string; setDesc: (v: string) => void;
  time: string; setTime: (v: string) => void; steps: HowToStep[]; setSteps: (v: HowToStep[]) => void;
}) {
  const addStep = () => setSteps([...steps, { id: genId(), name: '', text: '' }])
  const removeStep = (id: string) => setSteps(steps.filter((s) => s.id !== id))
  const updateStep = (id: string, key: 'name' | 'text', val: string) =>
    setSteps(steps.map((s) => s.id === id ? { ...s, [key]: val } : s))

  return (
    <div className="space-y-4">
      <Input label="Guide title" value={name} onChange={setName} placeholder="How to Set Up Google Search Console" required />
      <Textarea label="Description" value={desc} onChange={setDesc} placeholder="A brief description of what this guide covers." rows={2} />
      <Input label="Total time (minutes)" value={time} onChange={setTime} placeholder="30" type="number" />

      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-2">Steps</p>
      {steps.map((step, idx) => (
        <div key={step.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Step {idx + 1}</span>
            {steps.length > 1 && <RemoveButton onClick={() => removeStep(step.id)} />}
          </div>
          <div className="space-y-3">
            <Input label="Step name" value={step.name} onChange={(v) => updateStep(step.id, 'name', v)} placeholder="Install the Search Console plugin" />
            <Textarea label="Step instructions" value={step.text} onChange={(v) => updateStep(step.id, 'text', v)} placeholder="Detailed instructions for this step..." rows={2} />
          </div>
        </div>
      ))}
      <AddButton onClick={addStep} label="Add step" />
    </div>
  )
}

function ArticleForm({
  headline, setHeadline, desc, setDesc, image, setImage,
  author, setAuthor, pub, setPub, mod, setMod,
}: {
  headline: string; setHeadline: (v: string) => void; desc: string; setDesc: (v: string) => void;
  image: string; setImage: (v: string) => void; author: string; setAuthor: (v: string) => void;
  pub: string; setPub: (v: string) => void; mod: string; setMod: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Input label="Article headline" value={headline} onChange={setHeadline} placeholder="Best SEO Tools for Agencies in 2026" required />
      <Textarea label="Description" value={desc} onChange={setDesc} placeholder="A short description of the article (used in search snippets)." rows={2} />
      <Input label="Featured image URL" value={image} onChange={setImage} placeholder="https://yoursite.com/images/article-hero.jpg" />
      <Input label="Author name" value={author} onChange={setAuthor} placeholder="Jane Smith" required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Date published" value={pub} onChange={setPub} placeholder="2026-05-01" type="date" />
        <Input label="Date modified" value={mod} onChange={setMod} placeholder="2026-05-30" type="date" />
      </div>
    </div>
  )
}

function LocalBusinessForm({
  name, setName, btype, setBtype, street, setStreet, city, setCity,
  postcode, setPostcode, country, setCountry, phone, setPhone, website, setWebsite,
  mf, setMf, sat, setSat, sun, setSun,
}: {
  name: string; setName: (v: string) => void; btype: string; setBtype: (v: string) => void;
  street: string; setStreet: (v: string) => void; city: string; setCity: (v: string) => void;
  postcode: string; setPostcode: (v: string) => void; country: string; setCountry: (v: string) => void;
  phone: string; setPhone: (v: string) => void; website: string; setWebsite: (v: string) => void;
  mf: string; setMf: (v: string) => void; sat: string; setSat: (v: string) => void; sun: string; setSun: (v: string) => void;
}) {
  const types = ['LocalBusiness','Agency','AccountingService','AutoRepair','Bakery','BarOrPub','Dentist','DryCleaningOrLaundry','FinancialService','FoodEstablishment','GeneralContractor','GroceryStore','GymOrFitnessCenter','HairSalon','HomeAndConstructionBusiness','HotelOrMotel','LegalService','Library','MedicalClinic','NailSalon','Optician','Pharmacy','Plumber','RealEstateAgent','Restaurant','School','SportsActivityLocation','Store','Veterinary']

  return (
    <div className="space-y-4">
      <Input label="Business name" value={name} onChange={setName} placeholder="Acme Digital Marketing Ltd" required />
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business type</label>
        <select
          value={btype}
          onChange={(e) => setBtype(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
        >
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <Input label="Street address" value={street} onChange={setStreet} placeholder="123 High Street" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City / Town" value={city} onChange={setCity} placeholder="London" />
        <Input label="Postcode" value={postcode} onChange={setPostcode} placeholder="EC1A 1BB" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country code" value={country} onChange={setCountry} placeholder="GB" />
        <Input label="Phone" value={phone} onChange={setPhone} placeholder="+44 20 7123 4567" />
      </div>
      <Input label="Website URL" value={website} onChange={setWebsite} placeholder="https://acmedigital.co.uk" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-2">Opening hours (format: 09:00 - 17:30)</p>
      <div className="space-y-3">
        <Input label="Mon–Fri" value={mf} onChange={setMf} placeholder="09:00 - 17:30" />
        <Input label="Saturday" value={sat} onChange={setSat} placeholder="10:00 - 14:00" />
        <Input label="Sunday" value={sun} onChange={setSun} placeholder="Closed" />
      </div>
    </div>
  )
}

function BreadcrumbForm({ items, setItems }: { items: BreadcrumbItem[]; setItems: (v: BreadcrumbItem[]) => void }) {
  const add = () => setItems([...items, { id: genId(), name: '', url: '' }])
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id))
  const update = (id: string, key: 'name' | 'url', val: string) =>
    setItems(items.map((i) => i.id === id ? { ...i, [key]: val } : i))

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
            {idx + 1}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Input label="Name" value={item.name} onChange={(v) => update(item.id, 'name', v)} placeholder="Blog" />
            <Input label="URL" value={item.url} onChange={(v) => update(item.id, 'url', v)} placeholder="https://yoursite.com/blog" />
          </div>
          {items.length > 1 && <RemoveButton onClick={() => remove(item.id)} />}
        </div>
      ))}
      <AddButton onClick={add} label="Add breadcrumb" />
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SchemaGeneratorClient() {
  const [tab, setTab] = useState<SchemaTab>('faq')
  const [copied, setCopied] = useState(false)

  // FAQ state
  const [faqItems, setFaqItems] = useState<FAQItem[]>([{ id: genId(), question: '', answer: '' }])

  // HowTo state
  const [howtoName, setHowtoName] = useState('')
  const [howtoDesc, setHowtoDesc] = useState('')
  const [howtoTime, setHowtoTime] = useState('')
  const [howtoSteps, setHowtoSteps] = useState<HowToStep[]>([{ id: genId(), name: '', text: '' }])

  // Article state
  const [artHeadline, setArtHeadline] = useState('')
  const [artDesc, setArtDesc] = useState('')
  const [artImage, setArtImage] = useState('')
  const [artAuthor, setArtAuthor] = useState('')
  const [artPub, setArtPub] = useState('')
  const [artMod, setArtMod] = useState('')

  // Local state
  const [locName, setLocName] = useState('')
  const [locType, setLocType] = useState('LocalBusiness')
  const [locStreet, setLocStreet] = useState('')
  const [locCity, setLocCity] = useState('')
  const [locPostcode, setLocPostcode] = useState('')
  const [locCountry, setLocCountry] = useState('GB')
  const [locPhone, setLocPhone] = useState('')
  const [locWebsite, setLocWebsite] = useState('')
  const [locMF, setLocMF] = useState('')
  const [locSat, setLocSat] = useState('')
  const [locSun, setLocSun] = useState('')

  // Breadcrumb state
  const [bcItems, setBcItems] = useState<BreadcrumbItem[]>([
    { id: genId(), name: 'Home', url: 'https://yoursite.com' },
    { id: genId(), name: '', url: '' },
  ])

  const getSchema = useCallback((): object => {
    switch (tab) {
      case 'faq': return buildFAQ(faqItems)
      case 'howto': return buildHowTo(howtoName, howtoDesc, howtoTime, howtoSteps)
      case 'article': return buildArticle(artHeadline, artDesc, artImage, artAuthor, artPub, artMod)
      case 'local': return buildLocalBusiness(locName, locType, locStreet, locCity, locPostcode, locCountry, locPhone, locWebsite, locMF, locSat, locSun)
      case 'breadcrumb': return buildBreadcrumb(bcItems)
    }
  }, [tab, faqItems, howtoName, howtoDesc, howtoTime, howtoSteps, artHeadline, artDesc, artImage, artAuthor, artPub, artMod, locName, locType, locStreet, locCity, locPostcode, locCountry, locPhone, locWebsite, locMF, locSat, locSun, bcItems])

  const schemaJson = JSON.stringify(getSchema(), null, 2)
  const output = `<script type="application/ld+json">\n${schemaJson}\n</script>`

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: Array<{ id: SchemaTab; label: string; emoji: string }> = [
    { id: 'faq', label: 'FAQ', emoji: '❓' },
    { id: 'howto', label: 'HowTo', emoji: '📋' },
    { id: 'article', label: 'Article', emoji: '📰' },
    { id: 'local', label: 'LocalBusiness', emoji: '📍' },
    { id: 'breadcrumb', label: 'BreadcrumbList', emoji: '🍞' },
  ]

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-emerald-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-5">
            {tabs.find((t) => t.id === tab)?.emoji} {tabs.find((t) => t.id === tab)?.label} Schema
          </h2>
          {tab === 'faq' && <FAQForm items={faqItems} setItems={setFaqItems} />}
          {tab === 'howto' && (
            <HowToForm
              name={howtoName} setName={setHowtoName} desc={howtoDesc} setDesc={setHowtoDesc}
              time={howtoTime} setTime={setHowtoTime} steps={howtoSteps} setSteps={setHowtoSteps}
            />
          )}
          {tab === 'article' && (
            <ArticleForm
              headline={artHeadline} setHeadline={setArtHeadline} desc={artDesc} setDesc={setArtDesc}
              image={artImage} setImage={setArtImage} author={artAuthor} setAuthor={setArtAuthor}
              pub={artPub} setPub={setArtPub} mod={artMod} setMod={setArtMod}
            />
          )}
          {tab === 'local' && (
            <LocalBusinessForm
              name={locName} setName={setLocName} btype={locType} setBtype={setLocType}
              street={locStreet} setStreet={setLocStreet} city={locCity} setCity={setLocCity}
              postcode={locPostcode} setPostcode={setLocPostcode} country={locCountry} setCountry={setLocCountry}
              phone={locPhone} setPhone={setLocPhone} website={locWebsite} setWebsite={setLocWebsite}
              mf={locMF} setMf={setLocMF} sat={locSat} setSat={setLocSat} sun={locSun} setSun={setLocSun}
            />
          )}
          {tab === 'breadcrumb' && <BreadcrumbForm items={bcItems} setItems={setBcItems} />}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400 ml-2 font-mono">JSON-LD output</span>
              </div>
              <button
                onClick={copy}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy code
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs leading-relaxed text-gray-700 overflow-auto max-h-96 bg-white font-mono whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">How to add this to your page</p>
            <ol className="space-y-2 text-sm text-emerald-800 list-none">
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">1.</span> Copy the code above</li>
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">2.</span> Paste it inside the <code className="bg-emerald-100 px-1 rounded text-xs">&lt;head&gt;</code> of your page, or before <code className="bg-emerald-100 px-1 rounded text-xs">&lt;/body&gt;</code></li>
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">3.</span> Test with Google&apos;s Rich Results Test after publishing</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
