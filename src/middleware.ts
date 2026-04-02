// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';

export default withAuth(
  function middleware(req) {
    const url = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const userId = token?.id?.toString();

    // Routes qui nécessitent un ID
    const routesNeedingId = [
      { pattern: /^\/settings\/profile$/, redirect: () => `/settings/${userId}/profile` },
      { pattern: /^\/settings\/profile-settings$/, redirect: () => `/settings/${userId}/profile-settings` },
      // { pattern: /^\/users$/, redirect: () => `/users/${userId}` },
      // { pattern: /^\/users\/edit$/, redirect: () => `/users/${userId}/edit` },
      // { pattern: /^\/settings\/profile\/notification$/, redirect: () => `/settings/${userId}/profile/notification` },
      { pattern: /^\/settings\/profile-settings\/profile$/, redirect: () => `/settings/${userId}/profile-settings/profile` },
      { pattern: /^\/settings\/profile-settings\/password$/, redirect: () => `/settings/${userId}/profile-settings/password` },
    ];

    // Vérifier si la route actuelle correspond à un pattern sans ID
    for (const route of routesNeedingId) {
      if (route.pattern.test(url)) {
        // Si utilisateur connecté, rediriger vers la version avec ID
        if (userId) {
          const redirectUrl = route.redirect();
          return NextResponse.redirect(new URL(redirectUrl, req.url));
        }
        // Si non connecté, rediriger vers login
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', url);
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      ...pagesOptions,
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    // Routes protégées
    '/',
    '/executive',
    '/financial',
    '/analytics',
    '/logistics/:path*',
    '/ecommerce/:path*',
    '/support/:path*',
    '/file/:path*',
    '/file-manager',
    '/invoice/:path*',
    '/forms/profile-settings/:path*',
    // Routes sans ID à rediriger
    '/settings/profile',
    '/settings/profile-settings',
    '/settings/profile-settings/profile',
    '/settings/profile-settings/password',
    '/settings/profile-settings/notification',
    '/users',
    '/users/edit',
  ],
};