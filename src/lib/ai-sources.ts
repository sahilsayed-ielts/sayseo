export const AI_REFERRAL_DOMAINS = [
  'chatgpt.com',
  'chat.openai.com',
  'perplexity.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'claude.ai',
  'you.com',
  'phind.com',
  'bard.google.com',
] as const

export type AiReferralDomain = (typeof AI_REFERRAL_DOMAINS)[number]
