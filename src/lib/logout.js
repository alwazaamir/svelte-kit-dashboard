// src/lib/logout.js
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

const API_URL = 'http://localhost:8000'; // tvoj API URL

export async function logout() {
  try {
    // Pozovi logout na API-ju
    await fetch(`${API_URL}/api/users/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getTokenFromCookie()}`
      }
    });
  } catch (error) {
    console.error('Logout API error:', error);
  }
  
  // Obriši cookie
  if (browser) {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  
  // Preusmeri na login
  goto('/login');
}

function getTokenFromCookie() {
  if (!browser) return null;
  
  const name = 'accessToken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

// Koristi u komponenti ovako:
// <script>
//   import { logout } from '$lib/logout.js';
// </script>
// <button on:click={logout}>Logout</button>