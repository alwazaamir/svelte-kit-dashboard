<script>
import { Save, Settings as SettingsIcon, Clock, Mail, Phone, Globe, CreditCard, Bell } from 'lucide-svelte';
import { salonSettings, activeSettingsTab, userRole, rolePermissions } from '$lib/stores/salon.js';
import { saveSettings, getDayName } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';

  // Check permissions
  $: canEdit = $rolePermissions[$userRole]?.canEditSettings || false;

  const settingsTabs = [
    { id: 'general', label: 'GeneralTab', icon: SettingsIcon },
    { id: 'business', label: 'BusinessTab', icon: Clock },
    { id: 'notifications', label: 'NotificationsTab', icon: Bell },
    { id: 'appearance', label: 'AppearanceTab', icon: Globe }
  ];

  function handleSaveSettings() {
    if (canEdit) {
      saveSettings();
    } else {
      alert($t('NoEditSettingsPermission'));
    }
  }

  function formatWorkingHours(timeStr) {
    if (timeStr === 'closed') return $t('Closed');
    return timeStr;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{$t('Settings')}</h2>
      <p class="text-gray-600">{$t('ManageSalonSettings')}</p>
    </div>
    
    {#if canEdit}
      <button 
        on:click={handleSaveSettings}
        class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Save class="w-4 h-4 mr-2" />
        {$t('SaveSettings')}
      </button>
    {/if}
  </div>

  <!-- Settings Tabs -->
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8 px-6">
        {#each settingsTabs as tab}
          <button
            on:click={() => activeSettingsTab.set(tab.id)}
            class={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              $activeSettingsTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div class="flex items-center space-x-2">
              <svelte:component this={tab.icon} class="w-4 h-4" />
              <span>{$t(tab.label)}</span>
            </div>
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      {#if $activeSettingsTab === 'general'}
        <!-- General Settings -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">{$t('GeneralInfo')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('SalonName')}</label>
              <input 
                type="text" 
                bind:value={$salonSettings.general.salonName}
                disabled={!canEdit}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('Phone')}</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="tel" 
                  bind:value={$salonSettings.general.phone}
                  disabled={!canEdit}
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('Email')}</label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="email" 
                  bind:value={$salonSettings.general.email}
                  disabled={!canEdit}
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('Website')}</label>
              <div class="relative">
                <Globe class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="url" 
                  bind:value={$salonSettings.general.website}
                  disabled={!canEdit}
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{$t('Address')}</label>
            <textarea 
              bind:value={$salonSettings.general.address}
              disabled={!canEdit}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            ></textarea>
          </div>
        </div>

      {:else if $activeSettingsTab === 'business'}
        <!-- Business Settings -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">{$t('WorkingHours')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each Object.entries($salonSettings.business.workingHours) as [day, hours]}
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <span class="font-medium text-gray-900">{getDayName(day)}</span>
                <input
                  type="text"
                  bind:value={$salonSettings.business.workingHours[day]}
                  disabled={!canEdit}
                  placeholder={$t('WorkingHoursPlaceholder')}
                  class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            {/each}
          </div>

          <h3 class="text-lg font-semibold text-gray-900 pt-6">{$t('BookingSettings')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('AdvanceBookingDays')}</label>
              <input 
                type="number" 
                bind:value={$salonSettings.business.bookingSettings.advanceBookingDays}
                disabled={!canEdit}
                min="1" max="365"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('CancellationHours')}</label>
              <input 
                type="number" 
                bind:value={$salonSettings.business.bookingSettings.cancellationHours}
                disabled={!canEdit}
                min="1" max="168"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              bind:checked={$salonSettings.business.bookingSettings.allowOnlineBooking}
              disabled={!canEdit}
              id="onlineBooking"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
            />
            <label for="onlineBooking" class="ml-2 block text-sm text-gray-900">
              {$t('EnableOnlineBooking')}
            </label>
          </div>
        </div>

      {:else if $activeSettingsTab === 'notifications'}
        <!-- Notifications Settings -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">{$t('NotificationsTab')}</h3>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={$salonSettings.notifications.emailNotifications}
                disabled={!canEdit}
                id="emailNotifications"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
              />
              <label for="emailNotifications" class="ml-2 block text-sm text-gray-900">
                {$t('EmailNotifications')}
              </label>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={$salonSettings.notifications.smsNotifications}
                disabled={!canEdit}
                id="smsNotifications"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
              />
              <label for="smsNotifications" class="ml-2 block text-sm text-gray-900">
                {$t('SMSNotifications')}
              </label>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={$salonSettings.notifications.appointmentReminders}
                disabled={!canEdit}
                id="appointmentReminders"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
              />
              <label for="appointmentReminders" class="ml-2 block text-sm text-gray-900">
                {$t('AppointmentReminders')}
              </label>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                bind:checked={$salonSettings.notifications.promotionalEmails}
                disabled={!canEdit}
                id="promotionalEmails"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded disabled:opacity-50"
              />
              <label for="promotionalEmails" class="ml-2 block text-sm text-gray-900">
                {$t('PromotionalEmails')}
              </label>
            </div>
          </div>
        </div>

      {:else if $activeSettingsTab === 'appearance'}
        <!-- Appearance Settings -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900">{$t('AppAppearance')}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('Theme')}</label>
              <select 
                bind:value={$salonSettings.appearance.theme}
                disabled={!canEdit}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                <option value="light">{$t('Light')}</option>
                <option value="dark">{$t('Dark')}</option>
                <option value="auto">{$t('Auto')}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{$t('PrimaryColor')}</label>
              <div class="flex items-center space-x-3">
                <input 
                  type="color" 
                  bind:value={$salonSettings.appearance.primaryColor}
                  disabled={!canEdit}
                  class="h-10 w-20 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
                />
                <input 
                  type="text" 
                  bind:value={$salonSettings.appearance.primaryColor}
                  disabled={!canEdit}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if !canEdit}
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex">
        <Bell class="w-5 h-5 text-yellow-400 mr-2" />
        <div>
          <p class="text-sm text-yellow-800">
            <strong>{$t('Note')}:</strong> {$t('NoPermissionSettings')}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
