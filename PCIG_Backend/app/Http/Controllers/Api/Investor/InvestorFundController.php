<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Resources\FundResource;
use App\Models\Fund;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\Investor\InvestFundRequest;
use App\Models\FundInvestment;
use App\Models\Transaction;
use App\Models\Distribution;
use Illuminate\Support\Facades\DB;

class InvestorFundController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $query = Fund::query();

        // Only show open funds if status is not provided, or filter by status
        // Some funds might be 'active' instead of 'open', check your database values
        // Based on seeder/tinker output, status can be 'active', 'open', 'closed'
        
        // If frontend doesn't send status, maybe we should show all active/open funds?
        // Let's check what the frontend sends. The user prompt says:
        // /api/investor/funds?page=1&per_page=15&sort_by=created_at&sort_order=desc
        
        // The previous code had: $query->where('status', 'open');
        // But some funds in DB have status 'active'.
        
        $query->whereIn('status', ['open', 'active']);

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Filter by minimum investment
        if ($request->has('max_min_investment')) {
            $query->where('min_investment', '<=', $request->max_min_investment);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
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

    public function show(Request $request, $id): JsonResponse
    {
        $fund = Fund::with(['fundProperties.property', 'fundInvestments'])
            ->whereIn('status', ['open', 'active'])
            ->findOrFail($id);

        // Calculate fund composition
        $composition = $fund->fundProperties->map(function($fp) {
            return [
                'property_id' => $fp->property_id,
                'property_address' => $fp->property->address ?? null,
                'allocation_percentage' => (float) $fp->allocation_percentage,
                'allocation_amount' => (float) $fp->allocation_amount,
            ];
        });

        $fundData = new FundResource($fund);
        $fundArray = $fundData->toArray($request);
        $fundArray['composition'] = $composition;

        return response()->json([
            'success' => true,
            'data' => $fundArray,
        ]);
    }

    public function invest(InvestFundRequest $request): JsonResponse
    {
        $user = $request->user();

        DB::beginTransaction();
        try {
            $fund = Fund::lockForUpdate()->findOrFail($request->fund_id);

            // Validate fund is open or active
            if (!in_array($fund->status, ['open', 'active'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fund is not open for investment.',
                ], 400);
            }

            // Validate minimum investment
            if ($request->amount < $fund->min_investment) {
                return response()->json([
                    'success' => false,
                    'message' => "Minimum investment is $" . number_format($fund->min_investment, 2),
                ], 400);
            }

            // Calculate shares
            $shares = floor($request->amount / $fund->price_per_share);

            if ($shares < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Investment amount too low.',
                ], 400);
            }

            // Validate available shares
            if ($fund->available_shares < $shares) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not enough shares available.',
                ], 400);
            }

            // Calculate actual amount (shares * price)
            $actualAmount = $shares * $fund->price_per_share;

            // Create fund investment
            $fundInvestment = FundInvestment::create([
                'user_id' => $user->id,
                'fund_id' => $fund->id,
                'shares' => $shares,
                'amount' => $actualAmount,
                'price_per_share' => $fund->price_per_share,
                'purchase_date' => now(),
                'status' => 'active',
            ]);

            // Update fund available shares and NAV
            $fund->available_shares -= $shares;
            $fund->total_assets += $actualAmount;
            $fund->current_nav += $actualAmount;
            $fund->save();

            // Create transaction record
            Transaction::create([
                'user_id' => $user->id,
                'type' => 'investment',
                'amount' => $actualAmount,
                'fund_id' => $fund->id,
                'description' => "Investment in {$fund->name}",
                'status' => 'completed',
                'reference_number' => 'FUND-INV-' . str_pad($fundInvestment->id, 8, '0', STR_PAD_LEFT),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Fund investment created successfully',
                'data' => [
                    'fund_investment_id' => $fundInvestment->id,
                    'shares' => $fundInvestment->shares,
                    'amount' => (float) $fundInvestment->amount,
                    'fund' => new FundResource($fund),
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
        $fund = Fund::findOrFail($id);

        // Get user's investment in this fund
        $fundInvestment = FundInvestment::where('user_id', $user->id)
            ->where('fund_id', $fund->id)
            ->where('status', 'active')
            ->first();

        if (!$fundInvestment) {
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

        // Get distributions for this fund investment
        $distributions = Distribution::where('fund_investment_id', $fundInvestment->id)
            ->where('status', 'processed')
            ->get();

        $totalDistributions = $distributions->sum('amount');
        $totalReturn = $totalDistributions - $fundInvestment->amount;

        // Calculate current value based on NAV
        $currentValue = ($fundInvestment->shares * $fund->price_per_share);
        $unrealizedGain = $currentValue - $fundInvestment->amount;

        return response()->json([
            'success' => true,
            'data' => [
                'has_investment' => true,
                'investment' => [
                    'id' => $fundInvestment->id,
                    'shares' => $fundInvestment->shares,
                    'amount' => (float) $fundInvestment->amount,
                    'price_per_share' => (float) $fundInvestment->price_per_share,
                    'purchase_date' => $fundInvestment->purchase_date->format('Y-m-d'),
                ],
                'current_value' => (float) $currentValue,
                'total_distributions' => (float) $totalDistributions,
                'total_return' => (float) $totalReturn,
                'unrealized_gain' => (float) $unrealizedGain,
                'total_gain' => (float) ($totalReturn + $unrealizedGain),
                'return_percentage' => $fundInvestment->amount > 0 ? (float) (($totalReturn / $fundInvestment->amount) * 100) : 0,
                'distributions_count' => $distributions->count(),
            ],
        ]);
    }
}
