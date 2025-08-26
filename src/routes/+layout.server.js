// src/routes/+layout.server.js

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
  // Proslijedi korisničke podatke sa servera
  return {
    user: locals.user || null,
    isAuthenticated: !!locals.user
  };
}