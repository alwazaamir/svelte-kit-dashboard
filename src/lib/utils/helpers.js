import { CheckCircle, Clock, XCircle } from 'lucide-svelte';
import { t } from 'svelte-i18n';
import { get } from 'svelte/store';

/**
 * Format current date for display
 */
export function formatDate(locale = 'en-US') {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat(locale, options).format(now);
}

/**
 * Format short date (for today's date)
 */
export function formatShortDate() {
  return new Date().toLocaleDateString('en-US');
}

/**
 * Format price in Serbian Dinar
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Get status CSS classes for appointments
 */
export function getStatusClass(status) {
  const statusClasses = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status icon component for appointments
 */
export function getStatusIcon(status) {
  const statusIcons = {
    confirmed: CheckCircle,
    pending: Clock,
    cancelled: XCircle,
    completed: CheckCircle
  };
  return statusIcons[status] || Clock;
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role) {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Menadžer',
    worker: 'Radnik'
  };
  return roleNames[role] || role;
}

/**
 * Get day name helper
 */
export function getDayName(day) {
  const days = {
    monday: 'Ponedeljak',
    tuesday: 'Utorak',
    wednesday: 'Sreda',
    thursday: 'Četvrtak',
    friday: 'Petak',
    saturday: 'Subota',
    sunday: 'Nedelja'
  };
  return days[day] || day;
}

/**
 * Analytics export function
 */
export function exportAnalytics() {
  console.log('Exporting analytics...');
  alert(get(t)('AnalyticsExportNotice'));
}

/**
 * Save settings function
 */
export function saveSettings() {
  console.log('Saving settings...');
  alert(get(t)('SettingsSaved'));
}

/**
 * Check if user has permission (with proper type handling)
 */
export function hasPermission(userRole, permission, rolePermissions) {
  if (!rolePermissions || !userRole) return false;
  const userPerms = rolePermissions[userRole];
  return userPerms && userPerms[permission];
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Generate initials from full name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
