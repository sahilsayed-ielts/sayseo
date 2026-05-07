import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Build the redirect response first so setAll can attach cookies to it
    const forwardedHost = request.headers.get('x-forwarded-host')
    const redirectBase =
      process.env.NODE_ENV !== 'development' && forwardedHost
        ? `https://${forwardedHost}`
        : origin
    const response = NextResponse.redirect(`${redirectBase}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Read PKCE code verifier from the incoming request cookies
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Write session cookies onto the redirect response
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
