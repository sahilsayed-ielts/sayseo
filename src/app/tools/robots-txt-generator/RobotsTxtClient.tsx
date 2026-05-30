'use client'

import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type RuleType = 'Allow' | 'Disallow'

interface Rule { id: string; type: RuleType; path: string }
interface AgentBlock { id: string; userAgent: string; crawlDelay?: string; rules: Rule[] }

const genId = () => Math.random().toString(36).slice(2, 9)

// ─── Presets ─────────────────────────────────────────────────────────────────

const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai',
  'CCBot', 'Google-Extended', 'PerplexityBot',
  'Bytespider', 'Meta-ExternalAgent', 'Amazonbot',
]

const PRESET_ALLOW_ALL: AgentBlock[] = [
  { id: genId(), userAgent: '*', crawlDelay: '', rules: [{ id: genId(), type: 'Allow', path: '/' }] },
]

const PRESET_BLOCK_PRIVATE: AgentBlock[] = [
  {
    id: genId(),
    userAgent: '*',
    crawlDelay: '',
    rules: [
      { id: genId(), type: 'Disallow', path: '/admin/' },
      { id: genId(), type: 'Disallow', path: '/private/' },
      { id: genId(), type: 'Disallow', path: '/checkout/' },
      { id: genId(), type: 'Disallow', path: '/account/' },
      { id: genId(), type: 'Disallow', path: '/wp-admin/' },
      { id: genId(), type: 'Disallow', path: '/dashboard/' },
    ],
  },
]

const PRESET_BLOCK_AI: AgentBlock[] = [
  { id: genId(), userAgent: '*', crawlDelay: '', rules: [{ id: genId(), type: 'Allow', path: '/' }] },
  ...AI_CRAWLERS.map((bot) => ({
    id: genId(),
    userAgent: bot,
    crawlDelay: '',
    rules: [{ id: genId(), type: 'Disallow' as RuleType, path: '/' }],
  })),
]

const PRESET_COMPREHENSIVE: AgentBlock[] = [
  {
    id: genId(),
    userAgent: '*',
    crawlDelay: '',
    rules: [
      { id: genId(), type: 'Disallow', path: '/admin/' },
      { id: genId(), type: 'Disallow', path: '/private/' },
      { id: genId(), type: 'Disallow', path: '/checkout/' },
      { id: genId(), type: 'Disallow', path: '/account/' },
    ],
  },
  ...AI_CRAWLERS.map((bot) => ({
    id: genId(),
    userAgent: bot,
    crawlDelay: '',
    rules: [{ id: genId(), type: 'Disallow' as RuleType, path: '/' }],
  })),
]

// ─── robots.txt builder ────────────────────────────────────────────────────────

function buildRobotsTxt(blocks: AgentBlock[], sitemap: string): string {
  const lines: string[] = []

  for (const block of blocks) {
    if (!block.userAgent) continue
    lines.push(`User-agent: ${block.userAgent}`)
    for (const rule of block.rules) {
      if (rule.path) lines.push(`${rule.type}: ${rule.path}`)
    }
    if (block.crawlDelay) lines.push(`Crawl-delay: ${block.crawlDelay}`)
    lines.push('')
  }

  if (sitemap.trim()) lines.push(`Sitemap: ${sitemap.trim()}`)

  return lines.join('\n').trim()
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RobotsTxtClient() {
  const [blocks, setBlocks] = useState<AgentBlock[]>(PRESET_ALLOW_ALL)
  const [sitemap, setSitemap] = useState('')
  const [copied, setCopied] = useState(false)
  const [activePreset, setActivePreset] = useState<string>('allow-all')

  const output = useMemo(() => buildRobotsTxt(blocks, sitemap), [blocks, sitemap])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (id: string) => {
    setActivePreset(id)
    if (id === 'allow-all') setBlocks(PRESET_ALLOW_ALL)
    if (id === 'block-private') setBlocks(PRESET_BLOCK_PRIVATE)
    if (id === 'block-ai') setBlocks(PRESET_BLOCK_AI)
    if (id === 'comprehensive') setBlocks(PRESET_COMPREHENSIVE)
    if (id === 'custom') setBlocks([{ id: genId(), userAgent: '', crawlDelay: '', rules: [{ id: genId(), type: 'Disallow', path: '' }] }])
  }

  // Block operations
  const addBlock = () => setBlocks([...blocks, { id: genId(), userAgent: '', crawlDelay: '', rules: [{ id: genId(), type: 'Disallow', path: '' }] }])
  const removeBlock = (id: string) => setBlocks(blocks.filter((b) => b.id !== id))
  const updateBlock = (id: string, field: 'userAgent' | 'crawlDelay', value: string) =>
    setBlocks(blocks.map((b) => b.id === id ? { ...b, [field]: value } : b))

  // Rule operations
  const addRule = (blockId: string) =>
    setBlocks(blocks.map((b) => b.id === blockId
      ? { ...b, rules: [...b.rules, { id: genId(), type: 'Disallow', path: '' }] }
      : b))
  const removeRule = (blockId: string, ruleId: string) =>
    setBlocks(blocks.map((b) => b.id === blockId
      ? { ...b, rules: b.rules.filter((r) => r.id !== ruleId) }
      : b))
  const updateRule = (blockId: string, ruleId: string, field: 'type' | 'path', value: string) =>
    setBlocks(blocks.map((b) => b.id === blockId
      ? { ...b, rules: b.rules.map((r) => r.id === ruleId ? { ...r, [field]: value } : r) }
      : b))

  const presets = [
    { id: 'allow-all', label: 'Allow All', icon: '✅', desc: 'Allow all crawlers full access' },
    { id: 'block-ai', label: 'Block AI Crawlers', icon: '🤖', desc: 'Block 10 AI training bots, allow search engines' },
    { id: 'block-private', label: 'Block Private Paths', icon: '🔒', desc: 'Block /admin/, /checkout/, /account/' },
    { id: 'comprehensive', label: 'Comprehensive', icon: '🛡️', desc: 'Block AI crawlers + private paths' },
    { id: 'custom', label: 'Custom', icon: '⚙️', desc: 'Start from scratch' },
  ]

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Preset selector */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500 mb-3">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`group flex flex-col items-start text-left px-4 py-3 rounded-xl border transition-all ${
                activePreset === p.id
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-base">{p.icon}</span>
                <span className="text-sm font-bold">{p.label}</span>
              </div>
              <span className={`text-[0.65rem] leading-snug ${activePreset === p.id ? 'text-white/70' : 'text-gray-400'}`}>
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">Crawler rules</h2>
            </div>

            <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
              {blocks.map((block, bi) => (
                <div key={block.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Block header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <input
                      type="text"
                      value={block.userAgent}
                      onChange={(e) => updateBlock(block.id, 'userAgent', e.target.value)}
                      placeholder="User-agent (e.g. * or GPTBot)"
                      className="flex-1 text-sm font-mono font-semibold text-gray-800 bg-transparent border-0 outline-none placeholder-gray-400 min-w-0"
                    />
                    {blocks.length > 1 && (
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors shrink-0"
                        aria-label="Remove block"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Rules */}
                  <div className="p-3 space-y-2">
                    {block.rules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2">
                        <select
                          value={rule.type}
                          onChange={(e) => updateRule(block.id, rule.id, 'type', e.target.value)}
                          className="text-xs font-bold rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-gray-700 shrink-0"
                        >
                          <option>Disallow</option>
                          <option>Allow</option>
                        </select>
                        <input
                          type="text"
                          value={rule.path}
                          onChange={(e) => updateRule(block.id, rule.id, 'path', e.target.value)}
                          placeholder="/path/"
                          className="flex-1 text-sm font-mono rounded-lg border border-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 placeholder-gray-400 min-w-0"
                        />
                        {block.rules.length > 1 && (
                          <button
                            onClick={() => removeRule(block.id, rule.id)}
                            className="p-1 text-gray-300 hover:text-red-400 shrink-0"
                            aria-label="Remove rule"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addRule(block.id)}
                      className="text-xs text-emerald-600 font-semibold hover:text-emerald-800 flex items-center gap-1 mt-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                      Add rule
                    </button>
                  </div>

                  {/* Crawl delay (optional) */}
                  <div className="px-3 pb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">Crawl-delay:</span>
                    <input
                      type="number"
                      value={block.crawlDelay || ''}
                      onChange={(e) => updateBlock(block.id, 'crawlDelay', e.target.value)}
                      placeholder="(optional, seconds)"
                      min={0}
                      className="flex-1 text-xs font-mono rounded-lg border border-gray-200 px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-600 placeholder-gray-300"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addBlock}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Add user-agent block
              </button>
            </div>
          </div>

          {/* Sitemap */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="sitemap-url">
              Sitemap URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="sitemap-url"
              type="url"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              placeholder="https://yoursite.com/sitemap.xml"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ── Preview ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-xs text-gray-400 ml-2 font-mono">robots.txt</span>
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
                    Copy file
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs leading-relaxed text-gray-700 overflow-auto max-h-[500px] bg-white font-mono whitespace-pre">
              {output || '# Empty — add some rules on the left'}
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">How to deploy this file</p>
            <ol className="space-y-2 text-sm text-emerald-800 list-none">
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">1.</span> Copy the file contents above</li>
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">2.</span> Save as <code className="bg-emerald-100 px-1 rounded text-xs">robots.txt</code> (no extension)</li>
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">3.</span> Upload to your website root: <code className="bg-emerald-100 px-1 rounded text-xs">yoursite.com/robots.txt</code></li>
              <li className="flex items-start gap-2"><span className="font-bold shrink-0">4.</span> Test in Google Search Console → Settings → Crawling</li>
            </ol>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xl font-extrabold text-gray-900">{blocks.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">User-agent blocks</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-xl font-extrabold text-gray-900">{blocks.reduce((sum, b) => sum + b.rules.length, 0)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total rules</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
