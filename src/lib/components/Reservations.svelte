<script>
import { onMount } from 'svelte';
import { Calendar, Plus, Search, Phone, CheckCircle, XCircle, Clock, MapPin, User, Loader, ChevronLeft, ChevronRight } from 'lucide-svelte';
import { reservations, rolePermissions, userRole } from '$lib/stores/salon.js';
import { t } from 'svelte-i18n';
import { API_URL } from '$lib/config.js';
  
  let searchTerm = '';
  let loading = false;
  let error = null;
  let appointments = [];
  let pagination = {
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0
  };

  export let admin;
  
  $: filteredAppointments = appointments.filter(appointment => {
    return (appointment.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.salon_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  $: canEdit = $rolePermissions[$userRole]?.canEditReservations || false;

  async function fetchAppointments(page = 1) {
    loading = true;
    error = null;

    try {
      const response = await fetch(`${API_URL}/api/appointments/api/admin/appointments/scheduled?page=${page}&page_size=${pagination.page_size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        appointments = data.data.appointments || [];
        pagination = data.data.pagination || pagination;
      } else {
        appointments = [];
      }
      
    } catch (err) {
      console.error('Error fetching appointments:', err);
      error = err.message;
      appointments = [];
    } finally {
      loading = false;
    }
  }

  function handleRefresh() {
    fetchAppointments(pagination.page);
  }

  function goToPage(page) {
    if (page >= 1 && page <= pagination.total_pages) {
      fetchAppointments(page);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD'
    }).format(price);
  }

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return $t('Confirmed') || 'Confirmed';
      case 'pending':
        return $t('Pending') || 'Pending';
      case 'cancelled':
        return $t('Cancelled') || 'Cancelled';
      case 'completed':
        return $t('Completed') || 'Completed';
      case 'no_show':
        return $t('NoShow') || 'No Show';
      default:
        return status || 'Unknown';
    }
  }

  // Fetch appointments when component mounts
  onMount(() => {
    fetchAppointments();
  });
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('Reservations')}</h2>
      <p class="text-gray-600">{$t('ReservationsOverview')}</p>
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
        <button class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus class="w-4 h-4 mr-2" />
          {$t('NewReservation')}
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
          placeholder={$t('SearchReservationPlaceholder')}
          bind:value={searchTerm}
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <Loader class="w-6 h-6 animate-spin text-primary" />
        <span class="ml-2 text-gray-600">{$t('Loading') || 'Loading appointments...'}</span>
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
    {:else if filteredAppointments.length === 0}
      <div class="text-center py-8">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">
          {searchTerm ? ($t('NoAppointmentsFoundForSearch') || 'No appointments found for your search') : ($t('NoAppointmentsFound') || 'No appointments found')}
        </p>
        {#if canEdit && !searchTerm}
          <button class="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus class="w-4 h-4 mr-2" />
            {$t('CreateFirstAppointment') || 'Create first appointment'}
          </button>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredAppointments as appointment (appointment.id)}
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-4 flex-1">
                <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar class="w-6 h-6 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="font-medium text-gray-900 truncate">
                        {appointment.customer_name || 'Unknown Customer'}
                      </h3>
                      <p class="text-sm text-gray-600 truncate">
                        {appointment.service_name || 'Unknown Service'}
                      </p>
                    </div>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(appointment.status)} ml-2">
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-500">
                    <div class="flex items-center">
                      <Calendar class="w-3 h-3 mr-1 flex-shrink-0" />
                      <span class="truncate">{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div class="flex items-center">
                      <Clock class="w-3 h-3 mr-1 flex-shrink-0" />
                      <span class="truncate">{appointment.start_time} - {appointment.end_time}</span>
                    </div>
                    {#if appointment.employee_name}
                      <div class="flex items-center">
                        <User class="w-3 h-3 mr-1 flex-shrink-0" />
                        <span class="truncate">{appointment.employee_name}</span>
                      </div>
                    {/if}
                    {#if appointment.location_name}
                      <div class="flex items-center">
                        <MapPin class="w-3 h-3 mr-1 flex-shrink-0" />
                        <span class="truncate">{appointment.location_name}</span>
                      </div>
                    {/if}
                  </div>
                  
                  {#if appointment.salon_name}
                    <div class="mt-1 text-xs text-gray-400 truncate">
                      {appointment.salon_name}
                    </div>
                  {/if}
                  
                  {#if appointment.notes}
                    <div class="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  {/if}
                </div>
              </div>
              
              <div class="text-right ml-4 flex-shrink-0">
                <p class="font-medium text-gray-900">{formatPrice(appointment.price)}</p>
                <p class="text-xs text-gray-500">{appointment.duration} min</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if pagination.total_pages > 1}
        <div class="flex items-center justify-between border-t border-gray-200 pt-6">
          <div class="flex items-center text-sm text-gray-700">
            <span>
              Showing {((pagination.page - 1) * pagination.page_size) + 1} to {Math.min(pagination.page * pagination.page_size, pagination.total)} of {pagination.total} appointments
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              on:click={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div class="flex items-center space-x-1">
              {#each Array.from({ length: Math.min(pagination.total_pages, 7) }, (_, i) => {
                let start = Math.max(1, pagination.page - 3);
                let end = Math.min(pagination.total_pages, start + 6);
                start = Math.max(1, end - 6);
                return start + i;
              }) as pageNum}
                {#if pageNum <= pagination.total_pages}
                  <button
                    on:click={() => goToPage(pageNum)}
                    class="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md
                      {pageNum === pagination.page 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}"
                  >
                    {pageNum}
                  </button>
                {/if}
              {/each}
            </div>
            
            <button
              on:click={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight class="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>