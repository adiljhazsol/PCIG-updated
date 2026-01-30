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
    public function dashboardData(): JsonResponse
    {
        // Calculate stats
        $preForeclosureCount = Property::where('workflow_stage', 'quiet_title')
            ->whereDoesntHave('quietTitleCase')
            ->count();

        $needToFileCount = QuietTitleCase::where('status', 'pending')->count();
        $filedCount = QuietTitleCase::where('status', 'filed')->count();
        $litigationCount = QuietTitleCase::where('status', 'in_court')->count();
        $freeClearCount = QuietTitleCase::where('status', 'decided')
            ->where('court_outcome', 'won')
            ->count();
        $redeemedCount = QuietTitleCase::where('status', 'dismissed') // Assuming dismissed = redeemed or lost
            ->count();

        $data = [
            'header' => [
                'title' => 'Quiet Title',
                'subtitle' => 'QT legal process management with workflow stages'
            ],
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
            'alerts' => [
                [
                    'type' => 'critical',
                    'count' => 3, // Mock data for now, would need logic
                    'message' => 'QT items need action - Service overdue / Missing documents / Hearings scheduled',
                    'action' => 'View Action Items'
                ],
                [
                    'type' => 'warning',
                    'count' => $needToFileCount,
                    'message' => 'properties ready to file - Barment period complete',
                    'action' => 'View Ready to File'
                ],
                [
                    'type' => 'info',
                    'count' => $freeClearCount,
                    'message' => 'final orders received - Mark Free & Clear',
                    'action' => 'View Final Orders'
                ]
            ],
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
                    'options' => ['All Counties', 'Fulton County', 'Dekalb County', 'Gwinnett County']
                ],
                [
                    'label' => 'All Attorneys',
                    'options' => ['All Attorneys', 'Unassigned', 'Smith & Assoc.', 'Johnson Law']
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
                'rows' => $this->getQueueRows()
            ]
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

    private function getQueueRows()
    {
        // 1. Fetch properties needing filing
        $pendingProperties = Property::where('workflow_stage', 'quiet_title')
            ->whereDoesntHave('quietTitleCase')
            ->limit(20)
            ->get();
            
        $pendingRows = $pendingProperties->map(function($prop) {
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

        // 2. Fetch active cases
        $cases = QuietTitleCase::with(['property', 'attorney'])
            ->latest()
            ->limit(50)
            ->get();

        $caseRows = $cases->map(function($case) {
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

        return $pendingRows->merge($caseRows)->values();
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
