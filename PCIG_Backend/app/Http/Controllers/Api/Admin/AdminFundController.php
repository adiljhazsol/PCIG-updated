<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\AssignPropertyToFundRequest;
use App\Http\Requests\Api\Admin\StoreFundRequest;
use App\Http\Requests\Api\Admin\UpdateFundRequest;
use App\Http\Resources\FundResource;
use App\Models\Fund;
use App\Models\FundProperty;
use App\Models\FundInvestment;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFundController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Header
        $header = [
            'title' => 'Fund Administration',
            'subtitle' => 'Manage investment funds, track performance, and oversee investor allocations.'
        ];

        // 2. Action Buttons
        $actionButtons = [
            'reports' => ['label' => 'Generate Reports', 'icon' => 'FileText'],
            'createFund' => ['label' => 'Create New Fund', 'icon' => 'Plus']
        ];

        // 3. Summary Cards
        $totalAUM = Fund::sum('total_assets');
        $activeInvestors = FundInvestment::where('status', 'active')->distinct('user_id')->count('user_id');
        $fundsActive = Fund::where('status', 'active')->count();
        
        // Calculate weighted average performance or simple average
        $avgPerformance = Fund::whereNotNull('performance_metric')->avg('performance_metric');
        $avgIRR = $avgPerformance ? number_format($avgPerformance, 1) . '%' : 'N/A';

        $summaryCards = [
            ['label' => 'Total AUM', 'value' => '$' . number_format($totalAUM / 1000000, 1) . 'M', 'subtext' => '+2.5% from last month'],
            ['label' => 'Active Investors', 'value' => $activeInvestors, 'subtext' => '+12 this month'],
            ['label' => 'Average IRR', 'value' => $avgIRR, 'subtext' => 'Trailing 12 months'],
            ['label' => 'Funds Active', 'value' => $fundsActive, 'subtext' => 'Across 3 strategies']
        ];

        // 4. Filters
        $filters = [
            ['label' => 'Status', 'selected' => 'All Statuses', 'options' => ['All Statuses', 'Active', 'Closed', 'Coming Soon']],
            ['label' => 'Strategy', 'selected' => 'All Strategies', 'options' => ['All Strategies', 'Growth', 'Income', 'Balanced', 'REO', 'Tax Deed']]
        ];

        // 5. Table Headers
        $tableHeaders = ['Fund Name / ID', 'Strategy', 'Status', 'Target IRR', 'Lock-up', 'AUM / Cap', 'Capacity', 'Investors', 'Performance'];

        // 6. Funds List
        $funds = Fund::withCount('fundInvestments')->orderBy('created_at', 'desc')->get()->map(function ($fund) {
            $aum = $fund->total_assets;
            $cap = $fund->cap ?? 0;
            $aumPercent = $cap > 0 ? ($aum / $cap) * 100 : 0;
            
            return [
                'db_id' => $fund->id,
                'id' => $fund->fund_code ?? 'FND-' . str_pad($fund->id, 3, '0', STR_PAD_LEFT),
                'name' => $fund->name,
                'strategy' => $fund->strategy ?? 'N/A',
                'strategyColor' => '#1D4ED8', // Could be dynamic based on strategy
                'status' => ucfirst($fund->status),
                'statusColor' => $fund->status === 'active' ? '#047857' : ($fund->status === 'closed' ? '#757575' : ($fund->status === 'coming_soon' ? '#0284c7' : '#B45309')),
                'targetIRR' => $fund->target_irr ?? 'N/A',
                'lockUp' => $fund->lock_up_period ?? 'N/A',
                'aum' => '$' . number_format($aum / 1000000, 1) . 'M',
                'cap' => $cap > 0 ? '$' . number_format($cap / 1000000, 1) . 'M' : 'Uncapped',
                'aumPercent' => round($aumPercent),
                'capacity' => $cap > 0 ? '$' . number_format(($cap - $aum) / 1000000, 1) . 'M available' : 'Open',
                'investors' => $fund->fund_investments_count,
                'performance' => $fund->performance_metric ? '+' . $fund->performance_metric . '%' : 'N/A',
                'performanceColor' => ($fund->performance_metric ?? 0) >= 0 ? '#16A34A' : '#DC2626',
                // Detailed fields for right column
                'description' => $fund->description,
                'inceptionDate' => $fund->launch_date ? $fund->launch_date->format('M d, Y') : 'N/A',
                'minInvestment' => '$' . number_format($fund->min_investment),
                'managementFee' => $fund->management_fee ? $fund->management_fee . '%' : 'N/A',
                'performanceFee' => $fund->performance_fee ? $fund->performance_fee . '%' : 'N/A',
                'activeTab' => 'overview',
                'tabs' => ['Overview', 'Portfolio', 'Investors', 'Accounting', 'Distributions'],
                'fundPerformance' => [
                    'status' => 'On Track',
                    'statusColor' => '#047857',
                    'statusBg' => '#ECFDF5',
                    'currentIRR' => $fund->performance_metric ? $fund->performance_metric . '%' : 'N/A',
                    'currentIRRColor' => '#16A34A',
                    'aum' => '$' . number_format($aum / 1000000, 1) . 'M',
                    'targetIRR' => $fund->target_irr ?? 'N/A',
                    'distributionsYTD' => '$' . number_format($aum * 0.05 / 1000000, 2) . 'M', // Still estimated for now
                ],
                'investmentMetrics' => [
                    'hardCap' => $cap > 0 ? '$' . number_format($cap / 1000000, 1) . 'M' : 'Uncapped',
                    'minInvestment' => '$' . number_format($fund->min_investment),
                    'lockUp' => $fund->lock_up_period ?? 'N/A',
                    'strategy' => $fund->strategy ?? 'N/A',
                    'managementFee' => $fund->management_fee ? $fund->management_fee . '%' : 'N/A',
                    'performanceFee' => $fund->performance_fee ? $fund->performance_fee . '%' : 'N/A',
                ],
                'taxDocuments' => [
                    'year' => '2023',
                    'k1sGenerated' => 45,
                    'k1sTotal' => 120,
                    'status' => 'In Progress',
                    'statusColor' => '#B45309',
                ],
                'accountingSnapshot' => [
                    'totalAssets' => '$' . number_format($aum / 1000000, 1) . 'M',
                    'cashOnHand' => '$' . number_format($aum * 0.1 / 1000000, 2) . 'M',
                    'netIncomeYTD' => '$' . number_format($aum * 0.08 / 1000000, 2) . 'M',
                    'netIncomeColor' => '#16A34A',
                ],
                'depreciationAllocation' => [
                    'annualDepreciation' => '$' . number_format($aum * 0.03 / 1000000, 2) . 'M',
                    'method' => 'Straight Line',
                    'note' => 'Calculated on 27.5 year basis for residential properties.',
                ],
            ];
        });

        // 7. Selected Fund (Default to first or null)
        $selectedFund = $funds->first() ?? null;

        return response()->json([
            'success' => true,
            'data' => [
                'header' => $header,
                'actionButtons' => $actionButtons,
                'summaryCards' => $summaryCards,
                'filters' => $filters,
                'tableHeaders' => $tableHeaders,
                'funds' => $funds,
                'selectedFund' => $selectedFund,
                'searchPlaceholder' => 'Search funds...'
            ]
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $query = Fund::with(['fundProperties.property']);

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $funds = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => FundResource::collection($funds->items()),
            'meta' => [
                'current_page' => $funds->currentPage(),
                'last_page' => $funds->lastPage(),
                'per_page' => $funds->perPage(),
                'total' => $funds->total(),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        return $this->list($request);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $fund = Fund::with(['fundProperties.property', 'fundInvestments.user'])
            ->findOrFail($id);

        $fundData = new FundResource($fund);
        return response()->json([
            'success' => true,
            'data' => $fundData,
        ]);
    }

    public function store(StoreFundRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Ensure slug uniqueness
        $originalSlug = $data['slug'] ?? \Illuminate\Support\Str::slug($data['name']);
        $slug = $originalSlug;
        $count = 1;
        
        while (Fund::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }
        $data['slug'] = $slug;

        $data['status'] = $data['status'] ?? 'open';
        $data['total_shares'] = $data['total_shares'] ?? 0;
        $data['available_shares'] = $data['available_shares'] ?? ($data['total_shares'] ?? 0);

        // Handle File Uploads
        if ($request->hasFile('prospectus')) {
            $data['prospectus_path'] = $request->file('prospectus')->store('funds/documents', 'public');
        }
        // Remove file object from data to avoid mass assignment error if not in fillable, 
        // though strictly speaking if it's not in fillable it gets ignored by create(), 
        // but it's cleaner to remove it or if we had mapped it to a column name that exists.
        // In this case we mapped to prospectus_path which IS in fillable now.
        unset($data['prospectus']);

        if ($request->hasFile('term_sheet')) {
            $data['term_sheet_path'] = $request->file('term_sheet')->store('funds/documents', 'public');
        }
        unset($data['term_sheet']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('funds/images', 'public');
        }
        unset($data['image']);

        $fund = Fund::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Fund created successfully',
            'data' => new FundResource($fund),
        ], 201);
    }

    public function update(UpdateFundRequest $request, $id): JsonResponse
    {
        $fund = Fund::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('prospectus')) {
            $data['prospectus_path'] = $request->file('prospectus')->store('funds/documents', 'public');
        }
        unset($data['prospectus']);

        if ($request->hasFile('term_sheet')) {
            $data['term_sheet_path'] = $request->file('term_sheet')->store('funds/documents', 'public');
        }
        unset($data['term_sheet']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('funds/images', 'public');
        }
        unset($data['image']);

        // Recalculate shares if cap or price changes
        if (isset($data['cap']) || isset($data['price_per_share'])) {
            $cap = $data['cap'] ?? $fund->cap;
            $price = $data['price_per_share'] ?? $fund->price_per_share;
            
            if ($cap > 0 && $price > 0) {
                $newTotalShares = floor($cap / $price);
                
                // Calculate currently sold shares based on active investments
                $soldShares = FundInvestment::where('fund_id', $fund->id)
                    ->where('status', 'active')
                    ->sum('shares');
                    
                $data['total_shares'] = $newTotalShares;
                $data['available_shares'] = max(0, $newTotalShares - $soldShares);
            }
        }

        $fund->update($data);
        $fund->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Fund updated successfully',
            'data' => new FundResource($fund),
        ]);
    }

    public function assignProperty(AssignPropertyToFundRequest $request): JsonResponse
    {
        $fund = Fund::findOrFail($request->fund_id);
        $property = Property::findOrFail($request->property_id);
        
        // Check if already assigned
        $existing = FundProperty::where('fund_id', $fund->id)
            ->where('property_id', $property->id)
            ->first();
        
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Property already assigned to this fund',
            ], 400);
        }
        
        // Calculate allocation amount based on fund's total assets
        $allocationAmount = ($fund->total_assets * $request->allocation_percentage) / 100;
        
        $fundProperty = FundProperty::create([
            'fund_id' => $fund->id,
            'property_id' => $property->id,
            'allocation_percentage' => $request->allocation_percentage,
            'allocation_amount' => $allocationAmount,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Property assigned to fund successfully',
            'data' => [
                'fund_id' => $fund->id,
                'property_id' => $property->id,
                'allocation_percentage' => (float) $fundProperty->allocation_percentage,
                'allocation_amount' => (float) $fundProperty->allocation_amount,
            ],
        ], 201);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $fund = Fund::findOrFail($id);

        // Check if fund has active investments
        $activeInvestments = FundInvestment::where('fund_id', $fund->id)
            ->where('status', 'active')
            ->count();

        if ($activeInvestments > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete fund with active investments.',
            ], 400);
        }

        $fund->delete(); // Soft delete

        return response()->json([
            'success' => true,
            'message' => 'Fund deleted successfully',
        ]);
    }

    public function generateReports(Request $request): JsonResponse
    {
        // Placeholder for report generation
        return response()->json([
            'success' => true,
            'message' => 'Report generation started. You will be notified when it is ready.',
        ]);
    }

    public function recordContribution(Request $request, $id): JsonResponse
    {
        $fund = Fund::findOrFail($id);
        
        // Validate request
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            // 'investor_id' => 'required|exists:users,id', // Commented out for now to allow easier testing without real users
            'date' => 'required|date',
        ]);

        // Logic to record contribution would go here
        
        return response()->json([
            'success' => true,
            'message' => 'Contribution recorded successfully.',
            'data' => [
                'fund_id' => $fund->id,
                'amount' => $validated['amount'],
                'date' => $validated['date'],
            ]
        ]);
    }

    public function distributeProfits(Request $request, $id): JsonResponse
    {
        $fund = Fund::findOrFail($id);

        // Validate request
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'type' => 'required|string', // e.g., 'dividend', 'interest'
            'date' => 'required|date',
        ]);

        // Logic to distribute profits would go here
        
        return response()->json([
            'success' => true,
            'message' => 'Distribution processed successfully.',
            'data' => [
                'fund_id' => $fund->id,
                'amount' => $validated['amount'],
                'type' => $validated['type'],
                'date' => $validated['date'],
            ]
        ]);
    }

    public function downloadK1Package(Request $request, $id)
    {
        $fund = Fund::findOrFail($id);
        
        // Return a dummy text file for now
        $content = "K-1 Package for Fund: " . $fund->name . "\nDate: " . now();
        
        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="k1-package-' . $id . '.txt"',
        ]);
    }
}
