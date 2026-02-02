<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\PropertyResource;
use App\Models\BarmentCase;
use App\Models\Property;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
        $query = Property::where('workflow_stage', 'barment')
            ->with(['barmentCase', 'barmentCase.attorney']);

        // Handle Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('parcel_id', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('county', 'like', "%{$search}%");
            });
        }

        // Handle Tabs
        if ($request->filled('tab') && $request->tab !== 'all') {
            $tab = $request->tab;
            if ($tab === 'filed') {
                $query->whereHas('barmentCase', function($q) {
                    $q->where('status', 'filed');
                });
            } elseif ($tab === 'in-court') {
                $query->whereHas('barmentCase', function($q) {
                    $q->where('status', 'in_court');
                });
            } elseif ($tab === 'completed') {
                $query->whereHas('barmentCase', function($q) {
                    $q->whereIn('status', ['decided', 'dismissed']);
                });
            }
        }

        $paginator = $query->latest()->paginate(20);

        $rows = $paginator->getCollection()->map(function ($prop) {
            $case = $prop->barmentCase;
            return [
                'id' => $prop->id,
                'parcelId' => $prop->parcel_id ?? 'Unknown',
                'pcigId' => 'PROP-' . $prop->id,
                'address' => $prop->address,
                'county' => $prop->county ?? 'Unknown', 
                'owner' => 'Unknown', // Property model currently does not have owner field
                'attorney' => $case && $case->attorney ? $case->attorney->name : 'Unassigned',
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

        // Letter Logs
        $logs = \App\Models\Notice::with(['property', 'template'])
            ->latest('sent_date')
            ->limit(50)
            ->get()
            ->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'date' => $notice->sent_date ? $notice->sent_date->format('M d, Y H:i A') : 'N/A',
                    'recipient' => $notice->recipient_name ?? 'Unknown',
                    'type' => $notice->template ? $notice->template->name : 'Notice',
                    'status' => $notice->status,
                    'tracking' => 'N/A'
                ];
            });

        // Get Attorney Options
        $attorneyOptions = \App\Models\User::whereHas('roles', function($q) {
            $q->where('name', 'attorney');
        })->orWhere('role_type', 'attorney')->pluck('name')->toArray();
        
        // If no attorneys found, provide empty or placeholder
        if (empty($attorneyOptions)) {
            $attorneyOptions = ['No Attorneys Found'];
        }
        $attorneyOptions = array_merge(['All Attorneys', 'Unassigned'], $attorneyOptions);

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
                        ['label' => 'Attorney', 'options' => $attorneyOptions],
                        ['label' => 'County', 'options' => array_merge(['All Counties'], Property::distinct('county')->pluck('county')->toArray())]
                    ],
                    'clearButton' => 'Clear Filters'
                ],
                'queue' => [
                    'title' => 'Case Queue',
                    'count' => $paginator->total(),
                    'tableHeaders' => ['', 'Parcel / ID', 'Property', 'Owner', 'Status / Date', 'Deadline', 'Letter Status', 'Tracking', 'Case Status', 'Actions'],
                    'rows' => $rows,
                    'pagination' => [
                        'current_page' => $paginator->currentPage(),
                        'last_page' => $paginator->lastPage(),
                        'per_page' => $paginator->perPage(),
                        'total' => $paginator->total()
                    ]
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
                'letterLogs' => [
                    'title' => 'Recent Letter Activity',
                    'subtitle' => 'Track all automated and manual correspondence',
                    'tableHeaders' => ['Date', 'Recipient', 'Type', 'Status', 'Tracking'],
                    'rows' => $logs
                ]
            ]
        ]);
    }

    public function bulkAssignAttorney(Request $request): JsonResponse
    {
        $request->validate([
            'property_ids' => 'required|array',
            'property_ids.*' => 'exists:properties,id',
            'attorney_id' => 'required|exists:users,id',
        ]);

        $count = 0;
        foreach ($request->property_ids as $propertyId) {
            $property = Property::findOrFail($propertyId);
            
            // Find or create Barment Case
            $case = BarmentCase::firstOrCreate(
                ['property_id' => $property->id],
                ['status' => 'pending'] // Default status if creating new
            );

            $case->update(['attorney_id' => $request->attorney_id]);
            $count++;
        }

        return response()->json([
            'success' => true,
            'message' => "Assigned attorney to {$count} properties successfully"
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

    public function generateLetters(Request $request)
    {
        $request->validate([
            'property_ids' => 'required|array',
            'property_ids.*' => 'exists:properties,id',
        ]);

        try {
            $properties = Property::whereIn('id', $request->property_ids)->get();

            // Ensure Template Exists
            $template = \App\Models\NoticeTemplate::firstOrCreate(
                ['name' => 'Barment Notice'],
                ['content' => 'Standard Barment Notice Content']
            );

            foreach ($properties as $property) {
                \App\Models\Notice::create([
                    'property_id' => $property->id,
                    'template_id' => $template->id,
                    'recipient_name' => 'Owner Record', // simplified
                    'recipient_address' => $property->address,
                    'sent_date' => now(),
                    'status' => 'Sent',
                    'created_by' => Auth::id() ?? 1 // fallback if no auth
                ]);
            }

            $pdf = Pdf::loadView('pdf.barment_letter', ['properties' => $properties]);

            // Return raw output with explicit headers to avoid CORS issues with download() helper
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="barment-notices.pdf"');

        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }

    public function storeLog(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'nullable|exists:properties,id',
            'recipient_name' => 'required|string',
            'sent_date' => 'required|date',
            'status' => 'required|string',
            'tracking_number' => 'nullable|string',
            'type' => 'nullable|string'
        ]);

        $template = null;
        if ($request->filled('type')) {
             $template = \App\Models\NoticeTemplate::firstOrCreate(
                ['name' => $request->type],
                ['content' => 'Manual Entry']
            );
        }

        $notice = \App\Models\Notice::create([
            'property_id' => $request->property_id,
            'template_id' => $template ? $template->id : null,
            'recipient_name' => $validated['recipient_name'],
            'recipient_address' => $request->property_id ? Property::find($request->property_id)->address : 'Manual Entry',
            'sent_date' => $validated['sent_date'],
            'status' => $validated['status'],
            'tracking_number' => $validated['tracking_number'],
            'created_by' => Auth::id() ?? 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Log entry created successfully',
            'data' => $notice
        ]);
    }

    public function show($id): JsonResponse
    {
        $property = Property::with(['barmentCase', 'notices.template'])->findOrFail($id);
        
        $data = [
            'id' => $property->id,
            'parcelId' => $property->parcel_id,
            'address' => $property->address,
            'county' => $property->county,
            'status' => $property->workflow_stage,
            'barmentCase' => $property->barmentCase,
            'notices' => $property->notices->map(function($n) {
                return [
                    'id' => $n->id,
                    'date' => $n->sent_date ? $n->sent_date->format('M d, Y') : 'N/A',
                    'type' => $n->template ? $n->template->name : 'Notice',
                    'status' => $n->status
                ];
            })
        ];

        return response()->json($data);
    }
}
