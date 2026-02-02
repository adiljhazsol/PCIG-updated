<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Property;
use App\Models\User;
use App\Models\Task;
use App\Models\Expense;
use App\Models\Depreciation;
use App\Models\ReportFavorite;
use App\Models\ScheduledReport;
use App\Services\ReportGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    protected $reportGenerator;

    public function __construct(ReportGenerator $reportGenerator)
    {
        $this->reportGenerator = $reportGenerator;
    }

    public function dashboardData(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $favorites = ReportFavorite::where('user_id', $user->id)
            ->get()
            ->map(function($fav) {
                return [
                    'id' => $fav->report_type,
                    'title' => ucwords(str_replace('_', ' ', $fav->report_type)),
                    'type' => $fav->report_type
                ];
            });

        $scheduled = ScheduledReport::where('user_id', $user->id)
            ->get()
            ->map(function($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => ucwords(str_replace('_', ' ', $schedule->type)),
                    'frequency' => ucfirst($schedule->frequency),
                    'next_run' => $schedule->next_run_at ? $schedule->next_run_at->format('M d, Y') : 'N/A'
                ];
            });

        $properties = Property::select('id', 'address', 'city', 'state')->get()->map(function($prop) {
            return [
                'id' => $prop->id,
                'name' => $prop->address . ', ' . $prop->city . ' ' . $prop->state
            ];
        });

        $data = [
            'reportsCenter' => [
                'properties' => $properties,
                'header' => [
                    'title' => 'Reports Center',
                    'subtitle' => 'Access financial and operational reports'
                ],
                'searchPlaceholder' => 'Search reports...',
                'taxSeasonBanner' => [
                    'title' => 'Tax Season 2024',
                    'description' => 'Prepare K-1s and review allocations.',
                    'buttons' => [
                        'reviewAllocations' => ['label' => 'Review Allocations', 'icon' => 'Settings'],
                        'generateK1' => ['label' => 'Generate K-1s', 'icon' => 'FileText']
                    ]
                ],
                'tabs' => ['All Reports', 'Financial', 'Operational', 'Tax'],
                'activeTab' => 'all',
                'reportCategories' => [
                    [
                        'title' => 'Financial Reports',
                        'reports' => [
                            [
                                'id' => 'financial_summary',
                                'icon' => 'TrendingUp',
                                'title' => 'Financial Summary',
                                'description' => 'Comprehensive view of fund performance and asset values.',
                                'includes' => ['Total Investment', 'Net Appreciation', 'Asset Value'],
                                'is_favorite' => $favorites->contains('id', 'financial_summary')
                            ],
                            [
                                'id' => 'investor_activity',
                                'icon' => 'Percent',
                                'title' => 'Investor Activity',
                                'description' => 'Track capital calls, distributions, and investor engagement.',
                                'includes' => ['Active Investors', 'Total Distributions', 'Pending Calls'],
                                'is_favorite' => $favorites->contains('id', 'investor_activity')
                            ]
                        ]
                    ],
                    [
                        'title' => 'Operational Reports',
                        'reports' => [
                            [
                                'id' => 'property_performance',
                                'icon' => 'Book',
                                'title' => 'Property Performance',
                                'description' => 'Detailed analysis of individual property metrics.',
                                'includes' => ['ROI per Property', 'Expense Ratios', 'Occupancy Rates'],
                                'is_favorite' => $favorites->contains('id', 'property_performance')
                            ],
                            [
                                'id' => 'workflow_efficiency',
                                'icon' => 'Clock',
                                'title' => 'Workflow Efficiency',
                                'description' => 'Analyze turnaround times for key operational processes.',
                                'includes' => ['Avg. Processing Time', 'Bottleneck Identification', 'Stage Duration'],
                                'is_favorite' => $favorites->contains('id', 'workflow_efficiency')
                            ]
                        ]
                    ],
                    [
                        'title' => 'Tax & Compliance',
                        'reports' => [
                            [
                                'id' => 'tax_report',
                                'icon' => 'FileText',
                                'title' => 'Annual Tax Report',
                                'description' => 'Consolidated tax data for annual filing requirements.',
                                'includes' => ['Income Statement', 'Balance Sheet', 'Depreciation Schedule'],
                                'is_favorite' => $favorites->contains('id', 'tax_report')
                            ]
                        ]
                    ]
                ],
                'sidebar' => [
                    'recentReports' => Report::where('generated_by', $user->id)->latest()->take(3)->get()->map(function($report) {
                        return [
                            'id' => $report->id,
                            'title' => ucfirst(str_replace('_', ' ', $report->type)),
                            'generated' => $report->created_at->diffForHumans(),
                            'format' => 'CSV'
                        ];
                    }),
                    'scheduledReports' => $scheduled,
                    'favorites' => $favorites
                ]
            ]
        ];

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function types(): JsonResponse
    {
        $types = [
            'financial_summary' => 'Financial Summary',
            'investor_activity' => 'Investor Activity',
            'property_performance' => 'Property Performance',
            'workflow_efficiency' => 'Workflow Efficiency',
            'tax_report' => 'Tax Report'
        ];
        return response()->json(['data' => $types]);
    }

    public function toggleFavorite(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'required|string',
        ]);

        $user = $request->user();
        $favorite = ReportFavorite::where('user_id', $user->id)
            ->where('report_type', $request->report_type)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $message = 'Report removed from favorites';
            $isFavorite = false;
        } else {
            ReportFavorite::create([
                'user_id' => $user->id,
                'report_type' => $request->report_type
            ]);
            $message = 'Report added to favorites';
            $isFavorite = true;
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'is_favorite' => $isFavorite
        ]);
    }

    public function storeScheduledReport(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'frequency' => 'required|in:daily,weekly,monthly',
            'parameters' => 'nullable|array',
            'recipients' => 'nullable|array',
        ]);

        $user = $request->user();
        
        // Calculate next run date
        $nextRun = now();
        switch ($request->frequency) {
            case 'daily':
                $nextRun->addDay();
                break;
            case 'weekly':
                $nextRun->addWeek();
                break;
            case 'monthly':
                $nextRun->addMonth();
                break;
        }

        $scheduled = ScheduledReport::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'frequency' => $request->frequency,
            'next_run_at' => $nextRun,
            'parameters' => $request->parameters,
            'recipients' => $request->recipients
        ]);

        return response()->json([
            'success' => true,
            'data' => $scheduled,
            'message' => 'Report scheduled successfully'
        ], 201);
    }

    public function destroyScheduledReport(string $id): JsonResponse
    {
        $scheduled = ScheduledReport::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $scheduled->delete();

        return response()->json([
            'success' => true,
            'message' => 'Scheduled report removed'
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $query = Report::with('generator');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'parameters' => 'nullable|array',
        ]);

        try {
            $report = $this->reportGenerator->generate(
                $request->type,
                $request->parameters ?? [],
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'data' => $report,
                'message' => 'Report generated successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Report generation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($id): StreamedResponse|JsonResponse
    {
        $report = Report::findOrFail($id);

        if (!Storage::exists($report->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::download($report->file_path);
    }
}
