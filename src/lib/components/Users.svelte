<script>
import { onMount } from 'svelte';
import { UserPlus, Search, Edit, Trash, Mail, Phone, Loader, X, Save, Calendar } from 'lucide-svelte';
import { users, rolePermissions, userRole } from '$lib/stores/salon.js';
import { t } from 'svelte-i18n';
import { API_URL } from '$lib/config.js';
  
  let searchTerm = '';
  let selectedRole = 'all';
  let loading = false;
  let error = null;

  // Modal states
  let showCreateModal = false;
  let showEditModal = false;
  let modalLoading = false;
  let modalError = null;

  // Form data
  let createForm = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birthdate: '',
    phone_number: '',
    gender: '',
    show_content_gender: '',
    role_name: 'USER'
  };

  let editForm = {
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    birthdate: '',
    phone_number: '',
    gender: '',
    show_content_gender: '',
    role_name: 'USER'
  };

  export let admin;
  
  $: filteredUsers = $users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRoleName = user.role?.name?.toLowerCase() || '';
    const matchesRole = selectedRole === 'all' || userRoleName === selectedRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  $: canEdit = $rolePermissions[$userRole]?.canEditUsers || false;

  async function fetchUsers() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/users/role/${selectedRole}`, {
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
      
      // Update the users store
      users.set(data.users || data); // Adjust based on your API response structure
      
    } catch (err) {
      console.error('Error fetching users:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleAddUser() {
    // Reset form
    createForm = {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      birthdate: '',
      phone_number: '',
      gender: '',
      show_content_gender: '',
      role_name: 'USER'
    };
    modalError = null;
    showCreateModal = true;
  }

  function handleEditUser(user) {
    // Populate form with user data
    editForm = {
      id: user.id,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      birthdate: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      phone_number: user.phone_number || '',
      gender: user.gender || '',
      show_content_gender: user.show_content_gender || '',
      role_name: user.role?.name || 'USER'
    };
    modalError = null;
    showEditModal = true;
  }

  async function submitCreateUser() {
    modalLoading = true;
    modalError = null;

    try {
      // Prepare data for API
      const userData = {
        ...createForm
      };

      // Convert birthdate to proper format if provided
      if (userData.birthdate) {
        userData.birthdate = new Date(userData.birthdate).toISOString();
      }

      const response = await fetch(`${API_URL}/api/users/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create user: ${response.status} ${response.statusText}`);
      }

      const newUser = await response.json();
      
      // Add new user to the store
      users.update(currentUsers => [...currentUsers, newUser]);
      
      // Close modal and reset form
      showCreateModal = false;
      createForm = {
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        birthdate: '',
        phone_number: '',
        gender: '',
        show_content_gender: '',
        role_name: 'USER'
      };

    } catch (err) {
      console.error('Error creating user:', err);
      modalError = err.message;
    } finally {
      modalLoading = false;
    }
  }

  async function submitEditUser() {
    modalLoading = true;
    modalError = null;

    try {
      // Prepare data for API (exclude password for edit)
      const userData = {
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone_number: editForm.phone_number,
        gender: editForm.gender,
        show_content_gender: editForm.show_content_gender,
        role_name: editForm.role_name
      };

      // Convert birthdate to proper format if provided
      if (editForm.birthdate) {
        userData.birthdate = new Date(editForm.birthdate).toISOString();
      }

      const response = await fetch(`${API_URL}/api/users/api/admin/users/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update user: ${response.status} ${response.statusText}`);
      }

      const updatedUser = await response.json();
      
      // Update user in the store
      users.update(currentUsers => 
        currentUsers.map(user => user.id === editForm.id ? updatedUser : user)
      );
      
      // Close modal
      showEditModal = false;

    } catch (err) {
      console.error('Error updating user:', err);
      modalError = err.message;
    } finally {
      modalLoading = false;
    }
  }

  function closeModals() {
    showCreateModal = false;
    showEditModal = false;
    modalError = null;
  }

  function handleRefresh() {
    fetchUsers();
  }

  async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete user with ID ${userId}?`)) {
      return;
    }

    // check if id is same as admin user
    if (userId === admin.id) {
      error = 'You cannot delete your own account';
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }

      // Remove the user from the local store
      users.update(currentUsers => currentUsers.filter(user => user.id !== userId));

    } catch (err) {
      console.error('Error deleting user:', err);
      error = err.message;
    }
  }

  // Fetch users when component mounts
  onMount(() => {
    fetchUsers();
  });
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('Users')}</h2>
      <p class="text-gray-600">{$t('ManageUsers')}</p>
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
          on:click={handleAddUser}
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus class="w-4 h-4 mr-2" />
          {$t('AddUser')}
        </button>
      {/if}
    </div>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={$t('SearchUsersPlaceholder')}
          bind:value={searchTerm}
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <select 
        bind:value={selectedRole}
        on:change={fetchUsers}
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="all">{$t('AllRoles')}</option>
        <option value="ADMIN">{$t('Administrator')}</option>
        <option value="USER">{$t('User')}</option>
      </select>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <Loader class="w-6 h-6 animate-spin text-primary" />
        <span class="ml-2 text-gray-600">{$t('Loading') || 'Loading users...'}</span>
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
    {:else if filteredUsers.length === 0}
      <div class="text-center py-8">
        <p class="text-gray-500">{$t('NoUsersFound') || 'No users found'}</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredUsers as user (user.id)}
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span class="text-white font-medium">
                  {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` || '?'}
                </span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'}
                </h3>
                <p class="text-sm text-gray-500">{user.email || ''}</p>
                <p class="text-xs text-gray-400">{user.role?.name || 'No role'}</p>
                {#if user.phone_number}
                  <p class="text-xs text-gray-400 flex items-center">
                    <Phone class="w-3 h-3 mr-1" />
                    {user.phone_number}
                  </p>
                {/if}
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs px-2 py-1 rounded-full {user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                  {#if user.email_verified}
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <Mail class="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  {/if}
                </div>
              </div>
            </div>
            {#if canEdit}
              <div class="flex space-x-2">
                <button 
                  on:click={() => handleEditUser(user)}
                  class="text-primary hover:text-primary/80 p-1" 
                  title="Edit user"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button 
                  on:click={() => deleteUser(user.id)}
                  class="text-red-600 hover:text-red-800 p-1" 
                  title="Delete user"
                >
                  <Trash class="w-4 h-4" />
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Create User Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('CreateUser') || 'Create User'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={submitCreateUser} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('FirstName') || 'First Name'} *
            </label>
            <input
              type="text"
              bind:value={createForm.first_name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('LastName') || 'Last Name'} *
            </label>
            <input
              type="text"
              bind:value={createForm.last_name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

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
            {$t('Password') || 'Password'} *
          </label>
          <input
            type="password"
            bind:value={createForm.password}
            required
            minlength="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Role') || 'Role'} *
          </label>
          <select
            bind:value={createForm.role_name}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="USER">{$t('User') || 'User'}</option>
            <option value="ADMIN">{$t('Administrator') || 'Administrator'}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('PhoneNumber') || 'Phone Number'}
          </label>
          <input
            type="tel"
            bind:value={createForm.phone_number}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('BirthDate') || 'Birth Date'}
          </label>
          <input
            type="date"
            bind:value={createForm.birthdate}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Gender') || 'Gender'}
            </label>
            <select
              bind:value={createForm.gender}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{$t('SelectGender') || 'Select Gender'}</option>
              <option value="male">{$t('Male') || 'Male'}</option>
              <option value="female">{$t('Female') || 'Female'}</option>
              <option value="other">{$t('Other') || 'Other'}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('ShowContentGender') || 'Show Content Gender'}
            </label>
            <select
              bind:value={createForm.show_content_gender}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{$t('SelectContentGender') || 'Select Content Gender'}</option>
              <option value="male">{$t('Male') || 'Male'}</option>
              <option value="female">{$t('Female') || 'Female'}</option>
              <option value="both">{$t('Both') || 'Both'}</option>
            </select>
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

<!-- Edit User Modal -->
{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">{$t('EditUser') || 'Edit User'}</h3>
        <button on:click={closeModals} class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form on:submit|preventDefault={submitEditUser} class="p-6 space-y-4">
        {#if modalError}
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-800 text-sm">{modalError}</p>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('FirstName') || 'First Name'} *
            </label>
            <input
              type="text"
              bind:value={editForm.first_name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('LastName') || 'Last Name'} *
            </label>
            <input
              type="text"
              bind:value={editForm.last_name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Email') || 'Email'} *
          </label>
          <input
            type="email"
            bind:value={editForm.email}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('Role') || 'Role'} *
          </label>
          <select
            bind:value={editForm.role_name}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="USER">{$t('User') || 'User'}</option>
            <option value="ADMIN">{$t('Administrator') || 'Administrator'}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('PhoneNumber') || 'Phone Number'}
          </label>
          <input
            type="tel"
            bind:value={editForm.phone_number}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {$t('BirthDate') || 'Birth Date'}
          </label>
          <input
            type="date"
            bind:value={editForm.birthdate}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('Gender') || 'Gender'}
            </label>
            <select
              bind:value={editForm.gender}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{$t('SelectGender') || 'Select Gender'}</option>
              <option value="male">{$t('Male') || 'Male'}</option>
              <option value="female">{$t('Female') || 'Female'}</option>
              <option value="other">{$t('Other') || 'Other'}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {$t('ShowContentGender') || 'Show Content Gender'}
            </label>
            <select
              bind:value={editForm.show_content_gender}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{$t('SelectContentGender') || 'Select Content Gender'}</option>
              <option value="male">{$t('Male') || 'Male'}</option>
              <option value="female">{$t('Female') || 'Female'}</option>
              <option value="both">{$t('Both') || 'Both'}</option>
            </select>
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