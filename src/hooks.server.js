// src/hooks.server.js
import { redirect } from '@sveltejs/kit';
import { API_URL } from '$lib/config.js';
import { user } from '$lib/stores/auth';

// Javne rute
const PUBLIC_ROUTES = ['/login', '/register'];

function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  console.log('Handling request for:', event.url.pathname);
  const { pathname } = event.url;
  
  // Ako je javna ruta, preskači proveru
  if (isPublicRoute(pathname) || pathname.startsWith('/api/')) {
    console.log('Public route or API call, skipping auth check');
    return await resolve(event);
  }
  
  // Proveri da li postoji access token
  const accessToken = event.cookies.get('accessToken');

  console.log('Access token:', accessToken);
  
  if (!accessToken) {
    console.log('No access token, redirecting to login');
    throw redirect(302, '/login');
  }
  
  // Validacija tokena kroz naš API check endpoint
  try {

    console.log('cookie:', event.request.headers.get('cookie'));
    const response = await fetch(`${API_URL}/api/users/auth/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    console.log('Auth check response status:', response.status);
    
    if (!response.ok) {
      throw redirect(302, '/login');
    }
    let user = await response.json();
    // if set cookie is present, set user in locals
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      event.cookies.set('accessToken', accessToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict'
      });

      user = {
        ...user,
        accessToken
      };
    } else {
      user = {
        ...user,
        accessToken: accessToken
      };
    }

    console.log('Authenticated user:', user);
    event.locals.user = user;
  } catch (error) {
    console.error('Auth validation error:', error);
    throw redirect(302, '/login');
  }
  
  return await resolve(event);
}