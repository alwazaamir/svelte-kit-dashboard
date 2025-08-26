<script>
import { onMount } from 'svelte';
import { Building, Plus, Search, MapPin, Phone, Edit, Trash, X, Save, Loader, Mail, Globe, User, CheckCircle, XCircle } from 'lucide-svelte';
import { salons, rolePermissions, userRole } from '$lib/stores/salon.js';
import { t } from 'svelte-i18n';
import { API_URL } from '$lib/config.js';
  
  let searchTerm = '';
  let loading = false;
  let error = null;

  // Modal states
  let showCreateModal = false;
  let showEditModal = false;
  let modalLoading = false;
  let modalError = null;

  // Categories and users for selection
  let predefinedCategories = [];
  let users = [];
  let categoriesLoading = false;
  let usersLoading = false;

  // Form data
  let createForm = {
    name: '',
    description: '',
    owner_id: '',
    email: '',
    website: '',
    predefined_category_ids: []
  };

  let editForm = {
    id: '',
    name: '',
    description: '',
    email: '',
    website: '',
    predefined_category_ids: []
  };

  export let admin;
  
  $: filteredSalons = $salons.filter(salon => {
    const mainLocation = salon.locations?.find(loc => loc.is_main) || salon.locations?.[0];
    return salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (mainLocation?.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (mainLocation?.city || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  $: canEdit = $rolePermissions[$userRole]?.canEditSalons || false;

  async function fetchSalons() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/salons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch salons: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update the salons store
      salons.set(data.salons || []);
      
    } catch (err) {
      console.error('Error fetching salons:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function fetchPredefinedCategories() {
    categoriesLoading = true;

    try {
      const response = await fetch(`${API_URL}/api/users/api/public/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      predefinedCategories = data.categories || data || [];
      
    } catch (err) {
      console.error('Error fetching predefined categories:', err);
      // Don't set error here as it's not critical for the main view
    } finally {
      categoriesLoading = false;
    }
  }

  async function fetchUsers() {
    usersLoading = true;

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      users = data.users || [];
      
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't set error here as it's not critical for the main view
    } finally {
      usersLoading = false;
    }
  }

  function handleAddSalon() {
    // Reset form
    createForm = {
      name: '',
      description: '',
      owner_id: '',
      email: '',
      website: '',
      predefined_category_ids: []
    };
    modalError = null;
    showCreateModal = true;
    
    // Fetch categories and users if not already loaded
    if (predefinedCategories.length === 0) {
      fetchPredefinedCategories();
    }
    if (users.length === 0) {
      fetchUsers();
    }
  }

  function handleEditSalon(salon) {
    // Populate form with salon data
    editForm = {
      id: salon.id,
      name: salon.name || '',
      description: salon.description || '',
      email: salon.email || '',
      website: salon.website || '',
      predefined_category_ids: salon.predefined_category_ids || []
    };
    modalError = null;
    showEditModal = true;
    
    // Fetch categories and users if not already loaded
    if (predefinedCategories.length === 0) {
      fetchPredefinedCategories();
    }
    if (users.length === 0) {
      fetchUsers();
    }
  }

  async function submitCreateSalon() {
    modalLoading = true;
    modalError = null;

    try {
      const salonData = {
        name: createForm.name,
        description: createForm.description || undefined,
        owner_id: createForm.owner_id,
        email: createForm.email,
        website: createForm.website || undefined,
        predefined_category_ids: createForm.predefined_category_ids
      };

      // Remove undefined values
      Object.keys(salonData).forEach(key => 
        salonData[key] === undefined && delete salonData[key]
      );

      const response = await fetch(`${API_URL}/api/users/api/admin/salons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify(salonData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create salon: ${response.status} ${response.statusText}`);
      }

      const newSalon = await response.json();
      
      // Add new salon to the store
      salons.update(currentSalons => [...currentSalons, newSalon.salon || newSalon]);
      
      // Close modal and reset form
      showCreateModal = false;
      createForm = {
        name: '',
        description: '',
        owner_id: '',
        email: '',
        website: '',
        predefined_category_ids: []
      };

    } catch (err) {
      console.error('Error creating salon:', err);
      modalError = err.message;
    } finally {
      modalLoading = false;
    }
  }

  async function toggleSalonStatus(salonId, currentActive) {
    const action = currentActive ? 'deactivate' : 'activate';
    
    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/salons/${salonId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} salon: ${response.status} ${response.statusText}`);
      }

      // Update salon status in the store
      salons.update(currentSalons => 
        currentSalons.map(salon => 
          salon.id === salonId 
            ? { ...salon, active: !currentActive }
            : salon
        )
      );

    } catch (err) {
      console.error(`Error ${action}ing salon:`, err);
      error = err.message;
    }
  }

  async function deleteSalon(salonId) {
    if (!confirm($t('ConfirmDeleteSalon') || 'Are you sure you want to delete this salon?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/salons/${salonId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete salon: ${response.status} ${response.statusText}`);
      }

      // Remove the salon from the local store
      salons.update(currentSalons => currentSalons.filter(salon => salon.id !== salonId));

    } catch (err) {
      console.error('Error deleting salon:', err);
      error = err.message;
    }
  }

  function closeModals() {
    showCreateModal = false;
    showEditModal = false;
    modalError = null;
  }

  function handleRefresh() {
    fetchSalons();
  }

  function toggleCategory(categoryId, isCreate = true) {
    const form = isCreate ? createForm : editForm;
    const categories = form.predefined_category_ids;
    
    if (categories.includes(categoryId)) {
      form.predefined_category_ids = categories.filter(id => id !== categoryId);
    } else {
      form.predefined_category_ids = [...categories, categoryId];
    }
  }

  // Fetch salons when component mounts
  onMount(() => {
    fetchSalons();
  });
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('Salons')}</h2>
      <p class="text-gray-600">{$t('ManageSalonsLocations')}</p>
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
      
      {#if canEdit}
        <button 
          on:click={handleAddSalon}
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus class="w-4 h-4 mr-2" />
          {$t('AddSalon')}
        </button>
      {/if}
    </div>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={$t('SearchSalonPlaceholder')}
          bind:value={searchTerm}
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <Loader class="w-6 h-6 animate-spin text-primary" />
        <span class="ml-2 text-gray-600">{$t('Loading') || 'Loading salons...'}</span>
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
    {:else if filteredSalons.length === 0}
      <div class="text-center py-8">
        <Building class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">{$t('NoSalonsFound') || 'No salons found'}</p>
        {#if canEdit}
          <button 
            on:click={handleAddSalon}
            class="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus class="w-4 h-4 mr-2" />
            {$t('AddFirstSalon') || 'Add your first salon'}
          </button>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {#each filteredSalons as salon (salon.id)}
          {@const mainLocation = salon.locations?.find(loc => loc.is_main) || salon.locations?.[0]}
          <div class="group border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start space-x-4 flex-1">
                <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building class="w-6 h-6 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 truncate">{salon.name}</h3>
                  {#if salon.description}
                    <p class="text-sm text-gray-600 mt-1">{salon.description}</p>
                  {/if}
                  <div class="mt-2 space-y-1">
                    {#if mainLocation?.address}
                      <p class="text-sm text-gray-600 flex items-center">
                        <MapPin class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span class="truncate">{mainLocation.address}, {mainLocation.city || ''} {mainLocation.zip_code || ''}</span>
                      </p>
                    {/if}
                    {#if mainLocation?.phone}
                      <p class="text-sm text-gray-600 flex items-center">
                        <Phone class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{mainLocation.phone}</span>
                      </p>
                    {/if}
                    {#if salon.email}
                      <p class="text-sm text-gray-600 flex items-center">
                        <Mail class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span class="truncate">{salon.email}</span>
                      </p>
                    {/if}
                    {#if salon.website}
                      <p class="text-sm text-gray-600 flex items-center">
                        <Globe class="w-4 h-4 mr-2 flex-shrink-0" />
                        <a href={salon.website} target="_blank" class="text-primary hover:underline truncate">{salon.website}</a>
                      </p>
                    {/if}
                    {#if salon.owner}
                      <p class="text-sm text-gray-600 flex items-center">
                        <User class="w-4 h-4 mr-2 flex-shrink-0" />
                        <span class="truncate">{salon.owner.first_name} {salon.owner.last_name}</span>
                      </p>
                    {/if}
                  </div>
                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        {salon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        {salon.active ? $t('Active') : $t('Inactive')}
                      </span>
                      {#if salon.locations && salon.locations.length > 1}
                        <span class="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {salon.locations.length} locations
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
              
              {#if canEdit}
                <div class="flex flex-col space-y-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-2">
                  <button 
                    on:click={() => handleEditSalon(salon)}
                    class="text-primary hover:text-primary/80 p-1" 
                    title="Edit salon"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button 
                    on:click={() => toggleSalonStatus(salon.id, salon.active)}
                    class="text-orange-600 hover:text-orange-800 p-1" 
                    title="{salon.active ? 'Deactivate' : 'Activate'} salon"
                  >
                    {#if salon.active}
                      <XCircle class="w-4 h-4" />
                    {:else}
                      <CheckCircle class="w-4 h-4" />
                    {/if}
                  </button>
                  <button 
                    on:click={() => deleteSalon(salon.id)}
                    class="text-red-600 hover:text-red-800 p-1" 
                    title="Delete salon"
                  >
                    <Trash class="w-4 h-4" />
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Create Salon Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('CreateSalon') || 'Create Salon'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={submitCreateSalon} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('SalonName') || 'Salon Name'} *
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
              {$t('Owner') || 'Owner'} *
            </label>
            {#if usersLoading}
              <div class="flex items-center justify-center py-2 border border-gray-300 rounded-lg">
                <Loader class="w-4 h-4 animate-spin text-primary mr-2" />
                <span class="text-sm text-gray-600">Loading users...</span>
              </div>
            {:else}
              <select
                bind:value={createForm.owner_id}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{$t('SelectOwner') || 'Select Owner'}</option>
                {#each users as user}
                  <option value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                {/each}
              </select>
            {/if}
          </div>
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Email') || 'Email'} *
            </label>
            <input
              type="email"
              bind:value={createForm.email}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Website') || 'Website'}
            </label>
            <input
              type="url"
              bind:value={createForm.website}
              placeholder="https://example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {$t('ServiceCategories') || 'Service Categories'} *
          </label>
          {#if categoriesLoading}
            <div class="flex items-center justify-center py-4">
              <Loader class="w-4 h-4 animate-spin text-primary mr-2" />
              <span class="text-sm text-gray-600">Loading categories...</span>
            </div>
          {:else if predefinedCategories.length === 0}
            <p class="text-sm text-gray-500">No categories available</p>
          {:else}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {#each predefinedCategories as category}
                <label class="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={createForm.predefined_category_ids.includes(category.id)}
                    on:change={() => toggleCategory(category.id, true)}
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="flex items-center space-x-1">
                    {#if category.color}
                      <div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
                    {/if}
                    <span>{category.name}</span>
                  </span>
                </label>
              {/each}
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Selected: {createForm.predefined_category_ids.length} categories
            </p>
          {/if}
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
            disabled={modalLoading || createForm.predefined_category_ids.length === 0}
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

<!-- Edit Salon Modal -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('EditSalon') || 'Edit Salon'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={() => console.log('Edit salon functionality not implemented yet')} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p class="text-blue-800 text-sm">Edit functionality will be implemented when the update API endpoint is available.</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('SalonName') || 'Salon Name'}
          </label>
          <input
            type="text"
            bind:value={editForm.name}
            maxlength="100"
            readonly
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
            readonly
            class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Email') || 'Email'}
            </label>
            <input
              type="email"
              bind:value={editForm.email}
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Website') || 'Website'}
            </label>
            <input
              type="url"
              bind:value={editForm.website}
              readonly
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            on:click={closeModals}
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {$t('Close') || 'Close'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}