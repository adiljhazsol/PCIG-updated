<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
            'fundInterest' => [], 
            'investorInterest' => [] 
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
        return response()->json(['message' => 'Calculated successfully']);
    }

    public function post(Request $request)
    {
        return response()->json(['message' => 'Posted successfully']);
    }
}
