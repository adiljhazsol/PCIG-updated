<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TaxAppeal;
use App\Models\Property;
use App\Models\PropertyDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
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
                $statusColor = $this->getStatusColor($appeal->status);
                $savings = (float)($appeal->savings ?? 0);
                
                return [
                    'id' => $appeal->property_id, // Using property ID as ID for frontend compatibility
                    'appealId' => $appeal->id,
                    'pcigId' => 'PROP-' . $appeal->property_id,
                    'address' => $appeal->property ? $appeal->property->address : 'Unknown',
                    'city' => $appeal->property ? $appeal->property->city : 'Unknown',
                    'county' => $appeal->property ? $appeal->property->county : 'Unknown',
                    'parcelId' => $appeal->property ? $appeal->property->parcel_id : 'Unknown',
                    'type' => 'Tax Appeal',
                    'typeBg' => '#E0F2FE', // light blue
                    'typeColor' => '#0369A1', // dark blue
                    'status' => ucfirst(str_replace('_', ' ', $appeal->status)),
                    'statusBg' => $this->getStatusBgColor($appeal->status),
                    'statusColor' => $this->getStatusTextColor($appeal->status),
                    'currentValue' => '$' . number_format((float)$appeal->current_assessment, 2),
                    'appealValue' => '$' . number_format((float)$appeal->proposed_assessment, 2),
                    'potentialReduction' => '$' . number_format($savings, 2),
                    'potentialReductionColor' => $savings > 0 ? '#166534' : '#64748B',
                    'deadline' => $appeal->hearing_date ? Carbon::parse($appeal->hearing_date)->format('M d, Y') : 'Not Scheduled',
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
                    'headers' => ['Select', 'Property Address', 'Parcel ID', 'Type', 'Status', 'Current Value', 'Proposed Value', 'Est. Savings', 'Hearing Date'],
                    'rows' => $appeals
                ],
                'detailPanel' => [
                    'selectedProperty' => $appeals->first() ?? null
                ]
            ]
        ]);
    }

    private function getStatusBgColor($status)
    {
        $colors = [
            'filed' => '#DBEAFE', // blue-100
            'in_review' => '#FEF9C3', // yellow-100
            'hearing_scheduled' => '#FFEDD5', // orange-100
            'won' => '#DCFCE7', // green-100
            'lost' => '#FEE2E2', // red-100
            'settled' => '#F3E8FF', // purple-100
            'pending' => '#F1F5F9', // gray-100
            'draft' => '#F1F5F9', // gray-100
        ];
        return $colors[$status] ?? '#F1F5F9';
    }

    private function getStatusTextColor($status)
    {
        $colors = [
            'filed' => '#1E40AF', // blue-800
            'in_review' => '#854D0E', // yellow-800
            'hearing_scheduled' => '#9A3412', // orange-800
            'won' => '#166534', // green-800
            'lost' => '#991B1B', // red-800
            'settled' => '#6B21A8', // purple-800
            'pending' => '#1E293B', // gray-800
            'draft' => '#1E293B', // gray-800
        ];
        return $colors[$status] ?? '#1E293B';
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
        $appeal = TaxAppeal::with(['property.documents'])->findOrFail($id);
        
        // Filter documents for this appeal
        $documents = $appeal->property && $appeal->property->documents 
            ? $appeal->property->documents->filter(function($doc) {
                return in_array($doc->type, ['tax', 'appeal']);
            })->values()->map(function($doc) {
                return [
                    'id' => $doc->id,
                    'name' => $doc->file_name ?? basename($doc->file_path),
                    'url' => Storage::url($doc->file_path),
                    'type' => $doc->type,
                    'size' => $doc->file_size ? round($doc->file_size / 1024, 2) . ' KB' : 'Unknown',
                    'created_at' => $doc->created_at->toIso8601String()
                ];
            })
            : [];
        
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
                'valuation_history' => [],
                'documents' => $documents,
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
     * Update appeal details
     */
    public function update(Request $request, $id): JsonResponse
    {
        $appeal = TaxAppeal::findOrFail($id);

        $request->validate([
            'status' => 'sometimes|in:draft,pending,filed,in_review,hearing_scheduled,won,lost,settled',
            'filed_date' => 'nullable|date',
            'current_assessment' => 'nullable|numeric',
            'proposed_assessment' => 'nullable|numeric',
            'hearing_date' => 'nullable|date',
            'outcome' => 'nullable|string',
            'savings' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $appeal->update($request->only([
            'status', 'filed_date', 'current_assessment', 'proposed_assessment', 
            'hearing_date', 'outcome', 'savings', 'notes'
        ]));

        return response()->json(['success' => true, 'data' => $appeal]);
    }

    /**
     * Upload a document for the tax appeal
     */
    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|max:10240', // 10MB max
            'type' => 'nullable|string|in:tax,appeal',
        ]);

        $appeal = TaxAppeal::findOrFail($id);
        $file = $request->file('document');
        
        $path = $file->store('properties/' . $appeal->property_id . '/documents', 'public');

        $document = PropertyDocument::create([
            'property_id' => $appeal->property_id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'type' => $request->input('type', 'appeal'),
            'uploaded_by' => $request->user() ? $request->user()->id : null,
            'uploaded_at' => now(),
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Document uploaded successfully',
            'data' => [
                'id' => $document->id,
                'name' => $document->file_name,
                'url' => Storage::url($document->file_path),
                'type' => $document->type,
                'size' => $document->file_size ? round($document->file_size / 1024, 2) . ' KB' : 'Unknown',
                'created_at' => $document->created_at->toIso8601String()
            ]
        ]);
    }

    /**
     * Generate an appeal package PDF
     */
    public function generatePackage($id)
    {
        $appeal = TaxAppeal::with(['property.documents'])->findOrFail($id);
        
        $data = [
            'appeal' => $appeal,
            'property' => $appeal->property,
            'generated_at' => now()->format('F j, Y g:i A')
        ];

        $pdf = Pdf::loadView('pdf.tax-appeal-package', $data);
        
        return $pdf->download('tax-appeal-package-' . $appeal->id . '.pdf');
    }
}
