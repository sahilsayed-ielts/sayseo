'use client'

import { useState, useMemo } from 'react'

// ─── CTR table ────────────────────────────────────────────────────────────────

const CTR_TABLE: Record<number, number> = {
  1: 0.398, 2: 0.187, 3: 0.102, 4: 0.074, 5: 0.051,
  6: 0.040, 7: 0.031, 8: 0.026, 9: 0.022, 10: 0.020,
}

function getCTR(position: number): number {
  if (position <= 0) return 0
  if (position <= 10) return CTR_TABLE[position] ?? 0.02
  if (position <= 20) return 0.008
  if (position <= 30) return 0.004
  return 0.002
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  return n.toLocaleString('en-GB', { maximumFractionDigits: decimals })
}

function fmtGBP(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}K`
  return `£${Math.round(n).toLocaleString('en-GB')}`
}

// ─── Slider ───────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format?: (v: number) => string
  hint?: string
}

function Slider({ label, value, onChange, min, max, step, format, hint }: SliderProps) {
  const display = format ? format(value) : String(value)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-600">{label}</label>
        <span className="text-sm font-extrabold text-emerald-700">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
      />
      {hint && <p className="text-[0.65rem] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  label, value, sub, highlight, positive,
}: {
  label: string; value: string; sub?: string; highlight?: boolean; positive?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 text-center ${highlight ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
      <p className={`text-xl font-extrabold mb-0.5 ${highlight ? 'text-emerald-700' : positive === true ? 'text-emerald-700' : positive === false ? 'text-red-500' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-[0.6rem] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SeoRoiClient() {
  const [searchVolume, setSearchVolume] = useState(5000)
  const [currentPos, setCurrentPos] = useState(15)
  const [targetPos, setTargetPos] = useState(3)
  const [convRate, setConvRate] = useState(2)
  const [orderValue, setOrderValue] = useState(150)
  const [seoCost, setSeoCost] = useState(2000)

  const calc = useMemo(() => {
    const currentCTR = getCTR(currentPos)
    const targetCTR = getCTR(targetPos)

    const currentTraffic = Math.round(searchVolume * currentCTR)
    const targetTraffic = Math.round(searchVolume * targetCTR)
    const trafficIncrease = targetTraffic - currentTraffic

    const cvr = convRate / 100
    const currentRevenue = currentTraffic * cvr * orderValue
    const targetRevenue = targetTraffic * cvr * orderValue
    const revenueIncrease = targetRevenue - currentRevenue

    const currentConversions = currentTraffic * cvr
    const targetConversions = targetTraffic * cvr
    const conversionIncrease = targetConversions - currentConversions

    const monthlyROI = seoCost > 0 ? ((revenueIncrease - seoCost) / seoCost) * 100 : 0
    const annualROI = seoCost > 0 ? (((revenueIncrease * 12) - (seoCost * 12)) / (seoCost * 12)) * 100 : 0
    const paybackMonths = revenueIncrease > 0 ? Math.ceil(seoCost / revenueIncrease) : null

    const annualTrafficIncrease = trafficIncrease * 12
    const annualRevenueIncrease = revenueIncrease * 12

    return {
      currentCTR, targetCTR,
      currentTraffic, targetTraffic, trafficIncrease,
      currentRevenue, targetRevenue, revenueIncrease,
      currentConversions, targetConversions, conversionIncrease,
      monthlyROI, annualROI, paybackMonths,
      annualTrafficIncrease, annualRevenueIncrease,
    }
  }, [searchVolume, currentPos, targetPos, convRate, orderValue, seoCost])

  const roiPositive = calc.monthlyROI >= 0

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Inputs ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Your numbers</h2>

            <Slider
              label="Monthly search volume"
              value={searchVolume}
              onChange={setSearchVolume}
              min={100} max={100000} step={100}
              format={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)}
              hint="Monthly searches for your target keyword"
            />

            <div className="grid grid-cols-2 gap-4">
              <Slider
                label="Current position"
                value={currentPos}
                onChange={setCurrentPos}
                min={1} max={50} step={1}
                format={(v) => `#${v}`}
                hint={`CTR: ${(getCTR(currentPos) * 100).toFixed(1)}%`}
              />
              <Slider
                label="Target position"
                value={targetPos}
                onChange={(v) => setTargetPos(Math.min(v, currentPos - 1))}
                min={1} max={Math.max(currentPos - 1, 1)} step={1}
                format={(v) => `#${v}`}
                hint={`CTR: ${(getCTR(targetPos) * 100).toFixed(1)}%`}
              />
            </div>

            <Slider
              label="Conversion rate"
              value={convRate}
              onChange={setConvRate}
              min={0.1} max={20} step={0.1}
              format={(v) => `${v.toFixed(1)}%`}
              hint="% of organic visitors who convert"
            />

            <Slider
              label="Average conversion value"
              value={orderValue}
              onChange={setOrderValue}
              min={1} max={10000} step={1}
              format={(v) => `£${v.toLocaleString('en-GB')}`}
              hint="Revenue per sale, lead, or sign-up"
            />

            <Slider
              label="Monthly SEO investment"
              value={seoCost}
              onChange={setSeoCost}
              min={0} max={20000} step={100}
              format={(v) => v === 0 ? '£0' : `£${v.toLocaleString('en-GB')}`}
              hint="Agency fees + tools + content costs"
            />
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Before / After traffic */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-5">
              Traffic projection
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-2xl font-extrabold text-gray-900">{fmt(calc.currentTraffic)}</p>
                <p className="text-xs text-gray-500 mt-1">Current monthly visits</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">Position #{currentPos} · {(calc.currentCTR * 100).toFixed(1)}% CTR</p>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-center">
                  <div className="text-emerald-600 text-xl font-extrabold">+{fmt(calc.trafficIncrease)}</div>
                  <div className="text-xs text-gray-400">additional</div>
                  <div className="text-xs text-gray-400">visits/mo</div>
                </div>
              </div>
              <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-2xl font-extrabold text-emerald-700">{fmt(calc.targetTraffic)}</p>
                <p className="text-xs text-gray-600 mt-1">Target monthly visits</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">Position #{targetPos} · {(calc.targetCTR * 100).toFixed(1)}% CTR</p>
              </div>
            </div>
          </div>

          {/* Revenue projection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-5">
              Monthly revenue projection
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-2xl font-extrabold text-gray-900">{fmtGBP(calc.currentRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Current monthly revenue</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">{calc.currentConversions.toFixed(1)} conversions/mo</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-2xl font-extrabold text-emerald-700">{fmtGBP(calc.targetRevenue)}</p>
                <p className="text-xs text-gray-600 mt-1">Target monthly revenue</p>
                <p className="text-[0.6rem] text-gray-400 mt-0.5">{calc.targetConversions.toFixed(1)} conversions/mo</p>
              </div>
            </div>

            <div className="bg-emerald-700 rounded-xl p-4 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-wide opacity-80 mb-1">Revenue increase per month</p>
              <p className="text-3xl font-extrabold">{fmtGBP(calc.revenueIncrease)}</p>
              <p className="text-sm opacity-75 mt-0.5">{fmtGBP(calc.annualRevenueIncrease)} per year</p>
            </div>
          </div>

          {/* ROI metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard
              label="Monthly ROI"
              value={`${Math.round(calc.monthlyROI)}%`}
              sub="vs SEO investment"
              highlight={roiPositive && seoCost > 0}
              positive={roiPositive}
            />
            <ResultCard
              label="Annual ROI"
              value={`${Math.round(calc.annualROI)}%`}
              sub="12-month horizon"
              positive={calc.annualROI >= 0}
            />
            <ResultCard
              label="Payback period"
              value={calc.paybackMonths ? `${calc.paybackMonths} mo` : '—'}
              sub={calc.paybackMonths ? `months to break even` : seoCost === 0 ? 'No cost entered' : 'Revenue too low'}
            />
            <ResultCard
              label="Annual traffic gain"
              value={fmt(calc.annualTrafficIncrease)}
              sub="additional visits/year"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">Projections are estimates.</span> Actual results depend on competition, seasonality, SERP features, brand strength, and landing page performance. Use these figures as directional indicators for business case conversations, not as guaranteed outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
