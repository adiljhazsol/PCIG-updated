<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\StorePropertyRequest;
use App\Http\Requests\Api\Admin\UpdatePropertyRequest;
use App\Http\Requests\Api\Admin\UploadPropertyImageRequest;
use App\Http\Requests\Api\Admin\UploadPropertyDocumentRequest;
use App\Http\Requests\Api\Admin\UpdatePropertyStageRequest;
use App\Http\Requests\Api\Admin\ProcessFIFARequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\PropertyDocument;
use App\Models\Deadline;
use App\Models\ShareListing;
use App\Models\ShareTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPropertyController extends Controller
{
    public function workflowHub(): JsonResponse
    {
        // 1. Header
        $header = [
            'title' => 'Properties Workflow Hub',
            'subtitle' => 'Navigate and manage all property workflow stages.'
        ];

        // 2. Workflow Path
        $workflowPath = [
            'Research', 'FIFA', 'Auction', 'Redemption', 'Barment', 'QT', 'REO'
        ];

        // 3. Lifecycle Workflow
        // Map DB stages to Frontend Labels and Colors
        $stageMapping = [
            'research' => ['label' => 'Research', 'color' => '#16A34A', 'bg' => '#EFF6FF'],
            'tax_appeal' => ['label' => 'Tax Appeal', 'color' => '#F59E0B', 'bg' => '#FFFBEB'],
            'fifa_processing' => ['label' => 'FIFA Processing', 'color' => '#DC2626', 'bg' => '#FFFBEB'],
            'auction' => ['label' => 'Auction', 'color' => '#EA580C', 'bg' => '#FEF3C7'],
            'redemption' => ['label' => 'Redemption', 'color' => '#DC2626', 'bg' => '#FEF2F2'],
            'barment' => ['label' => 'Barment', 'color' => '#EA580C', 'bg' => '#FFF7ED'],
            'quiet_title' => ['label' => 'Quiet Title', 'color' => '#4F46E5', 'bg' => '#EEF2FF'],
            'reo_disposition' => ['label' => 'REO', 'color' => '#1E3A5F', 'bg' => '#F1F5F9'],
        ];

        $stagesData = [];
        foreach ($stageMapping as $dbStage => $meta) {
            $count = Property::where('workflow_stage', $dbStage)->count();
            
            // Check for overdue deadlines in this stage
            $overdueCount = Deadline::whereHas('property', function($q) use ($dbStage) {
                $q->where('workflow_stage', $dbStage);
            })->where('deadline_date', '<', now())->count();
            
            $status = $overdueCount > 0 ? 'Attention Needed' : 'Active';
            $statusColor = $overdueCount > 0 ? '#EF4444' : $meta['color'];
            
            $stagesData[] = [
                'label' => $meta['label'],
                'value' => $count . ' properties',
                'status' => $status,
                'statusColor' => $statusColor,
                'bg' => $meta['bg']
            ];
        }

        $lifecycleWorkflow = [
            'title' => 'Property Lifecycle Workflow',
            'buttonText' => 'All Properties',
            'stages' => $stagesData
        ];

        // 4. Stage Panels
        $stagePanels = [];
        foreach ($stageMapping as $dbStage => $meta) {
            $stagePanels[] = [
                'name' => $meta['label'],
                'count' => Property::where('workflow_stage', $dbStage)->count() . ' properties'
            ];
        }
        // Add Surplus if needed
        $stagePanels[] = [
            'name' => 'Surplus',
            'count' => Property::where('workflow_stage', 'surplus')->count() . ' properties'
        ];

        // 5. Stage Panel Items
        $stagePanelItems = [
            ['label' => 'Active', 'value' => Property::where('status', 'active')->count()],
            ['label' => 'On Hold', 'value' => Property::where('status', 'on_hold')->count()],
            ['label' => 'Completed', 'value' => Property::where('status', 'completed')->count()]
        ];

        // 6. Exports/Letters/Uploads
        $pendingExports = \App\Models\SheriffSale::where('status', 'scheduled')->where('sale_date', '>', now())->count();
        $pendingNotices = \App\Models\Notice::where('status', 'pending')->count();
        $pendingUploads = \App\Models\PropertyDocument::where('created_at', '>=', now()->subDays(7))->count();

        $exportsLettersUploads = [
            ['title' => 'Sheriff Exports', 'value' => $pendingExports . ' scheduled', 'icon' => 'UploadCloud'],
            ['title' => 'Notice Letters', 'value' => $pendingNotices . ' pending', 'icon' => 'Inbox'],
            ['title' => 'Recent Uploads', 'value' => $pendingUploads . ' this week', 'icon' => 'FileText']
        ];

        // 7. Properties Table Rows
        // Fetch properties with needed fields
        $properties = Property::select('id', 'parcel_id', 'address', 'city', 'state', 'zip_code', 'workflow_stage', 'status', 'created_at', 'updated_at', 'assigned_user_id')
            ->with(['assignedUser', 'redemptionTracking'])
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        $rows = $properties->map(function ($prop) use ($stageMapping) {
            // Map DB stage to Frontend Label
            $stageLabel = isset($stageMapping[$prop->workflow_stage]) ? $stageMapping[$prop->workflow_stage]['label'] : ($prop->workflow_stage ?? 'Unassigned');
            
            // Determine deadline (prioritize redemption deadline if applicable)
            $deadline = 'N/A';
            if ($prop->redemptionTracking && $prop->redemptionTracking->expiration_date) {
                $deadline = $prop->redemptionTracking->expiration_date->format('M d, Y');
            } else {
                 $nextDeadline = \App\Models\Deadline::where('property_id', $prop->id)
                    ->where('deadline_date', '>=', now())
                    ->orderBy('deadline_date', 'asc')
                    ->first();
                 if ($nextDeadline) {
                     $deadline = $nextDeadline->deadline_date->format('M d, Y');
                 }
            }
            
            return [
                'id' => $prop->parcel_id ?? ('PROP-' . $prop->id),
                'address' => $prop->address . ', ' . $prop->city, // Simplified address
                'stage' => $stageLabel,
                'days' => $prop->updated_at ? $prop->updated_at->diffInDays() . ' days' : '0 days',
                'assigned' => $prop->assignedUser ? $prop->assignedUser->name : 'Unassigned',
                'action' => 'View',
                'deadline' => $deadline
            ];
        });

        $propertiesTable = [
            'title' => 'Properties by Workflow Stage',
            'subtitle' => 'View all properties organized by current stage.',
            'filterText' => 'All Stages',
            'searchPlaceholder' => 'Search...',
            'headers' => ['PCIG ID', 'Property Address', 'Stage', 'Days in Stage', 'Assigned To', 'Action', 'Deadline'],
            'rows' => $rows
        ];

        $actionItemsSummary = [
            'title' => 'Action Items',
            'subtitle' => 'Tasks requiring your attention',
            'buttonText' => 'View All Items',
            'count' => 0,
            'actionItems' => []
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'header' => $header,
                'workflowPath' => $workflowPath,
                'lifecycleWorkflow' => $lifecycleWorkflow,
                'stagePanels' => $stagePanels,
                'stagePanelItems' => $stagePanelItems,
                'exportsLettersUploads' => $exportsLettersUploads,
                'propertiesTable' => $propertiesTable,
                'actionItemsSummary' => $actionItemsSummary
            ]
        ]);
    }

    public function listForDropdown(): JsonResponse
    {
        $properties = Property::select('id', 'address', 'city', 'state', 'parcel_id')
            ->orderBy('address')
            ->get();

        return response()->json($properties);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['images', 'documents']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('parcel_id', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by workflow stage
        if ($request->has('workflow_stage')) {
            $query->where('workflow_stage', $request->workflow_stage);
        }

        // Filter by state/county
        if ($request->has('state')) {
            $query->where('state', $request->state);
        }
        if ($request->has('county')) {
            $query->where('county', $request->county);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
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

    public function documentsDashboardData(Request $request, $id): JsonResponse
    {
        // Handle "PROP-" prefix if present
        if (str_starts_with($id, 'PROP-')) {
            $id = str_replace('PROP-', '', $id);
        }
        
        $property = Property::with(['documents'])->findOrFail($id);

        // 1. Header
        $header = [
            'address' => $property->address ?? 'Unknown Address',
            'id' => $property->parcel_id ?? ('PROP-' . $property->id),
            'location' => ($property->city ?? 'Unknown') . ', ' . ($property->state ?? 'FL') . ' ' . ($property->zip_code ?? ''),
            'status' => ucwords(str_replace('_', ' ', $property->workflow_stage ?? 'Research')),
        ];

        // 3. Folders
        // Define folder structure
        $foldersDef = [
            ['id' => 'deeds-titles', 'name' => 'Deeds & Titles', 'description' => 'Tax deeds, title docs', 'icon' => 'FileText', 'types' => ['deed', 'title'], 'required' => true],
            ['id' => 'liens', 'name' => 'Liens & Encumbrances', 'description' => 'Tax liens, releases', 'icon' => 'FileWarning', 'types' => ['lien', 'release'], 'required' => false],
            ['id' => 'fifa', 'name' => 'FIFA Documents', 'description' => 'Notices, intake forms', 'icon' => 'File', 'types' => ['fifa', 'notice'], 'required' => true],
            ['id' => 'barment', 'name' => 'Barment & Foreclosure', 'description' => 'Notice letters, tracking', 'icon' => 'Mail', 'types' => ['barment', 'foreclosure'], 'required' => false],
            ['id' => 'quiet-title', 'name' => 'Quiet Title', 'description' => 'Complaints, filings', 'icon' => 'Gavel', 'types' => ['quiet_title', 'complaint'], 'required' => false],
            ['id' => 'auction', 'name' => 'Auction & Sale', 'description' => 'Bid sheets, results', 'icon' => 'Gavel', 'types' => ['auction', 'bid'], 'required' => false],
            ['id' => 'redemption', 'name' => 'Redemption & Payoff', 'description' => 'Payoff letters, receipts', 'icon' => 'DollarSign', 'types' => ['redemption', 'payoff'], 'required' => false],
            ['id' => 'reo', 'name' => 'REO Documents', 'description' => 'Leases, sale contracts', 'icon' => 'Home', 'types' => ['reo', 'lease', 'contract'], 'required' => false],
            ['id' => 'tax', 'name' => 'Tax & Appeals', 'description' => 'Assessments, appeals', 'icon' => 'FileBarChart', 'types' => ['tax', 'appeal'], 'required' => true],
            ['id' => 'sheriff', 'name' => 'Sheriff & Levy', 'description' => 'Levy docs, exports', 'icon' => 'Shield', 'types' => ['sheriff', 'levy'], 'required' => false],
            ['id' => 'invoices', 'name' => 'Invoices & Receipts', 'description' => 'Expenses, bills', 'icon' => 'DollarSign', 'types' => ['invoice', 'receipt'], 'required' => false],
            ['id' => 'legal', 'name' => 'Legal & Contracts', 'description' => 'Agreements, assignments', 'icon' => 'Scale', 'types' => ['legal', 'agreement'], 'required' => false],
        ];

        $folders = [];
        $missingRequiredCount = 0;
        
        foreach ($foldersDef as $def) {
            $count = $property->documents->filter(function($doc) use ($def) {
                return in_array($doc->type, $def['types']);
            })->count();
            
            $isMissing = $def['required'] && $count === 0;
            if ($isMissing) {
                $missingRequiredCount++;
            }

            $folders[] = [
                'id' => $def['id'],
                'name' => $def['name'],
                'description' => $def['description'],
                'count' => $count . ' files',
                'icon' => $def['icon'],
                'types' => $def['types'], // Include types for frontend filtering
                'hasNew' => $property->documents->whereIn('type', $def['types'])->where('created_at', '>=', now()->subDays(7))->isNotEmpty(),
                'missing' => $isMissing
            ];
        }

        // Update header with real missing count
        $header['missingRequired'] = $missingRequiredCount;

        // 4. All Documents (for list view)
        $documents = $property->documents->sortByDesc('created_at')->map(function($doc) {
            return [
                'name' => $doc->file_name,
                'category' => ucfirst($doc->type),
                'type' => $doc->type, // Include raw type for accurate filtering
                'date' => $doc->created_at->format('M d, Y'),
                'size' => number_format($doc->file_size / 1024, 2) . ' KB',
                'status' => 'Uploaded',
                'statusColor' => '#475569',
                'statusBg' => '#F1F5F9',
                'icon' => 'File',
                'iconColor' => '#64748B'
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'header' => $header,
                'folders' => $folders,
                'documents' => $documents
            ]
        ]);
    }

    public function detailDashboardData(Request $request, $id): JsonResponse
    {
        // Handle "PROP-" prefix if present
        if (str_starts_with($id, 'PROP-')) {
            $id = str_replace('PROP-', '', $id);
        }

        $property = Property::with([
            'images',
            'documents',
            'investments.user',
            'reoProperty',
            'auction',
            'redemptionTracking',
            'sheriffSale',
            'quietTitleCase',
            'taxAppeals',
            'barmentCase'
        ])->findOrFail($id);

        // 1. Header
        $header = [
            'details' => 'Detail Overview • ' . ($property->parcel_id ?? 'Unknown ID'),
            'address' => $property->address ?? 'Unknown Address',
            'status' => ucfirst($property->status ?? 'pending'),
            'type' => $property->property_type ?? 'Tax Deed',
        ];

        // 2. Alerts
        $alerts = [];
        if ($property->status === 'redemption' && $property->redemptionTracking) {
            $deadline = $property->redemptionTracking->expiration_date;
            if ($deadline && $deadline->diffInDays(now()) < 7) {
                $alerts[] = [
                    'type' => 'critical',
                    'message' => 'Redemption deadline expiring in ' . $deadline->diffInDays(now()) . ' days.',
                ];
            }
        }
        // Add default alert if none
        if (empty($alerts)) {
             $alerts[] = [
                'type' => 'info',
                'message' => 'Property is currently in ' . ($property->workflow_stage ?? 'research') . ' stage.',
            ];
        }

        // 3. Redemption Engine
        $redemptionEngine = [
            'countdown' => [
                'days' => 0,
                'hours' => 0,
                'minutes' => 0
            ],
            'deadline' => 'N/A',
            'deadlineIso' => null,
            'bidPrice' => '$' . number_format($property->purchase_price ?? 0, 2),
            'accruedInterest' => '$0.00',
            'expenses' => '$0.00',
            'estimatedPayoff' => '$0.00',
            'dailyAccrual' => ['amount' => '$0.00', 'per' => 'day'],
            'breakdown' => []
        ];

        if ($property->redemptionTracking) {
            $deadline = $property->redemptionTracking->redemption_deadline;
            if ($deadline) {
                $now = now();
                $diff = $now->diff($deadline);
                $redemptionEngine['countdown'] = [
                    'days' => $diff->days,
                    'hours' => $diff->h,
                    'minutes' => $diff->i
                ];
                $redemptionEngine['deadline'] = $deadline->format('M d, Y');
                $redemptionEngine['deadlineIso'] = $deadline->toIso8601String();
            }
            $bidPrice = $property->purchase_price ?? 0;
            
            // Use InterestCalculation if available, otherwise fallback to estimation
            if ($property->interestCalculations->count() > 0) {
                $interest = $property->interestCalculations->sum('calculated_amount');
            } else {
                $interest = $bidPrice * 0.12; // 12% estimation
            }

            // Calculate Expenses
            $expensesTotal = \App\Models\Expense::where('property_id', $property->id)->sum('amount');
            $expenseItems = \App\Models\Expense::where('property_id', $property->id)
                ->select('description', 'amount', 'date', 'category')
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($exp) {
                    return [
                        'description' => $exp->description,
                        'amount' => '$' . number_format($exp->amount, 2),
                        'date' => $exp->date->format('M d, Y'),
                        'category' => $exp->category
                    ];
                });

            $redemptionEngine['expenses'] = '$' . number_format($expensesTotal, 2);
            $redemptionEngine['accruedInterest'] = '$' . number_format($interest, 2);
            $redemptionEngine['estimatedPayoff'] = '$' . number_format($bidPrice + $interest + $expensesTotal, 2);
            $redemptionEngine['dailyAccrual']['amount'] = '$' . number_format($interest / 365, 2);
            $redemptionEngine['breakdown'] = $expenseItems;
        }

        // 4. Workflow Timeline
        $stages = ['research', 'fifa', 'auction', 'redemption', 'barment', 'quiet_title', 'reo_disposition'];
        $currentStageIndex = array_search($property->workflow_stage, $stages);
        if ($currentStageIndex === false) $currentStageIndex = 0;

        $workflowTimeline = [];
        foreach ($stages as $index => $stage) {
            $status = 'pending';
            if ($index < $currentStageIndex) $status = 'completed';
            elseif ($index === $currentStageIndex) $status = 'active';

            $workflowTimeline[] = [
                'label' => ucwords(str_replace('_', ' ', $stage)),
                'status' => $status,
                'date' => $status === 'completed' ? 'Completed' : ($status === 'active' ? 'In Progress' : ''), // simplified
                'assignee' => $status === 'active' ? 'Team' : ''
            ];
        }

        // 5. Module Connections
        $moduleConnections = [
            [
                'name' => 'Sheriff Sale',
                'status' => $property->sheriffSale ? 'Connected' : 'Not Connected',
                'color' => $property->sheriffSale ? 'green' : 'gray',
                'icon' => 'Gavel',
                'link' => '/admin/sheriff'
            ],
            [
                'name' => 'Redemption',
                'status' => $property->redemptionTracking ? 'Active' : 'Inactive',
                'color' => $property->redemptionTracking ? 'orange' : 'gray',
                'icon' => 'Clock',
                'link' => '/admin/redemption'
            ],
            [
                'name' => 'Tax Appeal',
                'status' => $property->taxAppeals()->exists() ? 'Active' : 'Inactive',
                'color' => $property->taxAppeals()->exists() ? 'blue' : 'gray',
                'icon' => 'FileText',
                'link' => '/admin/operations/property-tax-appeal'
            ],
            [
                'name' => 'FIFA Processing',
                'status' => $property->workflow_stage === 'fifa_processing' ? 'Active' : 'Inactive',
                'color' => $property->workflow_stage === 'fifa_processing' ? 'red' : 'gray',
                'icon' => 'File',
                'link' => '/admin/fifa-processing'
            ],
            [
                'name' => 'Barment',
                'status' => $property->barmentCase ? 'Active' : 'Inactive',
                'color' => $property->barmentCase ? 'orange' : 'gray',
                'icon' => 'Shield',
                'link' => '/admin/barment'
            ],
            [
                'name' => 'Quiet Title',
                'status' => $property->quietTitleCase ? 'Active' : 'Inactive',
                'color' => $property->quietTitleCase ? 'indigo' : 'gray',
                'icon' => 'Gavel',
                'link' => '/admin/quiet-title'
            ],
            [
                'name' => 'REO Disposition',
                'status' => $property->reoProperty ? 'Active' : 'Inactive',
                'color' => $property->reoProperty ? 'blue' : 'gray',
                'icon' => 'Home',
                'link' => '/admin/reo/disposition'
            ],
        ];

        // 6. Documents
        $documents = $property->documents->map(function($doc) {
            return [
                'name' => $doc->name,
                'type' => $doc->type,
                'date' => $doc->created_at->format('M d, Y'),
                'size' => 'Unknown', // Add size to DB if needed
                'uploadedBy' => 'Admin' // Add uploader to DB if needed
            ];
        });

        // 7. Activity Log (Mock for now, or use AuditLog if linked)
        $activityLog = [
            [
                'action' => 'Property Viewed',
                'user' => 'Current User',
                'time' => 'Just now',
                'icon' => 'Eye'
            ]
        ];

        // 8. Property Info
        $propertyInfo = [
            'details' => [
                ['label' => 'Parcel ID', 'value' => $property->parcel_id],
                ['label' => 'Legal Description', 'value' => $property->legal_description ?? 'N/A'],
                ['label' => 'Zoning', 'value' => $property->zoning ?? 'N/A'],
                ['label' => 'Lot Size', 'value' => $property->lot_size ?? 'N/A'],
                ['label' => 'Year Built', 'value' => $property->year_built ?? 'N/A']
            ],
            'financials' => [
                 ['label' => 'Purchase Price', 'value' => '$' . number_format($property->purchase_price, 2)],
                 ['label' => 'Current Value', 'value' => '$' . number_format($property->current_value, 2)],
                 ['label' => 'Est. ROI', 'value' => $property->roi . '%']
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'header' => $header,
                'alerts' => $alerts,
                'redemptionEngine' => $redemptionEngine,
                'workflowTimeline' => $workflowTimeline,
                'moduleConnections' => $moduleConnections,
                'documents' => $documents,
                'activityLog' => $activityLog,
                'propertyInfo' => $propertyInfo
            ]
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::with(['images', 'documents', 'investments.user', 'reoProperty', 'auction'])
            ->findOrFail($id);

        // Get investment summary
        $investmentSummary = [
            'total_investments' => $property->investments()->count(),
            'total_invested' => $property->investments()->sum('amount'),
            'total_shares_sold' => $property->investments()->sum('shares'),
        ];

        $propertyData = new PropertyResource($property);
        $propertyArray = $propertyData->toArray($request);
        $propertyArray['investment_summary'] = $investmentSummary;

        return response()->json([
            'success' => true,
            'data' => $propertyArray,
        ]);
    }

    public function store(StorePropertyRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Set defaults
        $data['status'] = $data['status'] ?? 'active';
        $data['total_shares'] = $data['total_shares'] ?? 0;
        $data['available_shares'] = $data['available_shares'] ?? ($data['total_shares'] ?? 0);
        
        // Handle required DB fields that are nullable in request
        $propertyCode = $data['property_code'] ?? ($data['parcel_id'] ?? uniqid('PROP-'));
        $location = $data['location'] ?? (($data['city'] ?? '') . ', ' . ($data['state'] ?? ''));
        $data['county'] = $data['county'] ?? 'Unknown';
        $data['zip_code'] = $data['zip_code'] ?? '00000';
        $data['current_value'] = $data['current_value'] ?? 0;
        $data['purchase_date'] = $data['purchase_date'] ?? now();
        $data['purchase_price'] = $data['purchase_price'] ?? 0;
        $data['price_per_share'] = $data['price_per_share'] ?? 0;

        $property = new Property();
        $property->fill($data);
        $property->property_code = $propertyCode;
        $property->location = $location;
        $property->save();

        // Handle Redemption Tracking
        if (isset($data['redemption_deadline']) && $data['redemption_deadline']) {
            $property->redemptionTracking()->updateOrCreate(
                ['property_id' => $property->id],
                [
                    'redemption_deadline' => $data['redemption_deadline'],
                    'status' => 'pending'
                ]
            );
        }

        // Automate deadline generation based on initial stage
        if ($property->workflow_stage) {
            $this->handleWorkflowStageChange($property, null, $property->workflow_stage);
        }

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully',
            'data' => new PropertyResource($property),
        ], 201);
    }

    public function update(UpdatePropertyRequest $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $data = $request->validated();
        
        $oldStage = $property->workflow_stage;

        $property->update($data);
        $property->refresh();

        // Check if stage changed
        if (isset($data['workflow_stage']) && $data['workflow_stage'] !== $oldStage) {
            $this->handleWorkflowStageChange($property, $oldStage, $data['workflow_stage']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Property updated successfully',
            'data' => new PropertyResource($property),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);

        // Check if property has active investments
        $activeInvestments = $property->investments()->where('status', 'active')->count();

        if ($activeInvestments > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete property with active investments.',
            ], 400);
        }

        $property->delete(); // Soft delete

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully',
        ]);
    }

    public function uploadImage(UploadPropertyImageRequest $request): JsonResponse
    {
        $property = Property::findOrFail($request->property_id);
        
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('properties/' . $property->id . '/images', $fileName, 'public');
            
            // If this is primary, unset other primary images
            if ($request->is_primary) {
                PropertyImage::where('property_id', $property->id)
                    ->update(['is_primary' => false]);
            }
            
            $image = PropertyImage::create([
                'property_id' => $property->id,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'order' => $request->order ?? 0,
                'is_primary' => $request->is_primary ?? false,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'id' => $image->id,
                    'file_path' => Storage::url($filePath),
                    'file_name' => $image->file_name,
                    'is_primary' => $image->is_primary,
                ],
            ], 201);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No image file provided',
        ], 400);
    }

    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'document' => 'required|file|max:51200',
            'type' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }
        
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $filePath = $file->storeAs('properties/' . $property->id . '/documents', $fileName, 'public');
            
            $document = PropertyDocument::create([
                'property_id' => $property->id,
                'type' => $request->type,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_by' => $request->user() ? $request->user()->id : null,
                'uploaded_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'id' => $document->id,
                    'type' => $document->type,
                    'file_path' => Storage::url($filePath),
                    'file_name' => $document->file_name,
                    'uploaded_at' => $document->uploaded_at->format('Y-m-d H:i:s'),
                ],
            ], 201);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'No document file provided',
        ], 400);
    }

    public function downloadDocuments(Request $request, $id)
    {
        $property = Property::findOrFail($id);
        $types = $request->input('types'); // array or comma-separated string
        
        if (is_string($types)) {
            $types = explode(',', $types);
        }

        $query = $property->documents();
        
        if (!empty($types)) {
            $query->whereIn('type', $types);
        }
        
        $documents = $query->get();
        
        if ($documents->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No documents found'], 404);
        }

        if ($documents->count() === 1) {
             return Storage::download($documents->first()->file_path, $documents->first()->file_name);
        }
        
        // Create Zip
        $zipFileName = 'documents_' . $property->parcel_id . '_' . time() . '.zip';
        $zipPath = storage_path('app/public/temp/' . $zipFileName);
        
        // Ensure temp dir exists
        if (!file_exists(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
            foreach ($documents as $doc) {
                if (Storage::disk('public')->exists($doc->file_path)) {
                    $localPath = Storage::disk('public')->path($doc->file_path);
                    $zip->addFile($localPath, $doc->file_name);
                }
            }
            $zip->close();
        }
        
        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    public function deleteImage(Request $request, $id): JsonResponse
    {
        $image = PropertyImage::findOrFail($id);
        
        // Delete file from storage
        if (Storage::disk('public')->exists($image->file_path)) {
            Storage::disk('public')->delete($image->file_path);
        }
        
        $image->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }

    public function deleteDocument(Request $request, $id): JsonResponse
    {
        $document = PropertyDocument::findOrFail($id);
        
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully',
        ]);
    }

    public function updateStage(UpdatePropertyStageRequest $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $oldStage = $property->workflow_stage;
        
        $property->update([
            'workflow_stage' => $request->workflow_stage,
        ]);
        
        $this->handleWorkflowStageChange($property, $oldStage, $request->workflow_stage);
        
        // Log workflow change (you can add activity log here later)
        
        return response()->json([
            'success' => true,
            'message' => 'Workflow stage updated successfully',
            'data' => [
                'property_id' => $property->id,
                'old_stage' => $oldStage,
                'new_stage' => $property->workflow_stage,
            ],
        ]);
    }

    public function workflowProperties(Request $request): JsonResponse
    {
        $stages = [
            'fifa_import',
            'fifa_processing',
            'sheriff',
            'redemption',
            'barment',
            'quiet_title',
            'auction',
            'reo_disposition',
            'reo_leased',
            'completed',
        ];
        
        $workflowData = [];
        
        foreach ($stages as $stage) {
            $properties = Property::where('workflow_stage', $stage)
                ->with(['primaryImage', 'investments'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            $workflowData[$stage] = PropertyResource::collection($properties);
        }
        
        // Also include properties without workflow stage
        $unassigned = Property::whereNull('workflow_stage')
            ->with(['primaryImage', 'investments'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $workflowData['unassigned'] = PropertyResource::collection($unassigned);
        
        return response()->json([
            'success' => true,
            'data' => $workflowData,
        ]);
    }

    public function shareListings(Request $request): JsonResponse
    {
        $query = ShareListing::with(['seller', 'property']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $listings->items(),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    public function shareTransactions(Request $request): JsonResponse
    {
        $query = ShareTransaction::with(['listing.property', 'buyer', 'seller']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->date_to);
        }

        $sortBy = $request->get('sort_by', 'transaction_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function fifaProcessing(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'fifa_processing')
            ->with(['primaryImage', 'investments']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

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

    public function processFIFA(ProcessFIFARequest $request, $id): JsonResponse
    {
        $property = Property::where('workflow_stage', 'fifa_processing')
            ->findOrFail($id);

        if ($request->action === 'approve') {
            $nextStage = $request->next_stage ?? 'sheriff';
            $oldStage = $property->workflow_stage;
            
            $property->update([
                'workflow_stage' => $nextStage,
            ]);

            $this->handleWorkflowStageChange($property, $oldStage, $nextStage);

            return response()->json([
                'success' => true,
                'message' => 'Property approved and moved to ' . $nextStage . ' stage',
                'data' => new PropertyResource($property),
            ]);
        } else {
            // Reject - move back or mark as failed
            $property->update([
                'workflow_stage' => null,
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Property rejected',
                'data' => new PropertyResource($property),
            ]);
        }
    }

    /**
     * Handle automated tasks when workflow stage changes.
     */
    private function handleWorkflowStageChange(Property $property, ?string $oldStage, string $newStage): void
    {
        // Define deadline rules for each stage
        // Format: 'stage_name' => ['type', days_offset, 'Description']
        $rules = [
            'tax_appeal' => ['tax_appeal', 30, 'File Tax Appeal'],
            'fifa_processing' => ['filing', 14, 'Process FIFA Documents'],
            'sheriff' => ['filing', 45, 'Sheriff Sale Preparation'],
            'redemption' => ['redemption', 365, 'Redemption Period Expiration'], // 1 year default?
            'barment' => ['filing', 30, 'Initiate Barment Proceedings'],
            'quiet_title' => ['legal', 60, 'File Quiet Title Action'],
            'reo_disposition' => ['marketing', 14, 'Prepare for REO Disposition'],
        ];

        if (array_key_exists($newStage, $rules)) {
            [$type, $days, $description] = $rules[$newStage];

            // Check if a pending deadline of this type already exists for this property
            // to avoid duplicates when updating property details without changing stage intent
            $exists = Deadline::where('property_id', $property->id)
                ->where('type', $type)
                ->where('status', 'pending')
                ->exists();

            if (!$exists) {
                Deadline::create([
                    'property_id' => $property->id,
                    'type' => $type,
                    'deadline_date' => now()->addDays($days),
                    'description' => $description,
                    'status' => 'pending',
                ]);
            }
        }
    }
}
