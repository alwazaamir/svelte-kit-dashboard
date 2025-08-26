<script>
import { Plus, Clock, Edit, Trash, Search } from 'lucide-svelte';
import { services, rolePermissions, userRole } from '$lib/stores/salon.js';
import { formatPrice } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';
  
  let searchTerm = '';
  let selectedCategory = 'all';
  
  // Reactive filtered services
  $: filteredServices = $services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Check permissions with proper type handling
  $: canEdit = (() => {
    const permissions = $rolePermissions;
    const role = $userRole;
    return permissions[role]?.canEditServices || false;
  })();

  function handleAddService() {
    console.log('Add new service');
  }

  function handleEditService(serviceId) {
    console.log('Edit service:', serviceId);
  }

  function handleDeleteService(serviceId) {
    if (confirm($t('DeleteServiceConfirm'))) {
      services.update(list => list.filter(s => s.id !== serviceId));
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('Services')}</h2>
      <p class="text-gray-600">{$t('ManageSalonServices')}</p>
    </div>
    
    {#if canEdit}
      <button 
        on:click={handleAddService}
        class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus class="w-4 h-4 mr-2" />
        {$t('NewService')}
      </button>
    {/if}
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Plus class="w-6 h-6 text-blue-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-600">{$t('TotalServices')}</p>
          <p class="text-2xl font-bold text-gray-900">{$services.length}</p>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Clock class="w-6 h-6 text-green-600" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-600">{$t('ActiveServices')}</p>
          <p class="text-2xl font-bold text-gray-900">
            {$services.filter(s => s.status === 'active').length}
          </p>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex items-center">
        <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
          <Clock class="w-6 h-6 text-primary" />
        </div>
        <div class="ml-4">
          <p class="text-sm text-gray-600">{$t('AveragePrice')}</p>
          <p class="text-lg font-bold text-gray-900">
            {formatPrice($services.reduce((sum, s) => sum + s.price, 0) / $services.length || 0)}
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={$t('SearchServicesPlaceholder')}
          bind:value={searchTerm}
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <!-- Category filter -->
      <select 
        bind:value={selectedCategory}
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="all">{$t('AllCategories')}</option>
        <option value="Osnovno">{$t('Basic')}</option>
        <option value="Stilizovanje">{$t('Styling')}</option>
        <option value="Farbanje">{$t('Coloring')}</option>
        <option value="Tretmani">{$t('Treatments')}</option>
      </select>
    </div>
  </div>

  <!-- Services Grid -->
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">
        {$t('ServicesList')} ({filteredServices.length})
      </h3>
    </div>
    
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredServices as service (service.id)}
          <div class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{service.name}</h3>
                <p class="text-sm text-gray-500">{service.category}</p>
              </div>
              {#if canEdit}
                <div class="flex space-x-1">
                  <button 
                    on:click={() => handleEditService(service.id)}
                    class="text-gray-400 hover:text-primary p-1"
                    title={$t('EditService')}
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button 
                    on:click={() => handleDeleteService(service.id)}
                    class="text-gray-400 hover:text-red-600 p-1"
                    title={$t('DeleteService')}
                  >
                    <Trash class="w-4 h-4" />
                  </button>
                </div>
              {/if}
            </div>
            
            <p class="text-sm text-gray-600 mb-4">{service.description}</p>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 flex items-center">
                <Clock class="w-4 h-4 mr-1" />
                {service.duration} min
              </span>
              <span class="text-lg font-semibold text-primary">{formatPrice(service.price)}</span>
            </div>
          </div>
        {/each}
      </div>
      
      {#if filteredServices.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <Plus class="w-12 h-12 mx-auto" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{$t('NoServices')}</h3>
          <p class="text-gray-500">
            {searchTerm || selectedCategory !== 'all'
              ? $t('NoServicesFilter')
              : $t('AddFirstServicePrompt')}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
