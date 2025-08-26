// src/lib/stores/auth.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Auth stores
export const user = writable(null);
export const isAuthenticated = writable(false);
export const loading = writable(false);

// Login funkcija - koristi postojeći API preko proxy-ja
export async function login(email, password) {
  loading.set(true);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Server će automatski postaviti cookie kroz proxy
    user.set(data.user);
    isAuthenticated.set(true);
    
    // Preusmeri na dashboard ili početnu stranicu
    goto('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  } finally {
    loading.set(false);
  }
}

// Logout funkcija
export async function logout() {
  loading.set(true);
  
  try {
    await fetch('/api/users/auth/logout', {
      method: 'POST'
    });
    
    user.set(null);
    isAuthenticated.set(false);
    
    // Preusmeri na login
    goto('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // I u slučaju greške, obriši lokalne podatke
    user.set(null);
    isAuthenticated.set(false);
    goto('/login');
  } finally {
    loading.set(false);
  }
}

// Inicijalizuj auth state iz server podataka
export function initializeAuth(serverUser) {
  if (serverUser) {
    user.set(serverUser);
    isAuthenticated.set(true);
  }
}