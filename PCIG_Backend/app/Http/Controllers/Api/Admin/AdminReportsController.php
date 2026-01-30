<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportsController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Fetch recent reports from database
        $recentReports = Report::latest()->take(5)->get()->map(function($report) {
            return [
                'title' => ucfirst(str_replace('_', ' ', $report->type)),
                'generated' => $report->created_at->diffForHumans(),
                'format' => 'CSV' // Assuming CSV as per generate method
            ];
        });

        $data = [
            'reportsCenter' => [
                'header' => [
                    'title' => 'Reports Center',
                    'subtitle' => 'Generate financial, operational, and tax reports across the platform.'
                ],
                'searchPlaceholder' => 'Search reports...',
                'taxSeasonBanner' => [
                    'title' => 'Tax Season: K-1 Generation',
                    'description' => 'Generate Schedule K-1s for the 2023 tax year. Review allocations before final generation.',
                    'buttons' => [
                        'reviewAllocations' => [
                            'label' => 'Review Allocations',
                            'icon' => 'Settings'
                        ],
                        'generateK1' => [
                            'label' => 'Generate K-1 Package',
                            'icon' => 'FileText'
                        ]
                    ]
                ],
                'tabs' => [
                    'All Reports',
                    'Investor Reports',
                    'Property Reports',
                    'Financial',
                    'Tax',
                    'Workflow'
                ],
                'activeTab' => 'All Reports',
                'reportCategories' => [
                    [
                        'title' => 'Investor Reporting',
                        'reports' => [
                            [
                                'id' => 'investor-statements',
                                'title' => 'Investor Statements',
                                'icon' => 'FileText',
                                'description' => 'Consolidated account statements including portfolio value, transactions, and performance.',
                                'includes' => [
                                    'Investment Summary',
                                    'Returns',
                                    'Distributions'
                                ]
                            ],
                            [
                                'id' => 'share-allocation',
                                'title' => 'Share Allocation Report',
                                'icon' => 'Clock',
                                'description' => 'Detailed breakdown of investor share allocations by property and fund.',
                                'includes' => [
                                    'Ownership %',
                                    'Unit Counts',
                                    'Basis'
                                ]
                            ],
                            [
                                'id' => 'investor-performance',
                                'title' => 'Investor Performance',
                                'icon' => 'TrendingUp',
                                'description' => 'ROI, IRR, and cash-on-cash return analysis per investor.',
                                'includes' => [
                                    'Annualized Returns',
                                    'Distributions'
                                ]
                            ]
                        ]
                    ],
                    [
                        'title' => 'Property & Operations',
                        'reports' => [
                            [
                                'id' => 'property-lifecycle',
                                'title' => 'Property Lifecycle Report',
                                'icon' => 'TrendingUp',
                                'description' => 'Track properties through Research, Auction, Redemption, and REO stages.',
                                'includes' => [
                                    'Status Durations',
                                    'Milestones'
                                ]
                        ],
                        [
                            'id' => 'redemption-summary',
                            'title' => 'Redemption Summary',
                            'icon' => 'RefreshCw',
                            'description' => 'Analysis of active redemptions, amounts collected, and interest earned.',
                            'includes' => [
                                'Redemption Rates',
                                'Interest Revenue'
                            ]
                        ],
                        [
                            'id' => 'workflow-kpis',
                            'title' => 'Workflow KPIs',
                            'icon' => 'Clipboard',
                            'description' => 'Operational efficiency metrics, bottleneck analysis, and processing times.',
                            'includes' => [
                                'Avg Processing Time',
                                'Completion Rates'
                            ]
                        ]
                    ]
                ],
                [
                    'title' => 'Financial & Tax',
                    'reports' => [
                        [
                            'id' => 'expense-allocation',
                            'title' => 'Expense Allocation',
                            'icon' => 'FileText',
                            'description' => 'Detailed expense breakdown allocated by property and investor share.',
                            'includes' => [
                                'Legal',
                                'Admin',
                                'Sheriff Fees'
                            ]
                        ],
                        [
                            'id' => 'depreciation-schedule',
                            'title' => 'Depreciation Schedule',
                            'icon' => 'Percent',
                            'description' => 'Annual depreciation and tax allocation reports for tax filing.',
                            'includes' => [
                                'Asset Basis',
                                'Depreciation Method'
                            ]
                        ],
                        [
                            'id' => 'general-ledger',
                            'title' => 'General Ledger',
                            'icon' => 'Book',
                            'description' => 'Complete transaction ledger with journal entries and P&L summary.',
                            'includes' => [
                                'Debits',
                                'Credits',
                                'Account Balances'
                            ]
                        ]
                    ]
                ]
            ],
            'sidebar' => [
                'recentReports' => $recentReports->isEmpty() ? [] : $recentReports,
                'scheduledReports' => [
                    [
                        'title' => 'Weekly Workflow Status',
                        'nextRun' => 'Mon, 8:00 AM'
                    ]
                ],
                'favorites' => [
                    'Monthly P&L',
                    'Active Redemptions',
                    'Tax Liens List'
                ]
            ]
        ]
    ];

        return response()->json([
            'success' => true,
            'data' => ['reportsCenter' => $data]
        ]);
    }
}
