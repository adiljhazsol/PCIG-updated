<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Investment;
use App\Models\FundInvestment;
use App\Models\Transaction;
use App\Models\Distribution;
use App\Models\Depreciation;
use App\Models\K1Form;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvestorDashboardController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Calculate Available Cash (Wallet Balance)
        // Formula: Deposits + Sales + Distributions - Withdrawals - Purchases
        // Note: Using whereIn to handle potential case inconsistencies in database
        $deposits = Transaction::where('user_id', $user->id)->whereIn('type', ['deposit', 'Deposit'])->where('status', 'completed')->sum('amount');
        $withdrawals = Transaction::where('user_id', $user->id)->whereIn('type', ['withdrawal', 'Withdrawal'])->whereIn('status', ['completed', 'pending', 'processing'])->sum('amount');
        $purchases = Transaction::where('user_id', $user->id)->whereIn('type', ['purchase', 'Purchase'])->whereIn('status', ['completed', 'pending', 'processing'])->sum('amount');
        $sales = Transaction::where('user_id', $user->id)->whereIn('type', ['sale', 'Sale'])->where('status', 'completed')->sum('amount');
        $distributions = Transaction::where('user_id', $user->id)->whereIn('type', ['distribution', 'Distribution'])->where('status', 'completed')->sum('amount');

        $availableCash = $deposits + $sales + $distributions - $withdrawals - $purchases;

        // 2. Total Investment Value
        $propertyInvestmentsValue = Investment::where('user_id', $user->id)
            ->where('status', 'active')
            ->sum('amount');

        $fundInvestmentsValue = FundInvestment::where('user_id', $user->id)
            ->where('status', 'active')
            ->sum('amount');

        $totalInvestmentValue = $propertyInvestmentsValue + $fundInvestmentsValue;

        // 3. Active Properties Count
        $activePropertiesCount = Investment::where('user_id', $user->id)
            ->where('status', 'active')
            ->distinct('property_id')
            ->count('property_id');

        // 4. Returns
        $ytdReturns = DB::table('distributions')
            ->where('user_id', $user->id)
            ->where('status', 'processed')
            ->whereYear('distribution_date', now()->year)
            ->sum('amount');

        $allTimeReturns = DB::table('distributions')
            ->where('user_id', $user->id)
            ->where('status', 'processed')
            ->sum('amount');

        // 5. Pending Distributions
        $pendingDistributions = DB::table('distributions')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        // 6. Recent Transactions
        $recentTransactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // 7. Property Investments List
        $propertyInvestments = Investment::with(['property.depreciations'])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get()
            ->map(function ($inv) {
                if (!$inv->property) {
                    return null;
                }
                
                // Calculate depreciation for the last full tax year (e.g., previous year)
                $lastTaxYear = now()->year - 1;
                $depreciationRecord = $inv->property->depreciations->where('tax_year', $lastTaxYear)->first();
                $totalShares = $inv->property->total_shares > 0 ? $inv->property->total_shares : 1;
                $ownershipPct = $inv->shares / $totalShares;
                
                $depreciationValue = '0% Depr.';
                if ($depreciationRecord) {
                    $userDepreciation = $depreciationRecord->depreciation_amount * $ownershipPct;
                    $depreciationValue = '$' . number_format($userDepreciation, 0) . ' Depr.';
                }

                return [
                    'id' => $inv->property->id,
                    'name' => $inv->property->address,
                    'details' => $inv->property->city . ', ' . $inv->property->state,
                    'status' => $inv->property->status,
                    'statusBgColor' => $inv->property->status === 'active' ? '#DCFCE7' : '#F1F5F9',
                    'statusColor' => $inv->property->status === 'active' ? '#166534' : '#64748B',
                    'currentValue' => '$' . number_format($inv->amount, 2),
                    'interest' => ($inv->property->roi ?? 0) . '% ROI',
                    'interestColor' => '#10B981',
                    'depreciation' => $depreciationValue,
                    'depreciationColor' => '#64748B',
                ];
            })
            ->filter()
            ->values();

        // 8. Fund Investments List
        $fundInvestments = FundInvestment::with('fund')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => $inv->fund->id,
                    'name' => $inv->fund->name,
                    'details' => 'Fund Investment',
                    'image_url' => $inv->fund->image_path ? asset('storage/' . $inv->fund->image_path) : null,
                    'currentValue' => '$' . number_format($inv->amount, 2),
                    'returns' => '0% Returns', // Placeholder
                    'returnsColor' => '#10B981',
                    'depreciation' => '0% Depr.', // Placeholder
                    'depreciationColor' => '#64748B',
                ];
            });

        // 9. Depreciation Breakdown
        $depreciationBreakdown = [];
        // Re-query investments with property and depreciations if needed, or reuse from above logic if structure allows.
        // Since propertyInvestments is already mapped to frontend structure, let's query again for raw data logic
        $investmentsForDepreciation = Investment::with(['property.depreciations'])
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->get();

        foreach ($investmentsForDepreciation as $inv) {
            if (!$inv->property) continue;

            $totalShares = $inv->property->total_shares > 0 ? $inv->property->total_shares : 1;
            $ownershipPct = $inv->shares / $totalShares;

            // Sort depreciations by year descending
            $depreciations = $inv->property->depreciations->sortByDesc('tax_year');
            
            $runningTotal = 0;
            // Calculate cumulative? Or just list them. 
            // Usually cumulative is up to that year. 
            // Let's iterate ascending first to calculate cumulative, then store.
            
            $tempDepRows = [];
            foreach ($inv->property->depreciations->sortBy('tax_year') as $dep) {
                $annualDep = $dep->depreciation_amount * $ownershipPct;
                $runningTotal += $annualDep;
                
                // Fetch K-1 Status
                $k1 = K1Form::where('user_id', $user->id)
                    ->where('tax_year', $dep->tax_year)
                    ->first();
                $k1Status = $k1 ? ucfirst(str_replace('_', ' ', $k1->status)) : 'Pending';

                $tempDepRows[] = [
                    'property' => $inv->property->address,
                    'year' => (string)$dep->tax_year,
                    'annual' => '$' . number_format($annualDep, 2),
                    'cumulative' => '$' . number_format($runningTotal, 2),
                    'ownership' => number_format($ownershipPct * 100, 2) . '%',
                    'schedule' => ucfirst(str_replace('_', ' ', $dep->method)) . ' (' . $dep->useful_life_years . ' yrs)',
                    'k1_status' => $k1Status,
                    'raw_year' => $dep->tax_year
                ];
            }
            // Add to main list
            $depreciationBreakdown = array_merge($depreciationBreakdown, $tempDepRows);
        }

        // Sort breakdown by year descending (newest first)
        usort($depreciationBreakdown, function($a, $b) {
            return $b['raw_year'] <=> $a['raw_year'];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'total_investment_value' => (float) $totalInvestmentValue,
                'active_properties_count' => $activePropertiesCount,
                'ytd_returns' => (float) $ytdReturns,
                'all_time_returns' => (float) $allTimeReturns,
                'pending_distributions' => (float) $pendingDistributions,
                'available_cash' => (float) $availableCash,
                'recent_transactions' => TransactionResource::collection($recentTransactions),
                'property_investments' => $propertyInvestments,
                'fund_investments' => $fundInvestments,
                'depreciation_breakdown' => $depreciationBreakdown,
            ],
        ]);
    }
}
