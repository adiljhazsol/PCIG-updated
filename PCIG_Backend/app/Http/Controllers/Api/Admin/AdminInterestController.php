<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

use App\Models\Fund;
use App\Models\User;

class AdminInterestController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Calculate Interest for Properties in Redemption
        $properties = Property::with('redemptionTracking')
            ->where('workflow_stage', 'redemption')
            ->get();

        $totalAccrued = 0;
        $outstanding = 0;

        $interestRows = $properties->map(function ($prop) use (&$totalAccrued, &$outstanding) {
            $baseAmount = $prop->purchase_price ?? 0;
            $rate = 0.20; // 20% statutory interest
            
            // Determine start date
            $startDate = $prop->redemptionTracking ? $prop->redemptionTracking->start_date : $prop->created_at;
            $daysElapsed = $startDate ? now()->diffInDays($startDate) : 0;
            
            $accrued = $baseAmount * $rate * ($daysElapsed / 365);
            $daily = ($baseAmount * $rate) / 365;
            
            $totalAccrued += $accrued;
            $outstanding += ($baseAmount + $accrued);

            return [
                'id' => (string)$prop->id,
                'address' => $prop->address,
                'interestType' => 'Tax Deed',
                'typeColor' => '#1E40AF', // Blue text
                'typeBg' => '#DBEAFE',    // Blue bg
                'rate' => ($rate * 100) . '%',
                'rateType' => 'Statutory',
                'principal' => '$' . number_format($baseAmount, 2),
                'accruedInterest' => '$' . number_format($accrued, 2),
                'lastUpdate' => 'Today',
                'perDay' => '$' . number_format($daily, 2),
                'startDate' => $startDate ? $startDate->format('M d, Y') : 'N/A',
                'daysElapsed' => $daysElapsed . ' days',
                'status' => 'Active'
            ];
        });

        // Fund Interest Data
        $funds = Fund::all();
        $fundRows = $funds->map(function ($fund) {
            $targetIrr = $fund->target_irr ?? 15.0; // Default 15% if null
            // Extract first number found (handles "12-14%" or "15%")
            if (is_string($targetIrr) && preg_match('/(\d+(\.\d+)?)/', $targetIrr, $matches)) {
                $targetIrr = (float) $matches[1];
            } elseif (is_numeric($targetIrr)) {
                $targetIrr = (float) $targetIrr;
            } else {
                $targetIrr = 0;
            }
            
            $totalAssets = $fund->total_assets ?? 0;
            if (is_string($totalAssets) && preg_match('/(\d+(\.\d+)?)/', $totalAssets, $matches)) {
                $totalAssets = (float) $matches[1];
            } elseif (is_numeric($totalAssets)) {
                $totalAssets = (float) $totalAssets;
            } else {
                $totalAssets = 0;
            }

            // Mock accrued return calculation (e.g. 5% of assets for now)
            $accruedReturn = $totalAssets * ($targetIrr / 100) * (30/365); // 30 days worth

            return [
                'id' => (string)$fund->id,
                'name' => $fund->name,
                'fundCode' => $fund->fund_code,
                'targetIrr' => $targetIrr . '%',
                'totalAssets' => '$' . number_format($totalAssets, 2),
                'accruedReturn' => '$' . number_format($accruedReturn, 2),
                'status' => $fund->status ?? 'Active'
            ];
        });

        // Investor Interest Data
        $investors = User::role('investor')->with('fundInvestments')->get();
        $investorRows = $investors->map(function ($investor) {
            $totalInvested = $investor->fundInvestments->sum('amount');
            // Mock accrued interest (e.g. 1% of invested capital)
            $accrued = $totalInvested * 0.01; 
            
            // Determine status based on email verification or other factors
            $status = $investor->email_verified_at ? 'Active' : 'Pending';

            return [
                'id' => (string)$investor->id,
                'name' => $investor->name,
                'email' => $investor->email,
                'role' => 'Investor',
                'totalInvested' => '$' . number_format($totalInvested, 2),
                'accruedInterest' => '$' . number_format($accrued, 2),
                'status' => $status,
                'lastDistribution' => 'N/A'
            ];
        });

        // Configuration Data
        $configuration = [
            'statutoryRate' => 20.0,
            'compounding' => 'Daily',
            'gracePeriod' => 0,
            'engineEnabled' => true,
            'autoRecalculate' => true
        ];

        // Mock Logs
        $logs = [
            ['id' => 1, 'timestamp' => now()->subMinutes(5)->format('Y-m-d H:i:s'), 'action' => 'Auto-Calculation', 'details' => 'Processed 24 properties', 'status' => 'Success'],
            ['id' => 2, 'timestamp' => now()->subHours(1)->format('Y-m-d H:i:s'), 'action' => 'Manual Trigger', 'details' => 'User initiated recalculation', 'status' => 'Success'],
            ['id' => 3, 'timestamp' => now()->subHours(5)->format('Y-m-d H:i:s'), 'action' => 'Rate Update', 'details' => 'Statutory rate verified', 'status' => 'Info'],
        ];

        // 2. Financial Summary Stats (Top Cards)
        $stats = [
            [
                'label' => 'Total Interest Accrued',
                'value' => '$' . number_format($totalAccrued, 2),
                'subtext' => 'Across active assets',
                'icon' => 'TrendingUp',
                'color' => '#16A34A'
            ],
            [
                'label' => 'Avg. Interest Rate',
                'value' => '20.0%',
                'subtext' => 'Statutory blended',
                'icon' => 'PieChart',
                'color' => '#64748B'
            ],
            [
                'label' => 'Outstanding Principal',
                'value' => '$' . number_format($outstanding - $totalAccrued, 2),
                'subtext' => 'Active capital',
                'icon' => 'Activity',
                'color' => '#64748B'
            ],
             [
                'label' => 'Active Assets',
                'value' => $properties->count(),
                'subtext' => 'Accruing interest',
                'icon' => 'Home',
                'color' => '#3B82F6'
            ]
        ];

        // 3. Engine Status (Footer)
        $engineStatus = [
            'lastRun' => 'Just now',
            'nextRun' => '00:58',
            'calculationsToday' => number_format($properties->count() * 24),
            'avgTime' => '45ms'
        ];

        return response()->json([
            'stats' => $stats,
            'propertyInterest' => $interestRows,
            'engineStatus' => $engineStatus,
            'fundInterest' => $fundRows, 
            'investorInterest' => $investorRows,
            'configuration' => $configuration,
            'logs' => $logs
        ]);
    }

    public function index()
    {
        return response()->json(['message' => 'History endpoint']);
    }

    public function pending()
    {
        return response()->json(['message' => 'Pending endpoint']);
    }

    public function calculate(Request $request)
    {
        // Simulate calculation engine run
        // In a real scenario, this would trigger a Job or iterate through all properties
        
        $properties = Property::where('workflow_stage', 'redemption')->get();
        $count = 0;
        
        foreach ($properties as $property) {
            // Logic to update or create InterestCalculation record would go here
            // For now, we just simulate the activity
            $count++;
        }

        return response()->json([
            'message' => 'Interest recalculation started successfully',
            'count' => $count
        ]);
    }

    public function export(Request $request)
    {
        $properties = Property::with('redemptionTracking')
            ->where('workflow_stage', 'redemption')
            ->get();

        $csvData = [];
        $csvData[] = ['Property', 'Interest Type', 'Rate', 'Principal', 'Accrued Interest', 'Per-Day', 'Start Date', 'Status'];

        foreach ($properties as $prop) {
            $baseAmount = $prop->purchase_price ?? 0;
            $rate = 0.20;
            $startDate = $prop->redemptionTracking ? $prop->redemptionTracking->start_date : $prop->created_at;
            $daysElapsed = $startDate ? now()->diffInDays($startDate) : 0;
            $accrued = $baseAmount * $rate * ($daysElapsed / 365);
            $daily = ($baseAmount * $rate) / 365;

            $csvData[] = [
                $prop->address,
                'Tax Deed',
                '20.0%',
                number_format($baseAmount, 2),
                number_format($accrued, 2),
                number_format($daily, 2),
                $startDate ? $startDate->format('Y-m-d') : 'N/A',
                'Active'
            ];
        }

        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=interest_report_" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ]);
    }

    public function toggleInvestorStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        // Toggle status logic: use email_verified_at as proxy for Active/Pending
        if ($user->email_verified_at) {
            $user->email_verified_at = null;
        } else {
            $user->email_verified_at = now();
        }
        $user->save();

        return response()->json([
            'message' => 'Investor status updated successfully', 
            'status' => $user->email_verified_at ? 'Active' : 'Pending'
        ]);
    }
}
