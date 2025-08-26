<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import Analytics from '$lib/components/Analytics.svelte';
  import Settings from '$lib/components/Settings.svelte';
  import Appointments from '$lib/components/Appointments.svelte';
  import Clients from '$lib/components/Clients.svelte';
  import Services from '$lib/components/Services.svelte';
  
  // Import new components
  import Users from '$lib/components/Users.svelte';
  import Reservations from '$lib/components/Reservations.svelte';
  import Salons from '$lib/components/Salons.svelte';
  import DefinedServices from '$lib/components/DefinedServices.svelte';
  
  import { activeTab, sidebarOpen } from '$lib/stores/salon.js';
	import { onMount } from 'svelte';

  export let data;

  onMount(() => {
    console.log('Component mounted with data:', data);
  });
</script>

<!-- Main container with proper spacing for fixed sidebar -->
<div class="min-h-screen bg-gray-50">
  <!-- Sidebar - fixed positioning -->
  <Sidebar />

  <!-- Mobile overlay -->
  {#if $sidebarOpen}
    <div 
      class="fixed inset-0 bg-black/50 z-20 md:hidden" 
      on:click={() => sidebarOpen.set(false)}
      on:keydown={(e) => e.key === 'Escape' && sidebarOpen.set(false)}
      role="button"
      tabindex="0"
    ></div>
  {/if}

  <!-- Main content area - offset by sidebar width on desktop -->
  <div class="md:ml-64">
    <Header />
    
    <main class="p-6">
      {#if $activeTab === 'dashboard'}
        <Dashboard admin={data.user} />
      {:else if $activeTab === 'analytics'}
        <Analytics admin={data.user} />
      {:else if $activeTab === 'settings'}
        <Settings admin={data.user} />
      {:else if $activeTab === 'appointments'}
        <Appointments />
      {:else if $activeTab === 'clients'}
        <Clients admin={data.user} />
      {:else if $activeTab === 'services'}
        <Services admin={data.user} />
      {:else if $activeTab === 'users'}
        <Users admin={data.user} />
      {:else if $activeTab === 'reservations'}
        <Reservations admin={data.user} />
      {:else if $activeTab === 'salons'}
        <Salons admin={data.user} />
      {:else if $activeTab === 'definedServices'}
        <DefinedServices admin={data.user} />
      {/if}
    </main>
  </div>
</div>

<style>
  /* Ensure proper spacing and prevent content jumping */
  @media (min-width: 768px) {
    .md\:ml-64 {
      margin-left: 16rem; /* 64 * 0.25rem = 16rem */
    }
  }
  
  /* Smooth transitions for responsive behavior */
  .min-h-screen {
    transition: margin-left 0.3s ease-in-out;
  }
  
  /* Prevent horizontal scrolling */
  body {
    overflow-x: hidden;
  }
</style>
