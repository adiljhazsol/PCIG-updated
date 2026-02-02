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

            // Total Cost (This Week)
            $totalCost = TimeEntry::whereBetween('date', [$startOfWeek, $endOfWeek])
                ->with('user')
                ->get()
                ->sum(function ($entry) {
                    return $entry->hours * ($entry->user->hourly_rate ?? 0);
                });
            
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
            $query = TimeEntry::with(['user', 'property'])->latest('date');

            // Apply Filters
            if ($request->filled('worker') && $request->worker !== 'All') {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('name', $request->worker);
                });
            }

            if ($request->filled('project') && $request->project !== 'All') {
                $query->whereHas('property', function ($q) use ($request) {
                    $q->where('address', $request->project);
                });
            }

            if ($request->filled('status') && $request->status !== 'All') {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('property', function ($p) use ($search) {
                        $p->where('address', 'like', "%{$search}%");
                    })
                    ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $entries = $query->limit(50)
                ->get()
                ->map(function ($entry) {
                    $status = $entry->status ?? 'Approved'; 
                    $rate = $entry->user->hourly_rate ?? 0;
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0.1',
            'description' => 'nullable|string',
        ]);

        $entry = TimeEntry::create([
            'user_id' => $validated['user_id'],
            'property_id' => $validated['property_id'],
            'date' => $validated['date'],
            'hours' => $validated['hours'],
            'description' => $validated['description'],
            'status' => 'Pending',
            'billable' => true,
        ]);

        return response()->json(['message' => 'Time entry created successfully', 'entry' => $entry]);
    }

    public function approve($id): JsonResponse
    {
        $entry = TimeEntry::findOrFail($id);
        $entry->update(['status' => 'Approved']);
        return response()->json(['message' => 'Time entry approved']);
    }

    public function reject($id): JsonResponse
    {
        $entry = TimeEntry::findOrFail($id);
        $entry->update(['status' => 'Rejected']);
        return response()->json(['message' => 'Time entry rejected']);
    }

    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Worker', 'Project', 'Date', 'Hours', 'Rate', 'Total', 'Status', 'Description']);

            TimeEntry::with(['user', 'property'])->chunk(100, function ($entries) use ($handle) {
                foreach ($entries as $entry) {
                    $rate = $entry->user->hourly_rate ?? 0;
                    fputcsv($handle, [
                        $entry->id,
                        $entry->user->name ?? 'Unknown',
                        $entry->property->address ?? 'General',
                        $entry->date->format('Y-m-d'),
                        $entry->hours,
                        $rate,
                        $entry->hours * $rate,
                        $entry->status,
                        $entry->description
                    ]);
                }
            });

            fclose($handle);
        }, 'time-tracking-report-' . now()->format('Y-m-d') . '.csv');
    }

    public function listUsersDropdown(): JsonResponse
    {
        $users = User::select('id', 'name')->orderBy('name')->get();
        return response()->json($users);
    }
}
