import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If setup is not complete, redirect to setup page
  if (
    !supabaseUrl || 
    !supabaseKey || 
    supabaseUrl.includes('your-supabase-url') ||
    supabaseKey.includes('your-supabase')
  ) {
    if (!request.nextUrl.pathname.startsWith('/setup-required')) {
      const url = request.nextUrl.clone();
      url.pathname = '/setup-required';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/faculty') &&
      !request.nextUrl.pathname.startsWith('/setup-required')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // If there's an error with Supabase, redirect to setup
    if (!request.nextUrl.pathname.startsWith('/setup-required')) {
      const url = request.nextUrl.clone();
      url.pathname = '/setup-required';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}
