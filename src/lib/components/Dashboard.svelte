<script>
import { onMount } from 'svelte';
import { Calendar, DollarSign, Users, TrendingUp, Plus, MoreVertical, RefreshCw } from 'lucide-svelte';
import { formatPrice, getStatusClass, getStatusIcon, formatShortDate } from '$lib/utils/helpers.js';
import { t } from 'svelte-i18n';
import { API_URL } from '$lib/config.js';

// Reactive variables for dashboard data
let allAppointments = { appointments: [], total: 0 };
let loading = true;
let error = null;
export let admin;

// UI state
let selectedDate = formatShortDate();
let pagination = { page: 1, page_size: 20 };

// Helper function to make authenticated API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}/api/appointments/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${admin.accessToken}`,
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error('API Call failed:', err);
        throw err;
    }
}

// Load dashboard data for admin
async function loadDashboardData() {
    loading = true;
    error = null;

    try {
        // Get all scheduled appointments (admin endpoint)
        const appointmentsRes = await apiCall(`/admin/appointments/scheduled?page=${pagination.page}&page_size=${pagination.page_size}`);
        allAppointments = appointmentsRes.data || { appointments: [], total: 0 };

    } catch (err) {
        error = err.message;
        console.error('Failed to load dashboard data:', err);
    } finally {
        loading = false;
    }
}

// Format appointment data for display
function formatAppointmentForDisplay(appointment) {
    return {
        id: appointment.id,
        clientName: appointment.customer_name || 'Unknown Client',
        phone: appointment.phone || 'N/A',
        service: appointment.service_name || 'Unknown Service',
        time: appointment.start_time,
        date: appointment.appointment_date,
        duration: appointment.duration,
        stylist: appointment.employee_name || 'Unknown Employee',
        status: appointment.status,
        price: appointment.price,
        salonName: appointment.salon_name || 'Unknown Salon',
        locationName: appointment.location_name || 'Unknown Location'
    };
}

// Calculate stats from all appointments
function calculateStats(appointments) {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Today's appointments
    const todayAppointments = appointments.filter(apt => 
        apt.appointment_date.split('T')[0] === today
    );
    
    // Today's revenue (completed appointments only)
    const todayRevenue = todayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Monthly revenue (completed appointments only)
    const monthlyRevenue = appointments
        .filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.getMonth() + 1 === currentMonth && 
                   aptDate.getFullYear() === currentYear &&
                   apt.status === 'completed';
        })
        .reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    // Unique clients
    const uniqueClients = new Set(appointments.map(apt => apt.user_id)).size;
    
    return {
        todayAppointments: todayAppointments.length,
        todayRevenue: todayRevenue,
        totalClients: uniqueClients,
        monthlyRevenue: monthlyRevenue,
        totalAppointments: appointments.length
    };
}

// Handle appointment actions
async function handleAppointmentAction(appointmentId, action) {
    try {
        if (action === 'reschedule') {
            console.log('Reschedule appointment:', appointmentId);
            // Implement reschedule logic
        } else if (action === 'cancel') {
            const reason = prompt('Please provide a reason for cancellation:');
            if (reason) {
                await apiCall(`/admin/appointments/${appointmentId}/schedule`, {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        action: 'cancel',
                        reason: reason 
                    })
                });
                await loadDashboardData(); // Refresh data
            }
        } else if (action === 'complete') {
            await apiCall(`/admin/appointments/${appointmentId}/schedule`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    action: 'complete',
                    reason: 'Service completed' 
                })
            });
            await loadDashboardData(); // Refresh data
        }
    } catch (err) {
        console.error('Failed to perform action:', err);
        alert('Failed to perform action. Please try again.');
    }
}

// Handle new appointment creation
function handleNewAppointment() {
    console.log('Create new appointment');
    // Navigate to new appointment creation page
}

// Refresh data
async function refreshData() {
    await loadDashboardData();
}

// Load more appointments (pagination)
async function loadMore() {
    pagination.page += 1;
    const newData = await apiCall(`/admin/appointments/scheduled?page=${pagination.page}&page_size=${pagination.page_size}`);
    if (newData.data && newData.data.appointments) {
        allAppointments.appointments = [...allAppointments.appointments, ...newData.data.appointments];
        allAppointments = allAppointments; // Trigger reactivity
    }
}

// Load data on component mount
onMount(() => {
    loadDashboardData();
});

// Computed values
$: stats = calculateStats(allAppointments.appointments || []);
$: formattedAppointments = (allAppointments.appointments || []).map(formatAppointmentForDisplay);
$: todayAppointments = formattedAppointments.filter(apt => 
    apt.date.split('T')[0] === new Date().toISOString().split('T')[0]
);
</script>

<!-- Loading State -->
{#if loading && allAppointments.appointments.length === 0}
<div class="flex items-center justify-center h-64">
    <div class="flex items-center space-x-2">
        <RefreshCw class="w-6 h-6 animate-spin text-primary" />
        <span class="text-gray-600">{$t('LoadingDashboard', { default: 'Loading dashboard...' })}</span>
    </div>
</div>
{:else if error}
<!-- Error State -->
<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div class="flex items-center justify-between">
        <div>
            <h3 class="text-red-800 font-medium">{$t('ErrorLoadingDashboard', { default: 'Error loading dashboard' })}</h3>
            <p class="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <button 
            on:click={refreshData}
            class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
        >
            {$t('Retry', { default: 'Retry' })}
        </button>
    </div>
</div>
{:else}
<!-- Main Dashboard Content -->

<!-- Header with refresh button -->
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900">{$t('AdminDashboard', { default: 'Admin Dashboard' })}</h1>
    <button 
        on:click={refreshData}
        class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
    >
        <RefreshCw class="w-4 h-4" />
        <span class="text-sm">{$t('Refresh', { default: 'Refresh' })}</span>
    </button>
</div>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">{$t('TodaysAppointments', { default: "Today's Appointments" })}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{stats.todayAppointments}</p>
                <p class="text-xs text-gray-500 mt-1">
                    {$t('AcrossAllSalons', { default: 'Across all salons' })}
                </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar class="w-6 h-6 text-blue-600" />
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">{$t('TodaysRevenue', { default: "Today's Revenue" })}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{formatPrice(stats.todayRevenue)}</p>
                <p class="text-xs text-gray-500 mt-1">
                    {$t('CompletedAppointments', { default: 'Completed appointments' })}
                </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign class="w-6 h-6 text-green-600" />
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">{$t('TotalClients', { default: 'Total Clients' })}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
                <p class="text-xs text-gray-500 mt-1">
                    {$t('UniqueCustomers', { default: 'Unique customers' })}
                </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users class="w-6 h-6 text-purple-600" />
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">{$t('MonthlyRevenue', { default: 'Monthly Revenue' })}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{formatPrice(stats.monthlyRevenue)}</p>
                <p class="text-xs text-gray-500 mt-1">
                    {$t('CurrentMonth', { default: 'Current month' })}
                </p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp class="w-6 h-6 text-orange-600" />
            </div>
        </div>
    </div>
</div>

<!-- Today's Appointments -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
    <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
                {$t('TodaysSchedule', { default: "Today's Schedule" })} - {selectedDate}
            </h2>
            <button 
                on:click={handleNewAppointment}
                class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
            >
                <Plus class="w-4 h-4" />
                <span>{$t('NewAppointment', { default: 'New Appointment' })}</span>
            </button>
        </div>
    </div>
    
    {#if todayAppointments.length === 0}
        <div class="p-8 text-center">
            <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                {$t('NoAppointmentsToday', { default: 'No appointments today' })}
            </h3>
            <p class="text-gray-600 mb-4">
                {$t('NoAppointmentsTodayDesc', { default: 'No appointments scheduled for today across all salons' })}
            </p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Client', { default: 'Client' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Salon', { default: 'Salon' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Service', { default: 'Service' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Time', { default: 'Time' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Stylist', { default: 'Stylist' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Status', { default: 'Status' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Price', { default: 'Price' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Actions', { default: 'Actions' })}
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each todayAppointments as appointment}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{appointment.clientName}</div>
                                    <div class="text-sm text-gray-500">{appointment.phone}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{appointment.salonName}</div>
                                    <div class="text-sm text-gray-500">{appointment.locationName}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900">{appointment.service}</td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                {appointment.time} ({appointment.duration}min)
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900">{appointment.stylist}</td>
                            <td class="px-6 py-4">
                                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                                    <svelte:component this={getStatusIcon(appointment.status)} class="w-3 h-3 mr-1" />
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">
                                {formatPrice(appointment.price)}
                            </td>
                            <td class="px-6 py-4">
                                <div class="relative">
                                    <button 
                                        class="p-1 hover:bg-gray-100 rounded"
                                        on:click={() => {
                                            // Show action menu - you can implement a proper dropdown
                                            if (confirm(`What would you like to do with this appointment?\n\n1. Complete\n2. Cancel\n3. Reschedule`)) {
                                                handleAppointmentAction(appointment.id, 'complete');
                                            }
                                        }}
                                    >
                                        <MoreVertical class="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>

<!-- All Appointments Overview -->
<div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
                {$t('AllScheduledAppointments', { default: 'All Scheduled Appointments' })}
            </h2>
            <div class="text-sm text-gray-500">
                {$t('Showing', { default: 'Showing' })} {allAppointments.appointments?.length || 0} 
                {$t('of', { default: 'of' })} {allAppointments.total || 0}
            </div>
        </div>
    </div>
    
    {#if formattedAppointments.length === 0}
        <div class="p-8 text-center">
            <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                {$t('NoScheduledAppointments', { default: 'No scheduled appointments' })}
            </h3>
            <p class="text-gray-600">
                {$t('NoScheduledAppointmentsDesc', { default: 'There are no scheduled appointments in the system' })}
            </p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Date', { default: 'Date' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Client', { default: 'Client' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Salon', { default: 'Salon' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Service', { default: 'Service' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Time', { default: 'Time' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Status', { default: 'Status' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Price', { default: 'Price' })}
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {$t('Actions', { default: 'Actions' })}
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each formattedAppointments as appointment}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 text-sm text-gray-900">
                                {new Date(appointment.date).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{appointment.clientName}</div>
                                    <div class="text-sm text-gray-500">{appointment.phone}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{appointment.salonName}</div>
                                    <div class="text-sm text-gray-500">{appointment.locationName}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900">{appointment.service}</td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                {appointment.time} ({appointment.duration}min)
                            </td>
                            <td class="px-6 py-4">
                                <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(appointment.status)}`}>
                                    <svelte:component this={getStatusIcon(appointment.status)} class="w-3 h-3 mr-1" />
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">
                                {formatPrice(appointment.price)}
                            </td>
                            <td class="px-6 py-4">
                                <div class="relative">
                                    <button 
                                        class="p-1 hover:bg-gray-100 rounded"
                                        on:click={() => {
                                            console.log('Show actions for appointment:', appointment.id);
                                        }}
                                    >
                                        <MoreVertical class="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <!-- Load More Button -->
        {#if allAppointments.appointments?.length < allAppointments.total}
            <div class="p-4 border-t border-gray-100 text-center">
                <button 
                    on:click={loadMore}
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    disabled={loading}
                >
                    {#if loading}
                        <RefreshCw class="w-4 h-4 animate-spin inline mr-2" />
                    {/if}
                    {$t('LoadMore', { default: 'Load More' })}
                </button>
            </div>
        {/if}
    {/if}
</div>
{/if}