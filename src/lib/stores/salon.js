import { writable } from 'svelte/store';

// Navigation state
export const activeTab = writable('dashboard');
export const activeAnalyticsTab = writable('overview');
export const activeSettingsTab = writable('general');

// Mobile sidebar state
export const sidebarOpen = writable(false);

// User roles and auth state
export const userRole = writable('admin');
export const currentUser = writable({
  id: 1,
  name: 'Ana Nikolic',
  role: 'admin',
  email: 'ana@elvua.com',
  avatar: null
});

// Role permissions mapping
export const rolePermissions = writable({
  admin: {
    canViewUsers: true,
    canViewReservations: true,
    canViewSalons: true,
    canViewServices: true,
    canViewAnalytics: true,
    canViewClients: false,
    canViewAppointments: false,
    canViewSettings: false,
    canEditUsers: true,
    canEditSalons: true,
    canEditServices: true,
    canEditSettings: false,
    canEditReservations: false
  },
  manager: {
    canViewUsers: false,
    canViewReservations: true,
    canViewSalons: false,
    canViewServices: true,
    canViewAnalytics: true,
    canViewClients: true,
    canViewAppointments: true,
    canViewSettings: true,
    canEditUsers: false,
    canEditSalons: false,
    canEditServices: true,
    canEditSettings: true,
    canEditReservations: true
  },
  worker: {
    canViewUsers: false,
    canViewReservations: true,
    canViewSalons: false,
    canViewServices: false,
    canViewAnalytics: false,
    canViewClients: true,
    canViewAppointments: true,
    canViewSettings: false,
    canEditUsers: false,
    canEditSalons: false,
    canEditServices: false,
    canEditSettings: false,
    canEditReservations: false
  }
});

// Salon settings store
export const salonSettings = writable({
  general: {
    salonName: 'Elvua Beauty Salon',
    phone: '+381 21 123 456',
    email: 'info@elvua.com',
    address: 'Bulevar oslobođenja 123, Novi Sad',
    website: 'www.elvua.com',
    currency: 'RSD',
    timezone: 'Europe/Belgrade'
  },
  business: {
    workingHours: {
      monday: '09:00-19:00',
      tuesday: '09:00-19:00',
      wednesday: '09:00-19:00',
      thursday: '09:00-19:00',
      friday: '09:00-20:00',
      saturday: '09:00-18:00',
      sunday: 'closed'
    },
    bookingSettings: {
      advanceBookingDays: 30,
      cancellationHours: 24,
      reminderHours: 24,
      allowOnlineBooking: true
    }
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    cancellationNotifications: true,
    promotionalEmails: false
  },
  appearance: {
    theme: 'light',
    primaryColor: '#EEBB5B',
    logo: null,
    favicon: null
  }
});

// Sample data stores
export const appointments = writable([
  {
    id: 1,
    clientName: 'Maria Petrovic',
    service: 'Haircut + Blow Dry',
    stylist: 'Ana Nikolic',
    date: '2025-07-06',
    time: '10:00',
    duration: 90,
    price: 3500,
    status: 'confirmed',
    phone: '+381 62 123 4567',
    email: 'maria@email.com',
    notes: 'First visit, prefers short hair'
  },
  {
    id: 2,
    clientName: 'Stefan Jovanovic',
    service: 'Men\'s Cut + Shave',
    stylist: 'Marko Stojanovic',
    date: '2025-07-06',
    time: '11:30',
    duration: 60,
    price: 2000,
    status: 'pending',
    phone: '+381 63 987 6543',
    email: 'stefan@email.com',
    notes: ''
  },
  {
    id: 3,
    clientName: 'Jelena Mitrovic',
    service: 'Hair Color + Blow Dry',
    stylist: 'Ana Nikolic',
    date: '2025-07-06',
    time: '14:00',
    duration: 180,
    price: 8500,
    status: 'confirmed',
    phone: '+381 64 456 7890',
    email: 'jelena@email.com',
    notes: 'Allergic to ammonia'
  }
]);

export const clients = writable([
  {
    id: 1,
    name: 'Maria Petrovic',
    phone: '+381 62 123 4567',
    email: 'maria@email.com',
    visits: 5,
    totalSpent: 17500,
    lastVisit: '2025-06-15',
    notes: 'VIP client'
  },
  {
    id: 2,
    name: 'Stefan Jovanovic',
    phone: '+381 63 987 6543',
    email: 'stefan@email.com',
    visits: 3,
    totalSpent: 8500,
    lastVisit: '2025-06-10',
    notes: ''
  }
]);

// Services store - THIS WAS MISSING!
export const services = writable([
  {
    id: 1,
    name: 'Šišanje',
    category: 'Osnovno',
    duration: 45,
    price: 1500,
    description: 'Osnovno šišanje za žene i muškarce',
    status: 'active'
  },
  {
    id: 2,
    name: 'Šišanje + Feniranje',
    category: 'Stilizovanje',
    duration: 90,
    price: 3500,
    description: 'Šišanje sa fenirajnem i stilizovanjem',
    status: 'active'
  },
  {
    id: 3,
    name: 'Farbanje kose',
    category: 'Farbanje',
    duration: 180,
    price: 8500,
    description: 'Profesionalno farbanje kose',
    status: 'active'
  },
  {
    id: 4,
    name: 'Tretman kose',
    category: 'Tretmani',
    duration: 60,
    price: 3000,
    description: 'Regenerativni tretman za kosu',
    status: 'active'
  }
]);

// Additional stores
export const users = writable([
  {
    id: 1,
    name: 'Ana Nikolic',
    email: 'ana@elvua.com',
    role: 'admin',
    phone: '+381 62 111 2222',
    status: 'active',
    dateCreated: '2025-01-15',
    lastLogin: '2025-07-06'
  }
]);

export const reservations = writable([
  {
    id: 1,
    clientName: 'Maria Petrovic',
    clientPhone: '+381 62 123 4567',
    service: 'Haircut + Blow Dry',
    stylist: 'Ana Nikolic',
    date: '2025-07-08',
    time: '10:00',
    duration: 90,
    price: 3500,
    status: 'confirmed',
    notes: 'First visit',
    created: '2025-07-01'
  }
]);

export const salons = writable([
  {
    id: 1,
    name: 'Elvua Central',
    address: 'Bulevar oslobođenja 123, Novi Sad',
    phone: '+381 21 123 456',
    email: 'central@elvua.com',
    status: 'active',
    workingHours: {
      monday: '09:00-19:00',
      tuesday: '09:00-19:00',
      wednesday: '09:00-19:00',
      thursday: '09:00-19:00',
      friday: '09:00-20:00',
      saturday: '09:00-18:00',
      sunday: 'closed'
    },
    services: ['haircut', 'coloring', 'styling', 'treatments'],
    stylists: ['Ana Nikolic', 'Marko Stojanovic'],
    dateCreated: '2025-01-01'
  }
]);

export const definedServices = writable([
  {
    id: 1,
    name: 'Šišanje',
    description: 'Osnovno šišanje za žene i muškarce'
  },
  {
    id: 2,
    name: 'Šišanje + Feniranje',
    description: 'Šišanje sa feniranjem i stilizovanjem'
  }
]);

// Stats and analytics stores
export const stats = writable({
  todayAppointments: 4,
  todayRevenue: 15500,
  totalClients: 4,
  monthlyRevenue: 125000,
  weeklyAppointments: 28,
  avgAppointmentValue: 3875
});

export const analyticsData = writable({
  revenue: {
    daily: 15500,
    weekly: 85000,
    monthly: 340000,
    yearly: 2800000
  },
  popularServices: [
    { name: 'Šišanje + Feniranje', count: 45, percentage: 35 },
    { name: 'Farbanje kose', count: 32, percentage: 25 },
    { name: 'Šišanje', count: 28, percentage: 22 },
    { name: 'Tretman kose', count: 23, percentage: 18 }
  ],
  clientRetention: 78,
  averageSpending: 4250
});

// Helper functions with proper typing
export function getMenuItemsForRole(role, permissions) {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home', requiredPermission: null },
    { id: 'appointments', label: 'Appointments', icon: 'Calendar', requiredPermission: 'canViewAppointments' },
    { id: 'clients', label: 'Clients', icon: 'Users', requiredPermission: 'canViewClients' },
    { id: 'reservations', label: 'Reservations', icon: 'BookOpen', requiredPermission: 'canViewReservations' },
    // { id: 'services', label: 'Services', icon: 'Sparkles', requiredPermission: 'canViewServices' },
    { id: 'definedServices', label: 'Defined Services', icon: 'Tag', requiredPermission: 'canViewServices' },
    { id: 'users', label: 'Users', icon: 'UserCheck', requiredPermission: 'canViewUsers' },
    { id: 'salons', label: 'Salons', icon: 'Building', requiredPermission: 'canViewSalons' },
    // { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', requiredPermission: 'canViewAnalytics' },
    { id: 'settings', label: 'Settings', icon: 'Settings', requiredPermission: 'canViewSettings' }
  ];

  return allMenuItems.filter(item => {
    if (!item.requiredPermission) return true;
    const userPerms = permissions[role];
    return userPerms && userPerms[item.requiredPermission];
  });
}

export function hasPermission(userRole, permission) {
  const permissions = rolePermissions.get();
  const userPerms = permissions[userRole];
  return userPerms && userPerms[permission];
}
