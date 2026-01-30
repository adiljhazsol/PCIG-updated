<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminAuditLogController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Calculate summary stats
        $totalEvents = ActivityLog::count();
        $todayEvents = ActivityLog::whereDate('created_at', Carbon::today())->count();
        // Mock error rate as we don't have a status column in standard activity log usually, unless properties['status'] exists
        // Assuming log_name 'error' or description containing 'failed' counts as error
        $errorCount = ActivityLog::where('description', 'like', '%fail%')
            ->orWhere('description', 'like', '%error%')
            ->count();
        $errorRate = $totalEvents > 0 ? round(($errorCount / $totalEvents) * 100, 1) . '%' : '0%';

        $logs = ActivityLog::with('causer')
            ->latest()
            ->limit(50) // Limit for dashboard view
            ->get()
            ->map(function ($log) {
                // User Initials
                $userName = $log->causer ? $log->causer->name : 'System';
                $initials = collect(explode(' ', $userName))->map(fn($s) => strtoupper(substr($s, 0, 1)))->take(2)->implode('');
                
                // Action Type Logic
                $actionLabel = 'Action';
                $actionBg = '#F1F5F9';
                $actionColor = '#64748B';
                
                $descLower = strtolower($log->description);
                if (str_contains($descLower, 'create') || str_contains($descLower, 'add')) {
                    $actionLabel = 'Create';
                    $actionBg = '#DCFCE7';
                    $actionColor = '#16A34A';
                } elseif (str_contains($descLower, 'update') || str_contains($descLower, 'edit')) {
                    $actionLabel = 'Update';
                    $actionBg = '#DBEAFE';
                    $actionColor = '#2563EB';
                } elseif (str_contains($descLower, 'delete') || str_contains($descLower, 'remove')) {
                    $actionLabel = 'Delete';
                    $actionBg = '#FEE2E2';
                    $actionColor = '#DC2626';
                } elseif (str_contains($descLower, 'login') || str_contains($descLower, 'logged')) {
                    $actionLabel = 'Login';
                    $actionBg = '#F3E8FF';
                    $actionColor = '#9333EA';
                }

                return [
                    'id' => $log->id,
                    'timestamp' => [
                        'date' => $log->created_at->format('M d, Y'),
                        'time' => $log->created_at->format('h:i A')
                    ],
                    'user' => [
                        'name' => $userName,
                        'initials' => $initials,
                        'bg' => '#F1F5F9', // Default, could be dynamic
                        'color' => '#475569'
                    ],
                    'actionType' => [
                        'label' => $actionLabel,
                        'bg' => $actionBg,
                        'color' => $actionColor
                    ],
                    'description' => [
                        'title' => ucfirst($log->description),
                        'subtitle' => $log->subject_type ? class_basename($log->subject_type) . ' #' . $log->subject_id : 'System Event'
                    ],
                    'entity' => [
                        'primary' => $log->subject_type ? class_basename($log->subject_type) : 'System',
                        'secondary' => $log->subject_id ? 'ID: ' . $log->subject_id : null
                    ],
                    'status' => [
                        'label' => 'Success', // Mock
                        'color' => '#16A34A'
                    ]
                ];
            });

        return response()->json([
            'auditLog' => [
                'header' => [
                    'title' => 'System Audit Log',
                    'subtitle' => 'Track all user activities, system events, and data changes'
                ],
                'searchPlaceholder' => 'Search by user, action, or details...',
                'filters' => [
                    [
                        'label' => 'All Actions',
                        'options' => ['Login', 'Update', 'Delete', 'Create', 'Export'],
                        'icon' => 'Filter'
                    ],
                    [
                        'label' => 'All Users',
                        'options' => ['Admin', 'Manager', 'Investor', 'System'],
                        'icon' => 'Users'
                    ],
                    [
                        'label' => 'Date Range',
                        'options' => ['Today', 'Last 7 Days', 'Last 30 Days', 'Custom'],
                        'icon' => 'Calendar'
                    ]
                ],
                'summary' => [
                    'label' => 'Total Events: ' . number_format($totalEvents),
                    'value' => (string)$totalEvents
                ],
                'tableHeaders' => [
                    ['label' => 'Timestamp', 'width' => '180px'],
                    ['label' => 'User', 'width' => '200px'],
                    ['label' => 'Action', 'width' => '150px'],
                    ['label' => 'Details', 'width' => '300px'],
                    ['label' => 'Module', 'width' => '150px'],
                    ['label' => 'Status', 'width' => '100px'],
                    ['label' => '', 'width' => '50px']
                ],
                'rows' => $logs
            ]
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('causer');

        if ($request->has('user_id')) {
            $query->where('causer_id', $request->user_id)
                  ->where('causer_type', 'App\Models\User');
        }

        if ($request->has('action_type')) {
            $query->where('description', 'like', '%' . $request->action_type . '%');
        }

        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('created_at', [$request->date_from, $request->date_to]);
        }

        return response()->json($query->latest()->paginate(20));
    }
}
