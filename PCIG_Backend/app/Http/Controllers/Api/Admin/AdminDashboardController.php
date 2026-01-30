<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\User;
use App\Models\Task;
use App\Models\Deadline;
use App\Models\ActivityLog;
use App\Models\RedemptionTracking;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    private function formatCompactNumber($number)
    {
        if ($number >= 1000000000) {
            return number_format($number / 1000000000, 1) . 'B';
        }
        if ($number >= 1000000) {
            return number_format($number / 1000000, 1) . 'M';
        }
        if ($number >= 1000) {
            return number_format($number / 1000, 1) . 'K';
        }
        
        return number_format($number);
    }

    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Key Metrics
        $totalAssetValue = Property::sum('current_value') ?: Property::sum('purchase_price');
        $activeProperties = Property::whereNotIn('status', ['sold', 'closed'])->count();
        $activeInvestors = User::where('role_type', 'investor')->count();
        $avgRoi = Property::avg('roi') ?: 0;

        // 2. Workflow Pipeline
        $stages = [
            'new_import' => 'New Import',
            'research' => 'Research',
            'sheriff' => 'Sheriff Sale', // Changed from sheriff_sale
            'redemption' => 'Redemption',
            'barment' => 'Barment',
            'quiet_title' => 'Quiet Title',
            'reo_disposition' => 'REO/Sale', // Changed from reo_sale
            'reo_leased' => 'REO/Leased',
        ];

        $pipelineCounts = Property::select('workflow_stage', DB::raw('count(*) as total'))
            ->whereIn('workflow_stage', array_keys($stages))
            ->groupBy('workflow_stage')
            ->pluck('total', 'workflow_stage')
            ->toArray();

        // Add unassigned properties to Research count
        $unknownCount = Property::whereNull('workflow_stage')->orWhere('workflow_stage', '')->count();
        if ($unknownCount > 0) {
            $pipelineCounts['research'] = ($pipelineCounts['research'] ?? 0) + $unknownCount;
        }

        $pipelineData = [];
        foreach ($stages as $key => $label) {
            // Always show key stages, even if 0
            $pipelineData[] = [
                'value' => $pipelineCounts[$key] ?? 0,
                'label' => $label
            ];
        }

        // 3. Upcoming Deadlines (Merge Deadlines and Redemption Expirations)
        $upcomingDeadlines = [];
        
        // Manual deadlines
        $deadlines = Deadline::with('property')
            ->where('deadline_date', '>=', now())
            ->where('status', '!=', 'completed')
            ->orderBy('deadline_date')
            ->take(5)
            ->get();

        foreach ($deadlines as $deadline) {
            $diff = now()->diffInDays(Carbon::parse($deadline->deadline_date), false);
            $daysDiff = (int) ceil($diff); // Ensure integer, ceiling for partial days
            
            $daysLabel = $daysDiff . ' days';
            if ($daysDiff < 0) {
                $daysLabel = abs($daysDiff) . ' days overdue';
            } elseif ($daysDiff == 0) {
                $daysLabel = 'Today';
            }

            $upcomingDeadlines[] = [
                'property' => $deadline->property ? $deadline->property->address : 'Unknown Property',
                'type' => $deadline->type,
                'date' => Carbon::parse($deadline->deadline_date)->format('M d'),
                'days' => $daysLabel,
                'color' => $daysDiff <= 3 ? '#EF4444' : ($daysDiff <= 7 ? '#F59E0B' : '#3B82F6'),
                'raw_date' => $deadline->deadline_date
            ];
        }

        // Redemption expirations
        $redemptions = RedemptionTracking::with('property')
            ->where('redemption_deadline', '>=', now())
            ->orderBy('redemption_deadline')
            ->take(5)
            ->get();

        foreach ($redemptions as $redemption) {
            $diff = now()->diffInDays(Carbon::parse($redemption->redemption_deadline), false);
            $daysDiff = (int) ceil($diff);

            $daysLabel = $daysDiff . ' days';
            if ($daysDiff < 0) {
                $daysLabel = abs($daysDiff) . ' days overdue';
            } elseif ($daysDiff == 0) {
                $daysLabel = 'Today';
            }

            $upcomingDeadlines[] = [
                'property' => $redemption->property ? $redemption->property->address : 'Unknown Property',
                'type' => 'Redemption Expiry',
                'date' => Carbon::parse($redemption->redemption_deadline)->format('M d'),
                'days' => $daysLabel,
                'color' => $daysDiff <= 3 ? '#EF4444' : ($daysDiff <= 7 ? '#F59E0B' : '#3B82F6'),
                'raw_date' => $redemption->redemption_deadline
            ];
        }

        // Sort merged deadlines and take top 5
        usort($upcomingDeadlines, function ($a, $b) {
            return strtotime($a['raw_date']) - strtotime($b['raw_date']);
        });
        $upcomingDeadlines = array_slice($upcomingDeadlines, 0, 5);

        // 4. Alerts (Critical Items)
        $alerts = [];
        $redemptionExpiringCount = RedemptionTracking::where('redemption_deadline', '<=', now()->addDays(7))
            ->where('redemption_deadline', '>=', now())
            ->count();

        if ($redemptionExpiringCount > 0) {
            $alerts[] = [
                'icon' => 'AlertCircle',
                'backgroundColor' => '#FEF2F2',
                'color' => '#EF4444',
                'borderColor' => '#FCA5A5',
                'textColor' => '#991B1B',
                'count' => $redemptionExpiringCount,
                'message' => 'Properties with redemption expiring soon',
                'action' => 'View Properties'
            ];
        }

        $pendingTasksCount = Deadline::where('deadline_date', '<=', now()->addDays(7))
            ->where('status', '!=', 'completed')
            ->count();
            
        if ($pendingTasksCount > 0) {
             $alerts[] = [
                'icon' => 'Clock',
                'backgroundColor' => '#FFFBEB',
                'color' => '#F59E0B',
                'borderColor' => '#FCD34D',
                'textColor' => '#92400E',
                'count' => $pendingTasksCount,
                'message' => 'Pending tasks due this week',
                'action' => 'View Tasks'
            ];
        }

        // 5. Recent Activity
        $recentActivities = ActivityLog::latest()
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'icon' => $log->log_name === 'import' ? 'Upload' : 'CheckCircle2',
                    'iconColor' => $log->log_name === 'import' ? '#3B82F6' : '#10B981',
                    'text' => $log->description,
                    'time' => $log->created_at->diffForHumans()
                ];
            });
            
        // 6. Action Items (From Tasks)
        $tasks = Task::with(['related', 'assignedUser'])
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->orderByRaw("CASE priority 
                WHEN 'high' THEN 1 
                WHEN 'medium' THEN 2 
                WHEN 'low' THEN 3 
                ELSE 4 END")
            ->orderBy('due_date')
            ->take(5)
            ->get();
            
        $actionItems = $tasks->map(function ($task) {
            $daysRemaining = $task->due_date ? Carbon::now()->diffInDays(Carbon::parse($task->due_date), false) : null;
            
            // Priority Color
            $priorityColor = match($task->priority) {
                'high' => '#EF4444',
                'medium' => '#F59E0B',
                'low' => '#10B981',
                default => '#10B981'
            };

            return [
                'priority' => ucfirst($task->priority),
                'priorityColor' => $priorityColor,
                'status' => ucfirst(str_replace('_', ' ', $task->status)),
                'statusBg' => $task->status === 'in_progress' ? '#EFF6FF' : '#F3F4F6',
                'property' => $task->related_type === 'App\Models\Property' && $task->related ? $task->related->address : 'General Task',
                'propertyId' => $task->related_type === 'App\Models\Property' && $task->related ? $task->related->parcel_id : '-',
                'type' => 'Task',
                'action' => $task->title,
                'deadline' => $task->due_date ? Carbon::parse($task->due_date)->format('M d') : 'No Date',
                'days' => $daysRemaining !== null ? ($daysRemaining < 0 ? abs(intval($daysRemaining)) . ' days overdue' : intval($daysRemaining) . ' days') : '-',
                'assigned' => $task->assignedUser ? $task->assignedUser->name : 'Unassigned'
            ];
        });

        $data = [
            'header' => [
                'title' => 'Dashboard',
                'subtitle' => 'Welcome back! Here\'s what\'s happening with your portfolio today.'
            ],
            'alerts' => $alerts,
            'keyMetrics' => [
                [
                    'icon' => 'DollarSign',
                    'value' => '$' . number_format($totalAssetValue),
                    'label' => 'Total Asset Value',
                    'subtext' => 'Based on current value',
                    'color' => '#10B981'
                ],
                [
                    'icon' => 'Building2',
                    'value' => (string)$activeProperties,
                    'label' => 'Active Properties',
                    'subtext' => 'In portfolio',
                    'color' => '#3B82F6'
                ],
                [
                    'icon' => 'Users',
                    'value' => (string)$activeInvestors,
                    'label' => 'Active Investors',
                    'subtext' => 'Approved users',
                    'color' => '#6366F1'
                ],
                [
                    'icon' => 'TrendingUp',
                    'value' => number_format($avgRoi, 1) . '%',
                    'label' => 'Avg. ROI',
                    'subtext' => 'Across all properties',
                    'color' => '#8B5CF6'
                ]
            ],
            'workflowPipeline' => [
                'title' => 'Workflow Pipeline',
                'action' => 'View All Properties',
                'stages' => $pipelineData
            ],
            'upcomingDeadlines' => [
                'title' => 'Upcoming Deadlines',
                'action' => 'View Calendar',
                'deadlines' => $upcomingDeadlines
            ],
            'actionItems' => [
                'title' => 'Action Items',
                'subtitle' => 'Tasks requiring your input or approval',
                'filterLabel' => 'Filter by Status',
                'sortLabel' => 'Sort by Deadline',
                'items' => $actionItems
            ],
            'workflowAlerts' => [
                'title' => 'Workflow Alerts',
                'subtitle' => 'Items needing review',
                'alerts' => [
                    [
                        'icon' => 'Gavel',
                        'color' => '#DC2626',
                        'title' => 'Sheriff Sale',
                        'value' => (string)Property::where('workflow_stage', 'sheriff')->count(),
                        'subtext' => 'Properties scheduled'
                    ],
                    [
                        'icon' => 'FileWarning',
                        'color' => '#D97706',
                        'title' => 'Redemption',
                        'value' => (string)Property::where('workflow_stage', 'redemption')->count(),
                        'subtext' => 'Active cases'
                    ]
                ]
            ],
            'recentActivity' => [
                'title' => 'Recent Activity',
                'action' => 'View Log',
                'activities' => $recentActivities
            ],
            'quickStats' => [
                'title' => 'Quick Stats',
                'stats' => [
                    ['label' => 'Properties Sold', 'value' => (string)Property::where('status', 'sold')->count()],
                    ['label' => 'New Leads', 'value' => (string)Property::where('workflow_stage', 'research')->where('created_at', '>=', now()->subDays(30))->count()],
                    ['label' => 'Pending Tasks', 'value' => (string)$pendingTasksCount]
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
