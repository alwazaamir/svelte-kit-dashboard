<script>
import { BarChart3, DollarSign, PieChart, Users, Download } from 'lucide-svelte';
import { activeAnalyticsTab, analyticsData } from '$lib/stores/salon.js';
import { formatPrice, exportAnalytics } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-gray-900">{$t('AnalyticsDashboard')}</h2>
    <button on:click={exportAnalytics} class="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
      <Download class="w-4 h-4" />
      <span>{$t('Export')}</span>
    </button>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="text-center p-4 bg-gray-50 rounded-lg">
      <div class="text-2xl font-bold text-green-600">{formatPrice($analyticsData.revenue.monthly)}</div>
      <div class="text-sm text-gray-600">{$t('MonthlyRevenue')}</div>
    </div>
    <div class="text-center p-4 bg-gray-50 rounded-lg">
      <div class="text-2xl font-bold text-blue-600">{$analyticsData.clientRetention}%</div>
      <div class="text-sm text-gray-600">{$t('ClientRetention')}</div>
    </div>
    <div class="text-center p-4 bg-gray-50 rounded-lg">
      <div class="text-2xl font-bold text-primary">{formatPrice($analyticsData.averageSpending)}</div>
      <div class="text-sm text-gray-600">{$t('AverageSpending')}</div>
    </div>
  </div>
</div>
