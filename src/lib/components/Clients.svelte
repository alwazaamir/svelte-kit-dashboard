<script>
import { User, Plus } from 'lucide-svelte';
import { clients } from '$lib/stores/salon.js';
import { formatPrice } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100">
  <div class="p-6 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">{$t('Clients')}</h2>
      <button class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
        <Plus class="w-4 h-4" />
        <span>{$t('NewClient')}</span>
      </button>
    </div>
  </div>
  
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $clients as client}
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
              <User class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{client.name}</h3>
              <p class="text-sm text-gray-600">{client.phone}</p>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">{$t('Visits')}: {client.visits}</span>
            <span class="font-semibold text-gray-900">{formatPrice(client.totalSpent)}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
