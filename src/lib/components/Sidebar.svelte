<script>
  import { 
    Calendar, Home, Users, Sparkles, TrendingUp, Settings, 
    Scissors, X, BookOpen, UserCheck, Building, Tag
  } from 'lucide-svelte';
import {
    activeTab, sidebarOpen, userRole, rolePermissions,
    getMenuItemsForRole
  } from '$lib/stores/salon.js';
import { t } from 'svelte-i18n';

  // Icon mapping
  const iconMap = {
    Home,
    Calendar,
    Users,
    Sparkles,
    TrendingUp,
    Settings,
    BookOpen,
    UserCheck,
    Building,
    Tag
  };

  // Reactive menu items based on user role
  $: menuItems = getMenuItemsForRole($userRole, $rolePermissions);

  function handleMenuClick(itemId) {
    activeTab.set(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      sidebarOpen.set(false);
    }
  }
</script>

<!-- Desktop sidebar - fixed positioning -->
<aside
  class="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:z-20"
  class:-translate-x-full={!$sidebarOpen}
  class:translate-x-0={$sidebarOpen}
>
  <!-- Header -->
  <div class="flex items-center justify-between p-6 border-b border-gray-200">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 bg-gradient-to-br from-[#EEBB5B] to-[#FFE4B2] rounded-xl flex items-center justify-center">
        <Scissors class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Elvua</h1>
        <p class="text-sm text-gray-500">{$t('SalonManagement')}</p>
      </div>
    </div>
    
    <!-- Close button for mobile -->
    <button 
      class="p-2 md:hidden hover:bg-gray-100 rounded-lg transition-colors" 
      on:click={() => sidebarOpen.set(false)}
    >
      <X class="w-5 h-5 text-gray-600" />
    </button>
  </div>
  
  <!-- Navigation -->
  <nav class="mt-6 flex-1 overflow-y-auto">
    {#each menuItems as item (item.id)}
      <button
        on:click={() => handleMenuClick(item.id)}
        class={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
          $activeTab === item.id
            ? 'bg-primary-light text-primary border-r-2 border-primary font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <svelte:component this={iconMap[item.icon]} class="w-5 h-5 mr-3 flex-shrink-0" />
        <span class="truncate">{$t(item.label)}</span>
      </button>
    {/each}
  </nav>

  <!-- User info footer -->
  <div class="p-4 border-t border-gray-200 bg-gray-50">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <UserCheck class="w-4 h-4 text-white" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">Ana Nikolic</p>
        <p class="text-xs text-gray-500 capitalize">{$userRole}</p>
      </div>
    </div>
  </div>
</aside>
