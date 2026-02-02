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
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class InvestorPropertyController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $query = Property::with(['primaryImage', 'redemptionTracking']);

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

        // Only show properties with available shares - DISABLED per user request to show ALL properties
        // $query->where('available_shares', '>', 0);

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
            // ->where('available_shares', '>', 0) // Disabled to allow viewing sold properties
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new PropertyResource($property),
        ]);
    }

    public function detailDashboardData(Request $request, $id): JsonResponse
    {
        $property = Property::with(['redemptionTracking', 'sheriffSale', 'reoLease'])->findOrFail($id);
        
        $typeMap = [
            'tax_deed' => 'Tax Deed',
            'sheriff_sale' => 'Sheriff Sale',
            'reo' => 'REO',
            'acquisition' => 'Acquisition'
        ];
        
        $header = [
            'type' => $typeMap[$property->workflow_stage] ?? 'Tax Deed',
            'address' => $property->address,
            'status' => ucfirst($property->status),
            'lastUpdated' => $property->updated_at->format('M d, Y')
        ];

        // 2. Alerts (Mock logic based on status/deadlines)
        $alerts = [];
        if ($property->status === 'redemption' && $property->redemptionTracking) {
            $deadline = $property->redemptionTracking->redemption_deadline;
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

        // Redemption Engine Calculations
        $bidPrice = $property->purchase_price ?? 0;
        $penaltyRate = 0.20; // Standard 20% penalty
        if ($property->redemptionTracking) {
             $redemptionAmount = $property->redemptionTracking->redemption_amount;
             $interest = $redemptionAmount - $bidPrice;
             $deadline = $property->redemptionTracking->redemption_deadline;
        } else {
             // Estimate
             $interest = $bidPrice * $penaltyRate;
             $deadline = null;
        }
        
        $countdown = [
            'days' => 0,
            'hours' => 0,
            'minutes' => 0
        ];
        
        if ($deadline) {
            $now = now();
            if ($deadline->gt($now)) {
                $diff = $deadline->diff($now);
                $countdown['days'] = $diff->days;
                $countdown['hours'] = $diff->h;
                $countdown['minutes'] = $diff->i;
            }
        }
        
        $redemptionEngine = [
            'bidPrice' => '$' . number_format($bidPrice, 2),
            'penaltyRate' => ($penaltyRate * 100) . '%',
            'accruedInterest' => '$' . number_format($interest, 2),
            'totalRedemption' => '$' . number_format($bidPrice + $interest, 2),
            'dailyInterest' => '$' . number_format(($bidPrice * $penaltyRate) / 365, 2),
            'nextPenaltyDate' => now()->addMonths(1)->format('M d, Y'),
            'deadline' => $deadline ? $deadline->format('M d, Y') : 'N/A',
            'countdown' => $countdown,
            'expenses' => '$0.00',
            'estimatedPayoff' => '$' . number_format($bidPrice + $interest, 2),
            'dailyAccrual' => [
                'amount' => '$' . number_format(($bidPrice * $penaltyRate) / 365, 2),
                'per' => 'per day'
            ]
        ];
        
        // Add investment details
        $investmentDetails = [
            'id' => $property->id,
            'address' => $property->address,
            'price_per_share' => (float) $property->price_per_share,
            'available_shares' => (int) $property->available_shares,
        ];

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
                ['label' => 'Legal Description', 'value' => $property->legal_description ?? 'N/A'],
                ['label' => 'Zoning', 'value' => $property->zoning ?? 'N/A'],
                ['label' => 'Lot Size', 'value' => $property->lot_size ?? 'N/A'],
                ['label' => 'Year Built', 'value' => $property->year_built ?? 'N/A']
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
                'propertyInfo' => $propertyInfo,
                'investmentDetails' => $investmentDetails
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
                'investment_id' => 'INV-' . strtoupper(uniqid()),
                'name' => $property->address ?? 'Property Investment',
                'type' => 'Property',
                'property_id' => $property->id,
                'shares' => $request->shares,
                'amount' => $amount,
                'current_value' => (string) $amount,
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

    public function generatePayoffLetter($id)
    {
        try {
            $property = Property::with(['redemptionTracking', 'interestCalculations'])->findOrFail($id);
            // Reusing the same PDF view as Admin
            $pdf = Pdf::loadView('pdf.payoff_letter', compact('property'));
            
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="payoff_letter_' . $property->id . '.pdf"')
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        } catch (\Exception $e) {
            Log::error('Payoff Letter Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
    }
}
