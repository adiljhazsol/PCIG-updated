<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\BarmentCase;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBarmentController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $activeCases = Property::where('workflow_stage', 'barment')->count();
        $filedCases = BarmentCase::where('status', 'filed')->count();
        $inCourt = BarmentCase::where('status', 'in_court')->count();
        $completed = BarmentCase::whereIn('status', ['decided', 'dismissed'])->count();

        // Queue
        $properties = Property::where('workflow_stage', 'barment')
            ->with(['barmentCase', 'barmentCase.attorney'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($prop) {
                $case = $prop->barmentCase;
                return [
                    'id' => $prop->id,
                    'parcelId' => $prop->parcel_id ?? 'Unknown',
                    'pcigId' => 'PROP-' . $prop->id,
                    'address' => $prop->address,
                    'county' => $prop->county ?? 'Unknown', 
                    'owner' => 'Unknown', // Property model currently does not have owner field
                    'sendBy' => $case ? 'Filed' : 'Action Required',
                    'sendByColor' => $case ? 'normal' : 'critical',
                    'sendBySub' => $case ? ($case->filed_date ? $case->filed_date->format('M d, Y') : 'No Date') : 'Immediate',
                    'deadline' => $case ? ($case->court_date ? $case->court_date->format('M d, Y') : 'TBD') : 'ASAP',
                    'deadlineSub' => 'Court Date',
                    'letterStatus' => $case ? 'Filed' : 'Not Generated',
                    'trackingNumber' => 'N/A',
                    'trackingStatus' => null,
                    'status' => $case ? ucfirst($case->status) : 'New',
                    'actions' => ['Generate', 'View Details']
                ];
            });

        return response()->json([
            'barment' => [
                'header' => [
                    'title' => 'Barment Actions',
                    'subtitle' => 'Manage barment proceedings, court filings, and legal notices.'
                ],
                'actionButtons' => [
                    'generateLetters' => ['label' => 'Generate Letters', 'icon' => 'Mail'],
                    'viewLogs' => ['label' => 'View Logs', 'icon' => 'FileText']
                ],
                'statsCards' => [
                    ['label' => 'Active Cases', 'value' => $activeCases, 'trend' => '+3 this week', 'icon' => 'FileText', 'color' => '#1E3A5F'],
                    ['label' => 'Filed & Pending', 'value' => $filedCases, 'trend' => 'Avg 15 days', 'icon' => 'Clock', 'color' => '#F59E0B'],
                    ['label' => 'Court Hearings', 'value' => $inCourt, 'trend' => 'Next 7 days', 'icon' => 'AlertTriangle', 'color' => '#DC2626'],
                    ['label' => 'Completed', 'value' => $completed, 'trend' => 'This month', 'icon' => 'CheckCircle2', 'color' => '#10B981']
                ],
                'alerts' => $this->getAlerts(),
                'tabs' => [
                    ['id' => 'all', 'label' => 'All Cases', 'count' => $activeCases],
                    ['id' => 'filed', 'label' => 'Filed', 'count' => $filedCases],
                    ['id' => 'in-court', 'label' => 'In Court', 'count' => $inCourt],
                    ['id' => 'completed', 'label' => 'Completed', 'count' => $completed]
                ],
                'filters' => [
                    'searchPlaceholder' => 'Search cases...',
                    'dropdowns' => [
                        ['label' => 'Status', 'options' => ['Status', 'Filed', 'In Court', 'Decided']],
                        ['label' => 'Attorney', 'options' => ['Attorney', 'All Attorneys', 'Unassigned']],
                        ['label' => 'County', 'options' => array_merge(['All Counties'], Property::distinct('county')->pluck('county')->toArray())]
                    ],
                    'clearButton' => 'Clear Filters'
                ],
                'queue' => [
                    'title' => 'Case Queue',
                    'count' => $properties->count(),
                    'tableHeaders' => ['', 'Parcel / ID', 'Property', 'Owner', 'Status / Date', 'Deadline', 'Letter Status', 'Tracking', 'Case Status', 'Actions'],
                    'rows' => $properties
                ],
                'timeline' => [
                    'title' => 'Process Workflow',
                    'steps' => [
                        ['id' => 1, 'label' => 'Notice Sent', 'status' => 'completed'],
                        ['id' => 2, 'label' => 'Case Filed', 'status' => 'active'],
                        ['id' => 3, 'label' => 'Hearing', 'status' => 'pending'],
                        ['id' => 4, 'label' => 'Judgment', 'status' => 'pending']
                    ]
                ],
                'letterLogs' => []
            ]
        ]);
    }

    private function getAlerts()
    {
        $alerts = [];
        
        // Check for upcoming hearings
        $upcomingHearings = BarmentCase::where('court_date', '>=', now())
            ->where('court_date', '<=', now()->addDays(7))
            ->count();
            
        if ($upcomingHearings > 0) {
            $alerts[] = [
                'text' => "$upcomingHearings hearings scheduled for next week",
                'type' => 'warning',
                'link' => 'View Calendar'
            ];
        }

        // Check for new cases
        $newCases = BarmentCase::where('created_at', '>=', now()->subDays(3))->count();
        if ($newCases > 0) {
             $alerts[] = [
                'text' => "$newCases new cases filed recently",
                'type' => 'info',
                'link' => 'View Cases'
            ];
        }

        return $alerts;
    }

    private function getStatusColor($status)
    {
        $colors = [
            'filed' => 'blue',
            'in_court' => 'orange',
            'decided' => 'green',
            'dismissed' => 'gray',
            'pending' => 'yellow',
            'new' => 'gray'
        ];
        return $colors[$status] ?? 'gray';
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'barment')
            ->with(['primaryImage', 'barmentCase']);

        if ($request->has('status')) {
            $query->whereHas('barmentCase', function($q) use ($request) {
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
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::where('workflow_stage', 'barment')
            ->findOrFail($id);

        $barmentCase = BarmentCase::create([
            'property_id' => $property->id,
            'filed_date' => now(),
            'status' => 'filed',
            'court_date' => $request->court_date,
            'attorney_id' => $request->attorney_id,
            'filing_fee' => $request->filing_fee,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Barment case filed successfully',
            'data' => $barmentCase->load(['property', 'attorney']),
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
            'notes' => 'nullable|string|max:1000',
        ]);

        $barmentCase = BarmentCase::findOrFail($id);
        $barmentCase->update($validatedData);

        // If case is decided, update property workflow
        if ($request->status === 'decided') {
            if (strtolower($barmentCase->court_outcome ?? '') === 'won') {
                $barmentCase->property->update([
                    'workflow_stage' => 'quiet_title',
                ]);
            } elseif (strtolower($barmentCase->court_outcome ?? '') === 'lost') {
                $barmentCase->property->update([
                    'workflow_stage' => 'redemption',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Barment case updated successfully',
            'data' => $barmentCase->load(['property', 'attorney']),
        ]);
    }
}
