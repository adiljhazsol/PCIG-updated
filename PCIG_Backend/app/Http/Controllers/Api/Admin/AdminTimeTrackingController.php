<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AdminTimeTrackingController extends Controller
{
    /**
     * Get dashboard data for Time Tracking & Worker Hours
     */
    public function dashboardData(Request $request): JsonResponse
    {
        try {
            // 1. Header
            $header = [
                'title' => 'Worker Hours & Time Tracking',
                'subtitle' => 'Monitor contractor hours, approve timesheets, and track project costs.',
                'actionButtons' => [
                    'export' => ['label' => 'Export Report', 'icon' => 'Download'],
                    'logHours' => ['label' => 'Log Hours', 'icon' => 'Plus']
                ]
            ];

            // 2. Summary Cards Calculations
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();
            $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
            $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();

            // Total Hours (This Week)
            $hoursThisWeek = TimeEntry::whereBetween('date', [$startOfWeek, $endOfWeek])->sum('hours');
            $hoursLastWeek = TimeEntry::whereBetween('date', [$lastWeekStart, $lastWeekEnd])->sum('hours');
            $hoursTrend = $hoursLastWeek > 0 ? (($hoursThisWeek - $hoursLastWeek) / $hoursLastWeek) * 100 : 0;
            $hoursTrendStr = ($hoursTrend >= 0 ? '+' : '') . round($hoursTrend, 1) . '% vs last week';

            // Pending Approval
            $pendingCount = TimeEntry::where('status', 'pending')->count(); 

            // Active Workers (unique users with entries this week)
            $activeWorkers = TimeEntry::whereBetween('date', [$startOfWeek, $endOfWeek])->distinct('user_id')->count();

            // Total Cost (This Week) - Placeholder
            $totalCost = 0; 
            
            $summaryCards = [
                [
                    'label' => 'Total Hours (This Week)',
                    'value' => number_format($hoursThisWeek, 1),
                    'trend' => $hoursTrendStr,
                    'icon' => 'Clock',
                    'color' => '#3B82F6'
                ],
                [
                    'label' => 'Pending Approval',
                    'value' => (string)$pendingCount,
                    'trend' => 'Requires review',
                    'icon' => 'AlertCircle',
                    'color' => '#F59E0B'
                ],
                [
                    'label' => 'Active Workers',
                    'value' => (string)$activeWorkers,
                    'trend' => 'Active this week',
                    'icon' => 'Users',
                    'color' => '#10B981'
                ],
                [
                    'label' => 'Total Cost',
                    'value' => '$' . number_format($totalCost, 2),
                    'trend' => 'This week',
                    'icon' => 'DollarSign',
                    'color' => '#6366F1'
                ]
            ];

            // 3. Tabs
            $tabs = [
                ['id' => 'all', 'label' => 'All Entries', 'active' => true],
                ['id' => 'pending', 'label' => 'Pending Approval', 'active' => false],
                ['id' => 'approved', 'label' => 'Approved', 'active' => false],
                ['id' => 'rejected', 'label' => 'Rejected', 'active' => false]
            ];

            // 4. Search and Filters
            $projects = \App\Models\Property::select('address')->distinct()->pluck('address')->toArray();
            $workers = User::whereHas('timeEntries')->select('name')->distinct()->pluck('name')->toArray();

            $searchAndFilters = [
                'searchPlaceholder' => 'Search by worker, project, or task...',
                'filters' => [
                    ['label' => 'Project', 'options' => array_merge(['All'], $projects)],
                    ['label' => 'Worker', 'options' => array_merge(['All'], $workers)],
                    ['label' => 'Status', 'options' => ['All', 'Pending', 'Approved', 'Rejected']]
                ]
            ];

            // 5. Time Entries Table
            $entries = TimeEntry::with(['user', 'property'])
                ->latest('date')
                ->limit(50)
                ->get()
                ->map(function ($entry) {
                    // Mock status/rate if not in DB
                    $status = $entry->status ?? 'Approved'; 
                    $rate = optional($entry->user)->hourly_rate ?? 35; // Fallback rate
                    $total = $entry->hours * $rate;
                    
                    $statusColors = [
                        'Pending' => ['color' => '#F59E0B', 'bg' => '#FEF3C7'],
                        'Approved' => ['color' => '#10B981', 'bg' => '#DCFCE7'],
                        'Rejected' => ['color' => '#EF4444', 'bg' => '#FEE2E2'],
                    ];
                    $color = $statusColors[$status] ?? $statusColors['Approved'];

                    return [
                        'id' => (string)$entry->id,
                        'worker' => $entry->user ? $entry->user->name : 'Unknown',
                        'workerAvatar' => 'https://ui-avatars.com/api/?name=' . urlencode($entry->user ? $entry->user->name : 'Unknown') . '&background=random',
                        'task' => $entry->description ? Str::limit($entry->description, 30) : 'General Labor',
                        'project' => $entry->property ? $entry->property->address : 'General',
                        'hours' => (float)$entry->hours,
                        'rate' => $rate,
                        'total' => $total,
                        'date' => $entry->date->format('M d, Y'),
                        'status' => $status,
                        'statusColor' => $color['color'],
                        'statusBg' => $color['bg'],
                        'selected' => false,
                        'description' => $entry->description,
                        'images' => []
                    ];
                });

            $timeEntriesTable = [
                'headers' => ['', 'Worker', 'Task', 'Project', 'Hours', 'Rate', 'Total', 'Date', 'Status', ''],
                'rows' => $entries
            ];

            // 6. Detail Panel Configuration
            $detailPanel = [
                'varianceWarning' => [
                    'icon' => 'AlertTriangle',
                    'message' => 'Hours exceed daily average'
                ],
                'actions' => [
                    'approve' => ['label' => 'Approve', 'icon' => 'Check'],
                    'reject' => ['label' => 'Reject', 'icon' => 'X'],
                    'requestClarification' => ['label' => 'Request Info', 'icon' => 'MessageCircle']
                ]
            ];

            return response()->json([
                'timeTrackingWorkerHours' => [
                    'header' => $header,
                    'summaryCards' => $summaryCards,
                    'tabs' => $tabs,
                    'searchAndFilters' => $searchAndFilters,
                    'timeEntriesTable' => $timeEntriesTable,
                    'detailPanel' => $detailPanel
                ]
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('TimeTracking Dashboard Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
