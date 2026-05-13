import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const applyResponseCookies: Array<(target: NextResponse) => void> = []

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const redirectBase =
      process.env.NODE_ENV !== 'development' && forwardedHost
        ? `https://${forwardedHost}`
        : origin
    let response = NextResponse.redirect(`${redirectBase}${next}`)

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
            cookiesToSet.forEach(({ name, value, options }) => {
              applyResponseCookies.push((target) => target.cookies.set(name, value, options))
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      let destination = next
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // New users (or those who haven't completed onboarding) go to /onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!profile?.onboarding_complete) {
          destination = '/onboarding'
        } else {
          const { data: oauthSite } = await supabase
            .from('connected_sites')
            .select('id')
            .eq('user_id', user.id)
            .not('access_token', 'is', null)
            .order('token_expiry', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (oauthSite) {
            destination = `/dashboard/${oauthSite.id}`
          } else {
            const { data: latestSite } = await supabase
              .from('connected_sites')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (latestSite) {
              destination = `/dashboard/${latestSite.id}`
            }
          }
        }
      }

      response = NextResponse.redirect(`${redirectBase}${destination}`)
      applyResponseCookies.forEach((applyCookie) => applyCookie(response))
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
