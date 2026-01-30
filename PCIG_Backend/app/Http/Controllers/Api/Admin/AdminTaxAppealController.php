<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxAppeal;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminTaxAppealController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $activeAppeals = TaxAppeal::whereIn('status', ['filed', 'in_review', 'hearing_scheduled'])->count();
        $totalSavings = TaxAppeal::sum('savings');
        
        $wonCount = TaxAppeal::where('status', 'won')->count();
        $lostCount = TaxAppeal::where('status', 'lost')->count();
        $totalDecided = $wonCount + $lostCount;
        $successRate = $totalDecided > 0 ? ($wonCount / $totalDecided) * 100 : 0;
        
        $upcomingHearings = TaxAppeal::where('status', 'hearing_scheduled')
            ->whereBetween('hearing_date', [Carbon::now(), Carbon::now()->addDays(30)])
            ->count();

        // Trends (vs last month)
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $activeLastMonth = TaxAppeal::whereIn('status', ['filed', 'in_review', 'hearing_scheduled'])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
        $activeTrend = $activeAppeals - $activeLastMonth;
        $activeTrendStr = ($activeTrend >= 0 ? '+' : '') . $activeTrend . ' vs last month';

        // Alert Banner - Upcoming hearings in next 7 days
        $urgentHearings = TaxAppeal::where('status', 'hearing_scheduled')
            ->whereBetween('hearing_date', [Carbon::now(), Carbon::now()->addDays(7)])
            ->count();
            
        $alertBanner = $urgentHearings > 0 ? [
            'message' => "$urgentHearings properties have appeal hearings within 7 days.",
            'type' => 'warning'
        ] : null;

        // Dynamic Filters
        $counties = Property::distinct('county')->pluck('county')->filter()->values()->toArray();
        
        // Fetch years in a DB-agnostic way (compatible with SQLite for testing)
        $years = TaxAppeal::whereNotNull('filed_date')
            ->get(['filed_date'])
            ->map(function ($appeal) {
                return $appeal->filed_date ? Carbon::parse($appeal->filed_date)->year : null;
            })
            ->filter()
            ->unique()
            ->sortDesc()
            ->values()
            ->map(fn($y) => (string)$y)
            ->toArray();

        // Table Rows
        $query = TaxAppeal::with('property')->latest();

        // Apply Filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('status', 'like', "%{$search}%")
                  ->orWhereHas('property', function ($subQ) use ($search) {
                      $subQ->where('address', 'like', "%{$search}%")
                           ->orWhere('city', 'like', "%{$search}%")
                           ->orWhere('county', 'like', "%{$search}%")
                           ->orWhere('parcel_id', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'All Statuses') {
            $status = strtolower(str_replace(' ', '_', $request->input('status')));
            $query->where('status', $status);
        }

        if ($request->filled('county') && $request->input('county') !== 'All Counties') {
            $county = $request->input('county');
            $query->whereHas('property', function ($q) use ($county) {
                $q->where('county', $county);
            });
        }

        if ($request->filled('year') && $request->input('year') !== 'All Years') {
            $year = $request->input('year');
            $query->whereYear('filed_date', $year);
        }

        $appeals = $query->limit(50) // Increased limit for filtered results
            ->get()
            ->map(function ($appeal) {
                return [
                    'id' => $appeal->property_id, // Using property ID as ID for frontend compatibility
                    'appealId' => $appeal->id,
                    'pcigId' => 'PROP-' . $appeal->property_id,
                    'address' => $appeal->property ? $appeal->property->address : 'Unknown',
                    'county' => $appeal->property ? $appeal->property->county : 'Unknown',
                    'currentValue' => (float)$appeal->current_assessment,
                    'proposedValue' => (float)$appeal->proposed_assessment,
                    'appealStatus' => ucfirst(str_replace('_', ' ', $appeal->status)),
                    'statusColor' => $this->getStatusColor($appeal->status),
                    'hearingDate' => $appeal->hearing_date ? Carbon::parse($appeal->hearing_date)->format('M d, Y') : 'Not Scheduled',
                    'filingDate' => $appeal->filed_date ? Carbon::parse($appeal->filed_date)->format('M d, Y') : '',
                    'savings' => (float)($appeal->savings ?? 0),
                    'selected' => false
                ];
            });

        return response()->json([
            'propertyTaxAppeal' => [
                'header' => [
                    'title' => 'Property Tax Appeals',
                    'subtitle' => 'Manage tax assessments, file appeals, and track savings.'
                ],
                'summaryCards' => [
                    ['label' => 'Active Appeals', 'value' => $activeAppeals, 'trend' => $activeTrendStr, 'icon' => 'FileText', 'color' => '#3B82F6'],
                    ['label' => 'Total Savings', 'value' => '$' . number_format($totalSavings), 'trend' => 'YTD', 'icon' => 'Download', 'color' => '#10B981'],
                    ['label' => 'Success Rate', 'value' => round($successRate) . '%', 'trend' => 'All time', 'icon' => 'CheckCircle2', 'color' => '#F59E0B'],
                    ['label' => 'Upcoming Hearings', 'value' => $upcomingHearings, 'trend' => 'Next 30 days', 'icon' => 'Calendar', 'color' => '#6366F1']
                ],
                'alertBanner' => $alertBanner,
                'searchAndFilters' => [
                    'placeholder' => 'Search properties, parcel IDs...',
                    'filters' => [
                        ['label' => 'Status', 'options' => ['Draft', 'Filed', 'Hearing Scheduled', 'Won', 'Lost']],
                        ['label' => 'County', 'options' => array_merge(['All'], $counties)],
                        ['label' => 'Year', 'options' => array_merge(['All'], array_map('strval', $years))]
                    ]
                ],
                'viewControls' => [
                    'views' => [
                        ['id' => 'table', 'label' => 'List View', 'icon' => 'List'],
                        ['id' => 'kanban', 'label' => 'Board View', 'icon' => 'Grid']
                    ]
                ],
                'propertiesTable' => [
                    'headers' => ['Property Address', 'County', 'Current Value', 'Proposed Value', 'Status', 'Hearing Date', 'Est. Savings', 'Actions'],
                    'rows' => $appeals
                ],
                'detailPanel' => [
                    'selectedProperty' => $appeals->first() ?? null
                ]
            ]
        ]);
    }

    private function getStatusColor($status)
    {
        $colors = [
            'filed' => 'blue',
            'in_review' => 'yellow',
            'hearing_scheduled' => 'orange',
            'won' => 'green',
            'lost' => 'red',
            'settled' => 'purple',
            'pending' => 'gray',
            'draft' => 'gray'
        ];
        return $colors[$status] ?? 'gray';
    }

    /**
     * Get all tax appeals
     */
    public function index(Request $request): JsonResponse
    {
        $appeals = TaxAppeal::with('property')
            ->when($request->status, function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->when($request->property_id, function ($q) use ($request) {
                return $q->where('property_id', $request->property_id);
            })
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $appeals]);
    }

    /**
     * Get a single tax appeal details
     */
    public function show($id): JsonResponse
    {
        $appeal = TaxAppeal::with('property')->findOrFail($id);
        
        // In a real scenario, we might also fetch related documents, notes, etc.
        // For now, we'll return the appeal with property data.
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $appeal->id,
                'property_id' => $appeal->property_id,
                'property_address' => $appeal->property ? $appeal->property->address : 'Unknown',
                'property_parcel_id' => $appeal->property ? $appeal->property->parcel_id : 'Unknown',
                'current_assessment' => $appeal->current_assessment,
                'proposed_assessment' => $appeal->proposed_assessment,
                'filed_date' => $appeal->filed_date,
                'hearing_date' => $appeal->hearing_date,
                'status' => $appeal->status,
                'outcome' => $appeal->outcome,
                'savings' => $appeal->savings,
                'notes' => $appeal->notes,
                // Add more fields as needed for the detail panel
                'valuation_history' => [], // Placeholder for historical data
                'documents' => [], // Placeholder for documents
            ]
        ]);
    }

    /**
     * File a new tax appeal
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'filed_date' => 'required|date',
            'current_assessment' => 'required|numeric',
            'proposed_assessment' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $appeal = TaxAppeal::create([
            'property_id' => $request->property_id,
            'filed_date' => $request->filed_date,
            'current_assessment' => $request->current_assessment,
            'proposed_assessment' => $request->proposed_assessment,
            'status' => 'filed',
            'notes' => $request->notes,
        ]);

        return response()->json(['success' => true, 'data' => $appeal], 201);
    }

    /**
     * Update appeal status/outcome
     */
    public function update(Request $request, $id): JsonResponse
    {
        $appeal = TaxAppeal::findOrFail($id);

        $request->validate([
            'status' => 'required|in:draft,pending,filed,in_review,hearing_scheduled,won,lost,settled',
            'outcome' => 'nullable|string',
            'savings' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $appeal->update($request->only(['status', 'outcome', 'savings', 'notes']));

        return response()->json(['success' => true, 'data' => $appeal]);
    }
}
