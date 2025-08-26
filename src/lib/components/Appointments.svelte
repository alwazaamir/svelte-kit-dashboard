<script>
import { Search, Plus } from 'lucide-svelte';
import { appointments } from '$lib/stores/salon.js';
import { formatPrice, getStatusClass } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100">
  <div class="p-6 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">{$t('AllAppointments')}</h2>
      <button class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
        <Plus class="w-4 h-4" />
        <span>{$t('NewAppointment')}</span>
      </button>
    </div>
  </div>
  
  <div class="p-6">
    <div class="space-y-4">
      {#each $appointments as appointment}
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">{appointment.clientName}</h3>
              <p class="text-sm text-gray-600">{appointment.service}</p>
              <p class="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
            </div>
            <div class="text-right">
              <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                {appointment.status}
              </span>
              <p class="font-semibold text-gray-900 mt-1">{formatPrice(appointment.price)}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
