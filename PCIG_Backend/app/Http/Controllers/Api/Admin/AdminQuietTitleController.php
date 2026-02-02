<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\QuietTitleCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminQuietTitleController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Calculate stats (keeping these global for now, not filtered by request to show overall health)
        $preForeclosureCount = Property::where('workflow_stage', 'quiet_title')
            ->whereDoesntHave('quietTitleCase')
            ->count();

        $needToFileCount = QuietTitleCase::where('status', 'pending')->count();
        $filedCount = QuietTitleCase::where('status', 'filed')->count();
        $litigationCount = QuietTitleCase::where('status', 'in_court')->count();
        $freeClearCount = QuietTitleCase::where('status', 'decided')
            ->where('court_outcome', 'won')
            ->count();
        $redeemedCount = QuietTitleCase::where('status', 'dismissed')
            ->count();

        $data = [
            'header' => [
                'title' => 'Quiet Title',
                'subtitle' => 'QT legal process management with workflow stages'
            ],
            // ... (rest of the static structure)
            'actionButtons' => [
                'fileNew' => [
                    'label' => 'File New QT',
                    'icon' => 'FilePlus'
                ],
                'assignAttorney' => [
                    'label' => 'Assign Attorney',
                    'icon' => 'UserPlus'
                ]
            ],
            'stats' => [
                [
                    'label' => 'Pre-Foreclosure',
                    'value' => (string)$preForeclosureCount,
                    'subtext' => 'Waiting period',
                    'icon' => 'Clock'
                ],
                [
                    'label' => 'Need to File',
                    'value' => (string)$needToFileCount,
                    'subtext' => 'Ready to file',
                    'icon' => 'FileText',
                    'highlight' => 'yellow'
                ],
                [
                    'label' => 'Filed',
                    'value' => (string)$filedCount,
                    'subtext' => 'In court',
                    'icon' => 'File'
                ],
                [
                    'label' => 'Litigation',
                    'value' => (string)$litigationCount,
                    'subtext' => 'Active cases',
                    'icon' => 'Gavel',
                    'highlight' => 'orange'
                ],
                [
                    'label' => 'Free & Clear',
                    'value' => (string)$freeClearCount,
                    'subtext' => 'Completed',
                    'icon' => 'CheckCircle',
                    'highlight' => 'green'
                ],
                [
                    'label' => 'Redeemed',
                    'value' => (string)$redeemedCount,
                    'subtext' => 'Before QT complete',
                    'icon' => 'XCircle'
                ]
            ],
            'alerts' => $this->getAlerts($needToFileCount, $freeClearCount),
            'pipeline' => [
                'title' => 'QT Workflow Pipeline',
                'subtitle' => 'Pre-Foreclosure → Need to File → Filed → Litigation → Free & Clear',
                'buttons' => ['Pipeline', 'Table'],
                'stages' => [
                    [
                        'label' => 'Pre-Foreclosure',
                        'value' => (string)$preForeclosureCount,
                        'subtext' => 'Waiting period'
                    ],
                    [
                        'label' => 'Need to File',
                        'value' => (string)$needToFileCount,
                        'subtext' => 'Action needed',
                        'active' => true
                    ],
                    [
                        'label' => 'Filed',
                        'value' => (string)$filedCount,
                        'subtext' => 'In court'
                    ],
                    [
                        'label' => 'Litigation',
                        'value' => (string)$litigationCount,
                        'subtext' => 'Hearings set'
                    ],
                    [
                        'label' => 'Free & Clear',
                        'value' => (string)$freeClearCount,
                        'subtext' => 'Complete'
                    ]
                ]
            ],
            'tabs' => [
                ['key' => 'all', 'label' => 'All Cases'],
                ['key' => 'pre-foreclosure', 'label' => 'Pre-Foreclosure', 'count' => $preForeclosureCount],
                ['key' => 'need-to-file', 'label' => 'Need to File', 'count' => $needToFileCount],
                ['key' => 'filed', 'label' => 'Filed', 'count' => $filedCount],
                ['key' => 'litigation', 'label' => 'Litigation', 'count' => $litigationCount],
                ['key' => 'free-clear', 'label' => 'Free & Clear'],
                ['key' => 'redeemed', 'label' => 'Redeemed']
            ],
            'filters' => [
                [
                    'label' => 'All Stages',
                    'options' => ['All Stages', 'Pre-Foreclosure', 'Need to File', 'Filed', 'Litigation', 'Free & Clear', 'Redeemed']
                ],
                [
                    'label' => 'All Counties',
                    'options' => array_merge(['All Counties'], Property::distinct()->pluck('county')->filter()->toArray())
                ],
                [
                    'label' => 'All Attorneys',
                    'options' => array_merge(['All Attorneys', 'Unassigned'], \App\Models\User::where('role_type', 'lawyer')->pluck('name')->toArray())
                ],
                [
                    'label' => 'Date Range',
                    'options' => ['Date Range', 'Last 7 Days', 'Last 30 Days', 'This Year']
                ]
            ],
            'queue' => [
                'title' => 'Quiet Title Queue',
                'subtitle' => 'Showing items',
                'actions' => ['bulk' => 'Bulk Assign Attorney', 'sort' => 'Sort'],
                'tableHeaders' => ['', 'Parcel ID / PCIG ID', 'Property Address', 'Current Stage', 'Attorney', 'Court Date', 'Status', 'Actions'],
                'rows' => $this->getQueueRows($request)
            ],
            // Get full attorney list with IDs for assignment modal
            'attorneyList' => \App\Models\User::where('role_type', 'lawyer')->get()->map(function($attorney) {
                return ['id' => $attorney->id, 'name' => $attorney->name];
            })->values()
        ];

        return response()->json($data);
    }

    private function getAlerts($needToFileCount, $freeClearCount)
    {
        $alerts = [];
        
        // 1. Critical: Upcoming Hearings
        $upcomingHearings = QuietTitleCase::where('court_date', '>=', now())
            ->where('court_date', '<=', now()->addDays(14))
            ->count();
            
        if ($upcomingHearings > 0) {
            $alerts[] = [
                'type' => 'critical',
                'count' => $upcomingHearings,
                'message' => "hearings scheduled in the next 14 days",
                'action' => 'View Calendar'
            ];
        }
        
        // Critical: Overdue for filing (In QT stage for > 45 days and not filed)
        $overdueFiling = Property::where('workflow_stage', 'quiet_title')
            ->whereDoesntHave('quietTitleCase')
            ->where('updated_at', '<', now()->subDays(45))
            ->count();
            
        if ($overdueFiling > 0) {
             $alerts[] = [
                'type' => 'critical',
                'count' => $overdueFiling,
                'message' => "properties overdue for filing (>45 days)",
                'action' => 'View Overdue'
            ];
        }

        // 2. Warning: Need to File
        if ($needToFileCount > 0) {
            $alerts[] = [
                'type' => 'warning',
                'count' => $needToFileCount,
                'message' => 'properties ready to file - Barment period complete',
                'action' => 'View Ready to File'
            ];
        }

        // 3. Info: Completed
        if ($freeClearCount > 0) {
             $alerts[] = [
                'type' => 'info',
                'count' => $freeClearCount,
                'message' => 'cases marked Free & Clear',
                'action' => 'View Completed'
            ];
        }

        return $alerts;
    }

    private function getQueueRows(Request $request)
    {
        $rows = collect();

        // Common filter logic
        $applyFilters = function ($query, $type = 'property') use ($request) {
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search, $type) {
                    if ($type === 'property') {
                        $q->where('parcel_id', 'like', "%$search%")
                            ->orWhere('address', 'like', "%$search%");
                    } else {
                        $q->whereHas('property', function ($pq) use ($search) {
                            $pq->where('parcel_id', 'like', "%$search%")
                                ->orWhere('address', 'like', "%$search%");
                        });
                    }
                });
            }

            if ($request->filled('county') && $request->county !== 'All Counties') {
                if ($type === 'property') {
                    $query->where('county', $request->county);
                } else {
                    $query->whereHas('property', function ($q) use ($request) {
                        $q->where('county', $request->county);
                    });
                }
            }
            
            // Date range filter (simplistic for now)
            if ($request->filled('date_range') && $request->date_range !== 'Date Range') {
                 $date = now();
                 if ($request->date_range === 'Last 7 Days') $date->subDays(7);
                 elseif ($request->date_range === 'Last 30 Days') $date->subDays(30);
                 elseif ($request->date_range === 'This Year') $date->startOfYear();
                 
                 $column = $type === 'property' ? 'updated_at' : 'created_at';
                 $query->where($column, '>=', $date);
            }
        };

        // Determine what to fetch based on tab/stage
        $fetchProperties = false;
        $fetchCases = false;
        $caseStatus = [];

        $stage = $request->get('tab', 'all');
        if ($request->filled('stage') && $request->stage !== 'All Stages') {
             // Map dropdown stage to tab logic if provided
             $stageMap = [
                 'Pre-Foreclosure' => 'pre-foreclosure',
                 'Need to File' => 'need-to-file',
                 'Filed' => 'filed',
                 'Litigation' => 'litigation',
                 'Free & Clear' => 'free-clear',
                 'Redeemed' => 'redeemed'
             ];
             if (isset($stageMap[$request->stage])) {
                 $stage = $stageMap[$request->stage];
             }
        }

        switch ($stage) {
            case 'pre-foreclosure':
                $fetchProperties = true;
                break;
            case 'need-to-file':
                $fetchCases = true;
                $caseStatus = ['pending'];
                break;
            case 'filed':
                $fetchCases = true;
                $caseStatus = ['filed'];
                break;
            case 'litigation':
                $fetchCases = true;
                $caseStatus = ['in_court'];
                break;
            case 'free-clear':
                $fetchCases = true;
                $caseStatus = ['decided']; // And outcome won
                break;
            case 'redeemed':
                $fetchCases = true;
                $caseStatus = ['dismissed'];
                break;
            case 'all':
            default:
                $fetchProperties = true;
                $fetchCases = true;
                break;
        }

        // 1. Fetch properties (Pre-Foreclosure / Need to File if no case exists yet)
        if ($fetchProperties) {
            // Attorney filter handling for properties (which by definition don't have a case/attorney yet)
            if ($request->filled('attorney') && $request->attorney !== 'All Attorneys' && $request->attorney !== 'Unassigned') {
                // If filtering by a specific attorney, properties without cases should not show up
                $fetchProperties = false;
            } else {
                $propQuery = Property::where('workflow_stage', 'quiet_title')
                    ->whereDoesntHave('quietTitleCase');
                
                $applyFilters($propQuery, 'property');
                
                $pendingProperties = $propQuery->limit(50)->get();

                $pendingRows = $pendingProperties->map(function ($prop) {
                    return [
                        'id' => null,
                        'propertyId' => $prop->id,
                        'parcelId' => $prop->parcel_id ?? 'Unknown',
                        'pcigId' => 'PROP-' . $prop->id,
                        'address' => $prop->address ?? 'Unknown Address',
                        'county' => $prop->county ?? 'Unknown County',
                        'stage' => 'Need to File',
                        'stageColor' => 'yellow',
                        'attorneyStatus' => 'unassigned',
                        'attorney' => 'Unassigned',
                        'attorneySub' => 'Assign Now',
                        'filingDate' => 'Not Filed',
                        'hearingDate' => 'TBD',
                        'hearingDateBold' => false,
                        'daysInStage' => $prop->updated_at ? $prop->updated_at->diffInDays(now()) . ' Days' : '0 Days',
                        'daysColor' => 'red',
                        'lastAction' => 'Entered Stage',
                        'lastActionSub' => $prop->updated_at ? $prop->updated_at->format('M d, Y') : '',
                        'nextAction' => 'File Complaint',
                        'nextActionColor' => 'red'
                    ];
                });
                $rows = $rows->merge($pendingRows);
            }
        }

        // 2. Fetch active cases
        if ($fetchCases) {
            $caseQuery = QuietTitleCase::with(['property', 'attorney']);
            
            if (!empty($caseStatus)) {
                $caseQuery->whereIn('status', $caseStatus);
                if (in_array('decided', $caseStatus) && $stage === 'free-clear') {
                    $caseQuery->where('court_outcome', 'won');
                }
            }
            
            $applyFilters($caseQuery, 'case');
            
            // Attorney filter (only applies to cases mostly)
            if ($request->filled('attorney') && $request->attorney !== 'All Attorneys') {
                if ($request->attorney === 'Unassigned') {
                    $caseQuery->whereNull('attorney_id');
                } else {
                     // In real app, search by attorney name or ID. Here assuming simplistic name match or ID
                     // Ideally we pass attorney_id from frontend.
                     $caseQuery->whereHas('attorney', function($q) use ($request) {
                         $q->where('name', 'like', "%{$request->attorney}%");
                     });
                }
            }

            $cases = $caseQuery->latest()->limit(50)->get();

            $caseRows = $cases->map(function ($case) {
                return [
                    'id' => $case->id,
                    'propertyId' => $case->property_id,
                    'parcelId' => $case->property->parcel_id ?? 'Unknown',
                    'pcigId' => 'PROP-' . $case->property_id,
                    'address' => $case->property->address ?? 'Unknown Address',
                    'county' => $case->property->county ?? 'Unknown County',
                    'stage' => ucfirst(str_replace('_', ' ', $case->status)),
                    'stageColor' => $case->status === 'filed' ? 'blue' : ($case->status === 'in_court' ? 'orange' : 'gray'),
                    'attorneyStatus' => $case->attorney ? 'assigned' : 'unassigned',
                    'attorney' => $case->attorney ? $case->attorney->name : 'Unassigned',
                    'attorneySub' => $case->attorney ? 'View Profile' : 'Assign Now',
                    'filingDate' => $case->filed_date ? $case->filed_date->format('M d, Y') : 'Not Filed',
                    'hearingDate' => $case->court_date ? $case->court_date->format('M d, Y') : 'TBD',
                    'hearingDateBold' => (bool)$case->court_date,
                    'daysInStage' => $case->created_at->diffInDays(now()) . ' Days',
                    'daysColor' => 'gray',
                    'lastAction' => 'Updated',
                    'lastActionSub' => $case->updated_at->format('M d, Y'),
                    'nextAction' => 'View Details',
                    'nextActionColor' => 'blue'
                ];
            });
            $rows = $rows->merge($caseRows);
        }

        return $rows->values();
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'quiet_title')
            ->with(['primaryImage', 'quietTitleCase']);

        if ($request->has('status')) {
            $query->whereHas('quietTitleCase', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $perPage = $request->get('per_page', 20);
        $properties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PropertyResource::collection($properties->items()),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function assignAttorney(Request $request, $id): JsonResponse
    {
        $request->validate([
            'attorney_id' => 'required|exists:users,id',
        ]);

        $property = Property::findOrFail($id);

        $case = QuietTitleCase::firstOrCreate(
            ['property_id' => $property->id],
            [
                'status' => 'pending', // Pre-filing status
            ]
        );
        
        $case->attorney_id = $request->attorney_id;
        $case->save();

        return response()->json([
            'success' => true,
            'message' => 'Attorney assigned successfully',
            'data' => $case
        ]);
    }

    public function bulkAssignAttorney(Request $request): JsonResponse
    {
        $request->validate([
            'property_ids' => 'required|array',
            'property_ids.*' => 'exists:properties,id',
            'attorney_id' => 'required|exists:users,id',
        ]);

        $attorneyId = $request->attorney_id;
        $count = 0;

        foreach ($request->property_ids as $propertyId) {
            $case = QuietTitleCase::firstOrCreate(
                ['property_id' => $propertyId],
                ['status' => 'pending']
            );
            
            $case->attorney_id = $attorneyId;
            $case->save();
            $count++;
        }

        return response()->json([
            'success' => true,
            'message' => "Assigned attorney to $count properties.",
            'count' => $count
        ]);
    }

    public function file(Request $request, $id): JsonResponse
    {
        $request->validate([
            'attorney_id' => 'nullable|exists:users,id',
            'filing_fee' => 'nullable|numeric|min:0',
            'court_date' => 'nullable|date',
            'title_issues' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::where('workflow_stage', 'quiet_title')
            ->findOrFail($id);

        $quietTitleCase = QuietTitleCase::create([
            'property_id' => $property->id,
            'filed_date' => now(),
            'status' => 'filed',
            'court_date' => $request->court_date,
            'attorney_id' => $request->attorney_id,
            'filing_fee' => $request->filing_fee,
            'title_issues' => $request->title_issues,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Quiet title case filed successfully',
            'data' => $quietTitleCase->load(['property', 'attorney']),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validatedData = $request->validate([
            'status' => 'nullable|in:pending,filed,in_court,decided,dismissed',
            'court_date' => 'nullable|date',
            'court_outcome' => 'nullable|string|max:255',
            'attorney_id' => 'nullable|exists:users,id',
            'filing_fee' => 'nullable|numeric|min:0',
            'title_issues' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $quietTitleCase = QuietTitleCase::findOrFail($id);
        $quietTitleCase->update($validatedData);

        // If case is decided, update property workflow
        if ($request->status === 'decided') {
            if (strtolower($quietTitleCase->court_outcome ?? '') === 'won') {
                $quietTitleCase->property->update([
                    'workflow_stage' => 'auction',
                ]);
            } elseif (strtolower($quietTitleCase->court_outcome ?? '') === 'lost') {
                $quietTitleCase->property->update([
                    'workflow_stage' => 'completed',
                    'status' => 'sold',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Quiet title case updated successfully',
            'data' => $quietTitleCase->load(['property', 'attorney']),
        ]);
    }
}
