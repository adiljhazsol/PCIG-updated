<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\Investor\InvestPropertyRequest;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\Distribution;
use Illuminate\Support\Facades\DB;

class InvestorPropertyController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $query = Property::with('primaryImage');

        // Search by address or parcel ID
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

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price_per_share', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_per_share', '<=', $request->max_price);
        }

        // Filter by ROI
        if ($request->has('min_roi')) {
            $query->where('roi', '>=', $request->min_roi);
        }

        // Only show properties with available shares
        $query->where('available_shares', '>', 0);

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
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

    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::with(['images', 'documents'])
            ->where('available_shares', '>', 0)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PropertyResource($property),
        ]);
    }

    public function detailDashboardData(Request $request, $id): JsonResponse
    {
        $property = Property::with([
            'images',
            'documents',
            'investments.user',
            'reoProperty',
            'auction',
            'redemptionTracking',
            'sheriffSale',
            'quietTitleCase',
            'barmentCase'
        ])->findOrFail($id);

        // 1. Header
        $header = [
            'details' => 'Detail Overview • ' . ($property->parcel_id ?? 'Unknown ID'),
            'address' => $property->address ?? 'Unknown Address',
            'status' => ucfirst($property->status ?? 'pending'),
            'type' => 'Tax Deed', // Mock or derive
        ];

        // 2. Alerts (Mock logic based on status/deadlines)
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
            'bidPrice' => '$' . number_format($property->purchase_price ?? 0, 2),
            'accruedInterest' => '$0.00',
            'expenses' => '$0.00',
            'estimatedPayoff' => '$0.00',
            'dailyAccrual' => ['amount' => '$0.00', 'per' => 'day']
        ];

        if ($property->redemptionTracking) {
            $deadline = $property->redemptionTracking->expiration_date;
            if ($deadline) {
                $now = now();
                $diff = $now->diff($deadline);
                $redemptionEngine['countdown'] = [
                    'days' => $diff->days,
                    'hours' => $diff->h,
                    'minutes' => $diff->i
                ];
                $redemptionEngine['deadline'] = $deadline->format('M d, Y');
            }
            // Mock calculations for now
            $bidPrice = $property->purchase_price ?? 0;
            $interest = $bidPrice * 0.12; // 12% mock
            $redemptionEngine['accruedInterest'] = '$' . number_format($interest, 2);
            $redemptionEngine['estimatedPayoff'] = '$' . number_format($bidPrice + $interest, 2);
            $redemptionEngine['dailyAccrual']['amount'] = '$' . number_format($interest / 365, 2);
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
                // 'date' and 'assignee' not used in Investor view based on admin.json but good to have if needed
            ];
        }

        // 5. Module Connections
        $moduleConnections = [
            [
                'label' => 'Sheriff Sale', // Investor view uses 'label' not 'name' in some places, checking admin.json... actually admin.json uses 'label' in moduleConnections
                'status' => $property->sheriffSale ? 'Connected' : 'Not Connected',
                'color' => $property->sheriffSale ? 'green' : 'gray',
            ],
            [
                'label' => 'Redemption',
                'status' => $property->redemptionTracking ? 'Active' : 'Inactive',
                'color' => $property->redemptionTracking ? 'orange' : 'gray',
            ],
             // Add more modules as needed
        ];

        // 6. Documents (Folder structure for Investor)
        $foldersDef = [
            ['name' => 'Deeds & Titles', 'icon' => 'FileText', 'types' => ['deed', 'title']],
            ['name' => 'Liens & Encumbrances', 'icon' => 'FileWarning', 'types' => ['lien', 'release']],
            ['name' => 'FIFA Documents', 'icon' => 'File', 'types' => ['fifa', 'notice']],
            ['name' => 'Barment & Foreclosure', 'icon' => 'Mail', 'types' => ['barment', 'foreclosure']],
            ['name' => 'Quiet Title', 'icon' => 'Gavel', 'types' => ['quiet_title', 'complaint']],
            ['name' => 'Auction & Sale', 'icon' => 'Gavel', 'types' => ['auction', 'bid']],
            ['name' => 'Redemption & Payoff', 'icon' => 'DollarSign', 'types' => ['redemption', 'payoff']],
            ['name' => 'REO Documents', 'icon' => 'Home', 'types' => ['reo', 'lease', 'contract']],
            ['name' => 'Correspondence', 'icon' => 'Mail', 'types' => ['correspondence', 'letter']],
        ];

        $folders = [];
        foreach ($foldersDef as $def) {
            $count = $property->documents->filter(function($doc) use ($def) {
                return in_array($doc->type, $def['types']);
            })->count();
            
            if ($count > 0) { // Only show folders with files? Or all? admin.json shows some
                $folders[] = [
                    'name' => $def['name'],
                    'files' => $count . ' files',
                    'icon' => $def['icon'],
                ];
            }
        }
        
        // Ensure at least some folders exist if empty
        if (empty($folders)) {
             $folders[] = [
                'name' => 'General Documents',
                'files' => '0 files',
                'icon' => 'File'
             ];
        }

        $documents = [
            'count' => $property->documents->count() . ' Files',
            'folders' => $folders
        ];

        // 7. Activity Log (Mock for now)
        $activityLog = [
            [
                'action' => 'Property Viewed',
                'timestamp' => 'Just now', // Investor view uses 'timestamp' not 'time'
                'icon' => 'Eye'
            ]
        ];

        // 8. Property Info
        $propertyInfo = [
            'details' => [
                ['label' => 'Parcel ID', 'value' => $property->parcel_id],
                ['label' => 'Legal Description', 'value' => 'Lot 5 Block 3...'], // Mock or add field
                ['label' => 'Zoning', 'value' => 'Residential'], // Mock or add field
                ['label' => 'Lot Size', 'value' => '0.25 Acres'], // Mock or add field
                ['label' => 'Year Built', 'value' => '1985'] // Mock or add field
            ],
            // Investor view might have different sections, but sticking to structure for now
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

    public function invest(InvestPropertyRequest $request): JsonResponse
    {
        $user = $request->user();

        DB::beginTransaction();
        try {
            $property = Property::lockForUpdate()->findOrFail($request->property_id);

            // Validate available shares
            if ($property->available_shares < $request->shares) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough shares available.',
                ], 400);
            }

            // Calculate investment amount
            $amount = $request->shares * $property->price_per_share;

            // Create investment
            $investment = Investment::create([
                'user_id' => $user->id,
                'property_id' => $property->id,
                'shares' => $request->shares,
                'amount' => $amount,
                'price_per_share' => $property->price_per_share,
                'purchase_date' => now(),
                'status' => 'active',
            ]);

            // Update property available shares
            $property->available_shares -= $request->shares;
            $property->save();

            // Create transaction record
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'investment',
                'amount' => $amount,
                'property_id' => $property->id,
                'investment_id' => $investment->id,
                'description' => "Investment in {$property->address}",
                'status' => 'completed',
                'reference_number' => 'INV-' . str_pad($investment->id, 8, '0', STR_PAD_LEFT),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Investment created successfully',
                'data' => [
                    'investment_id' => $investment->id,
                    'shares' => $investment->shares,
                    'amount' => (float) $investment->amount,
                    'property' => new PropertyResource($property),
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Investment failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function investmentSummary(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $property = Property::findOrFail($id);

        // Get user's investment in this property
        $investment = Investment::where('user_id', $user->id)
            ->where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        if (!$investment) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_investment' => false,
                    'investment' => null,
                    'total_distributions' => 0,
                    'total_return' => 0,
                ],
            ]);
        }

        // Get distributions for this investment
        $distributions = Distribution::where('investment_id', $investment->id)
            ->where('status', 'processed')
            ->get();

        $totalDistributions = $distributions->sum('amount');
        $totalReturn = $totalDistributions - $investment->amount;

        return response()->json([
            'success' => true,
            'data' => [
                'has_investment' => true,
                'investment' => [
                    'id' => $investment->id,
                    'shares' => $investment->shares,
                    'amount' => (float) $investment->amount,
                    'price_per_share' => (float) $investment->price_per_share,
                    'purchase_date' => $investment->purchase_date->format('Y-m-d'),
                ],
                'total_distributions' => (float) $totalDistributions,
                'total_return' => (float) $totalReturn,
                'return_percentage' => $investment->amount > 0 ? (float) (($totalReturn / $investment->amount) * 100) : 0,
                'distributions_count' => $distributions->count(),
            ],
        ]);
    }
}
