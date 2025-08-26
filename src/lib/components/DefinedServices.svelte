<script>
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { Sparkles, Plus, Search, Edit, Trash, X, Save, Loader, Palette } from 'lucide-svelte';
  import { definedServices, rolePermissions, userRole } from '$lib/stores/salon.js';
  import { API_URL } from '$lib/config.js';
  
  let searchTerm = '';
  let loading = false;
  let error = null;

  // Modal states
  let showCreateModal = false;
  let showEditModal = false;
  let modalLoading = false;
  let modalError = null;

  // Form data
  let createForm = {
    name: '',
    description: '',
    icon: '',
    color: '#6366f1'
  };

  let editForm = {
    id: '',
    name: '',
    description: '',
    icon: '',
    color: '#6366f1'
  };

  export let admin;
  
  $: filteredServices = $definedServices.filter(service => {
    console.log('Filtering service:', service, 'with search term:', searchTerm);
    try {
    return service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    } catch (err) {
      console.error('Error filtering services:', err);
      return false; // Skip this service if there's an error
    }
  });

  $: canEdit = $rolePermissions[$userRole]?.canEditServices || false;

  // Common icon options for services
  const iconOptions = [
    { value: 'sparkles', label: 'Sparkles' },
    { value: 'scissors', label: 'Scissors' },
    { value: 'palette', label: 'Palette' },
    { value: 'heart', label: 'Heart' },
    { value: 'star', label: 'Star' },
    { value: 'crown', label: 'Crown' },
    { value: 'flower', label: 'Flower' },
    { value: 'gem', label: 'Gem' },
    { value: 'wand', label: 'Wand' },
    { value: 'brush', label: 'Brush' }
  ];

  // Predefined color options
  const colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'
  ];

  async function fetchPredefinedCategories() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`${API_URL}/api/users/api/public/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch predefined categories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the definedServices store
      definedServices.set(data.categories || data || []);
      
    } catch (err) {
      console.error('Error fetching predefined categories:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleAddService() {
    // Reset form
    createForm = {
      name: '',
      description: '',
      icon: '',
      color: '#6366f1'
    };
    modalError = null;
    showCreateModal = true;
  }

  function handleEditService(service) {
    // Populate form with service data
    editForm = {
      id: service.id,
      name: service.name || '',
      description: service.description || '',
      icon: service.icon || '',
      color: service.color || '#6366f1'
    };
    modalError = null;
    showEditModal = true;
  }

  async function submitCreateService() {
    modalLoading = true;
    modalError = null;

    try {
      const serviceData = {
        name: createForm.name,
        description: createForm.description || undefined,
        icon: createForm.icon || undefined,
        color: createForm.color || undefined
      };

      // Remove undefined values
      Object.keys(serviceData).forEach(key => 
        serviceData[key] === undefined && delete serviceData[key]
      );

      const response = await fetch(`${API_URL}/api/users/api/admin/categories/predefined`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create service: ${response.status} ${response.statusText}`);
      }

      const newService = await response.json();
      
      // Add new service to the store
      definedServices.update(currentServices => [...currentServices, newService.category]);
      
      // Close modal and reset form
      showCreateModal = false;
      createForm = {
        name: '',
        description: '',
        icon: '',
        color: '#6366f1'
      };

    } catch (err) {
      console.error('Error creating service:', err);
      modalError = err.message;
    } finally {
      modalLoading = false;
    }
  }

  async function submitEditService() {
    modalLoading = true;
    modalError = null;

    try {
      const serviceData = {
        name: editForm.name || undefined,
        description: editForm.description || undefined,
        icon: editForm.icon || undefined,
        color: editForm.color || undefined
      };

      // Remove undefined values
      Object.keys(serviceData).forEach(key => 
        serviceData[key] === undefined && delete serviceData[key]
      );

      const response = await fetch(`${API_URL}/api/users/api/admin/categories/predefined/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update service: ${response.status} ${response.statusText}`);
      }

      const updatedService = await response.json();
      
      // Update service in the store
      definedServices.update(currentServices => 
        currentServices.map(service => service.id === editForm.id ? updatedService.category : service)
      );
      
      // Close modal
      showEditModal = false;

    } catch (err) {
      console.error('Error updating service:', err);
      modalError = err.message;
    } finally {
      modalLoading = false;
    }
  }

  async function deleteService(serviceId) {
    if (!confirm($t('ConfirmDeleteService') || 'Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/categories/predefined/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete service: ${response.status} ${response.statusText}`);
      }

      // Remove the service from the local store
      definedServices.update(currentServices => currentServices.filter(service => service.id !== serviceId));

    } catch (err) {
      console.error('Error deleting service:', err);
      error = err.message;
    }
  }

  function closeModals() {
    showCreateModal = false;
    showEditModal = false;
    modalError = null;
  }

  function handleRefresh() {
    fetchPredefinedCategories();
  }

  // Fetch predefined categories when component mounts
  onMount(() => {
    fetchPredefinedCategories();
  });
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('DefinedServicesTitle')}</h2>
      <p class="text-gray-600">{$t('ManageServiceTypes')}</p>
    </div>
    
    <div class="flex gap-2">
      <button 
        on:click={handleRefresh}
        disabled={loading}
        class="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {#if loading}
          <Loader class="w-4 h-4 mr-2 animate-spin" />
        {:else}
          <Search class="w-4 h-4 mr-2" />
        {/if}
        {$t('Refresh') || 'Refresh'}
      </button>
      
      
        <button 
          on:click={handleAddService}
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus class="w-4 h-4 mr-2" />
          {$t('AddService')}
        </button>
    </div>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={$t('SearchPlaceholder')}
          bind:value={searchTerm}
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <Loader class="w-6 h-6 animate-spin text-primary" />
        <span class="ml-2 text-gray-600">{$t('Loading') || 'Loading services...'}</span>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800">{$t('Error') || 'Error'}: {error}</p>
        <button 
          on:click={handleRefresh}
          class="mt-2 text-red-600 hover:text-red-800 underline"
        >
          {$t('TryAgain') || 'Try again'}
        </button>
      </div>
    {:else if filteredServices.length === 0}
      <div class="text-center py-8">
        <Sparkles class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">{$t('NoServicesFound') || 'No services found'}</p>
        
          <button 
            on:click={handleAddService}
            class="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus class="w-4 h-4 mr-2" />
            {$t('AddFirstService') || 'Add your first service'}
          </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredServices as service (service.id)}
          <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                {#if service.color}
                  <div 
                    class="w-4 h-4 rounded-full flex-shrink-0"
                    style="background-color: {service.color}"
                  ></div>
                {/if}
                <h3 class="text-lg font-semibold text-gray-900">{service.name}</h3>
              </div>
              
              {#if canEdit}
                <div class="flex space-x-1 opacity-100 group-hover:opacity-100 transition-opacity">
                  <button 
                    on:click={() => handleEditService(service)}
                    class="text-primary hover:text-primary/80 p-1" 
                    title="Edit service"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button 
                    on:click={() => deleteService(service.id)}
                    class="text-red-600 hover:text-red-800 p-1" 
                    title="Delete service"
                  >
                    <Trash class="w-4 h-4" />
                  </button>
                </div>
              {/if}
            </div>

            {#if service.description}
              <p class="text-sm text-gray-600 mb-3">{service.description}</p>
            {/if}

            {#if service.icon}
              <div class="flex items-center text-xs text-gray-400">
                <span class="bg-gray-100 px-2 py-1 rounded">
                  {service.icon}
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Create Service Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('CreateService') || 'Create Service'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={submitCreateService} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('ServiceName') || 'Service Name'} *
          </label>
          <input
            type="text"
            bind:value={createForm.name}
            required
            maxlength="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Description') || 'Description'}
          </label>
          <textarea
            bind:value={createForm.description}
            maxlength="500"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Icon') || 'Icon'}
          </label>
          <select
            bind:value={createForm.icon}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">{$t('SelectIcon') || 'Select Icon'}</option>
            {#each iconOptions as icon}
              <option value={icon.value}>{icon.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Color') || 'Color'}
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              bind:value={createForm.color}
              class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              bind:value={createForm.color}
              placeholder="#6366f1"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div class="flex space-x-1 mt-2">
            {#each colorOptions as color}
              <button
                type="button"
                on:click={() => createForm.color = color}
                class="w-6 h-6 rounded border-2 {createForm.color === color ? 'border-gray-600' : 'border-gray-300'}"
                style="background-color: {color}"
              ></button>
            {/each}
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeModals}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {$t('Cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={modalLoading}
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {#if modalLoading}
              <Loader class="w-4 h-4 mr-2 animate-spin" />
            {:else}
              <Save class="w-4 h-4 mr-2" />
            {/if}
            {$t('Create') || 'Create'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Edit Service Modal -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('EditService') || 'Edit Service'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={submitEditService} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('ServiceName') || 'Service Name'}
          </label>
          <input
            type="text"
            bind:value={editForm.name}
            maxlength="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Description') || 'Description'}
          </label>
          <textarea
            bind:value={editForm.description}
            maxlength="500"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Icon') || 'Icon'}
          </label>
          <select
            bind:value={editForm.icon}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">{$t('SelectIcon') || 'Select Icon'}</option>
            {#each iconOptions as icon}
              <option value={icon.value}>{icon.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Color') || 'Color'}
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="color"
              bind:value={editForm.color}
              class="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              bind:value={editForm.color}
              placeholder="#6366f1"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div class="flex space-x-1 mt-2">
            {#each colorOptions as color}
              <button
                type="button"
                on:click={() => editForm.color = color}
                class="w-6 h-6 rounded border-2 {editForm.color === color ? 'border-gray-600' : 'border-gray-300'}"
                style="background-color: {color}"
              ></button>
            {/each}
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeModals}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {$t('Cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={modalLoading}
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {#if modalLoading}
              <Loader class="w-4 h-4 mr-2 animate-spin" />
            {:else}
              <Save class="w-4 h-4 mr-2" />
            {/if}
            {$t('Update') || 'Update'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}