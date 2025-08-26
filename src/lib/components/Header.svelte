<script>
  import { Bell, User, Menu, LogOut, Settings } from 'lucide-svelte';
  import { activeTab, sidebarOpen, currentUser, userRole } from '$lib/stores/salon.js';
  import { formatDate, getRoleDisplayName } from '$lib/utils/helpers.js';
  import { t } from 'svelte-i18n';
  import LocaleSwitcher from './LocaleSwitcher.svelte';
  import { get } from 'svelte/store';

  let showUserMenu = false;

  function getTabTitle(tab) {
    const titles = {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      clients: 'Clients',
      // services: 'Services',
      analytics: 'Analytics',
      settings: 'Settings',
      users: 'Users',
      reservations: 'Reservations',
      salons: 'Salons',
      definedServices: 'Defined Services'
    };
    return get(t)(titles[tab] || 'Dashboard');
  }

  function handleLogout() {
    console.log('Logout user');
    showUserMenu = false;
  }

  function handleProfile() {
    console.log('Open profile');
    showUserMenu = false;
  }

  function handleSettings() {
    activeTab.set('settings');
    showUserMenu = false;
  }

  // Close user menu when clicking outside
  function handleClickOutside(event) {
    if (!event.target.closest('.user-menu-container')) {
      showUserMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="bg-white shadow-sm border-b border-gray-200 p-6 relative">
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <!-- Mobile menu button -->
      <button 
        class="md:hidden p-2 mr-3 hover:bg-gray-100 rounded-lg transition-colors" 
        on:click={() => sidebarOpen.set(true)}
      >
        <Menu class="w-6 h-6 text-gray-600" />
      </button>
      
      <!-- Page title and date -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {getTabTitle($activeTab)}
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          {formatDate()}
        </p>
      </div>
    </div>

    <!-- Right side - notifications, locale switcher and user menu -->
    <div class="flex items-center space-x-4">
      <LocaleSwitcher />
      <!-- Notifications -->
      <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
        <Bell class="w-5 h-5 text-gray-600" />
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
      </button>

      <!-- User menu -->
      <div class="relative user-menu-container">
        <button 
          class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          on:click={() => showUserMenu = !showUserMenu}
        >
          <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User class="w-5 h-5 text-white" />
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-medium text-gray-900">{$currentUser.name}</p>
            <p class="text-xs text-gray-500">{getRoleDisplayName($userRole)}</p>
          </div>
        </button>

        <!-- User dropdown menu -->
        {#if showUserMenu}
          <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <!-- User info -->
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{$currentUser.name}</p>
              <p class="text-sm text-gray-500">{$currentUser.email}</p>
              <p class="text-xs text-gray-400 mt-1">{getRoleDisplayName($userRole)}</p>
            </div>

            <!-- Menu items -->
            <div class="py-1">
              <button 
                on:click={handleProfile}
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User class="w-4 h-4 mr-3" />
                {$t('MyProfile')}
              </button>
              
              <button 
                on:click={handleSettings}
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings class="w-4 h-4 mr-3" />
                {$t('Settings')}
              </button>
            </div>

            <div class="border-t border-gray-100 py-1">
              <button 
                on:click={handleLogout}
                class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut class="w-4 h-4 mr-3" />
                {$t('Logout')}
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  /* Ensure dropdown stays above other elements */
  .user-menu-container {
    z-index: 50;
  }
</style>
