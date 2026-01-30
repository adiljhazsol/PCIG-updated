<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SurplusFund;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminSurplusFundController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $activeCases = SurplusFund::whereIn('status', ['identified', 'claim_filed', 'approved'])->count();
        $totalRecovered = SurplusFund::where('status', 'received')->sum('amount');
        $successRate = SurplusFund::where('status', 'received')->count() > 0
            ? (SurplusFund::where('status', 'received')->count() / SurplusFund::whereIn('status', ['received', 'denied'])->count()) * 100
            : 0;
        $pendingClaims = SurplusFund::where('status', 'claim_filed')->count();

        // Calculate trends (vs last month)
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $activeCasesLastMonth = SurplusFund::whereIn('status', ['identified', 'claim_filed', 'approved'])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $activeTrend = $activeCases - $activeCasesLastMonth;
        $activeTrendStr = ($activeTrend >= 0 ? '+' : '') . $activeTrend . ' vs last month';

        // Alert Banner - New funds this week
        $newFundsCount = SurplusFund::where('created_at', '>=', Carbon::now()->subWeek())->count();
        $alertBanner = $newFundsCount > 0 ? [
            'message' => "$newFundsCount new surplus funds identified this week.",
            'buttonLabel' => 'View List',
            'type' => 'info'
        ] : null;

        // Dynamic Filters
        $counties = Property::distinct('county')->pluck('county')->filter()->values()->toArray();

        // Table Rows
        $records = SurplusFund::with('property')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($fund) {
                $statusColor = $this->getStatusColor($fund->status);
                // Mock background color based on status color (lighter version)
                // In a real scenario, this mapping should be consistent or frontend should handle it.
                $bgColors = [
                    'blue' => '#DBEAFE', // blue-100
                    'orange' => '#FFEDD5', // orange-100
                    'green' => '#DCFCE7', // green-100
                    'purple' => '#F3E8FF', // purple-100
                    'red' => '#FEE2E2', // red-100
                    'gray' => '#F3F4F6', // gray-700
                ];
                $textColors = [
                    'blue' => '#1E40AF', // blue-800
                    'orange' => '#9A3412', // orange-800
                    'green' => '#166534', // green-800
                    'purple' => '#6B21A8', // purple-800
                    'red' => '#991B1B', // red-800
                    'gray' => '#374151', // gray-700
                ];

                $colorKey = $statusColor;
                $finalStatusColor = $textColors[$colorKey] ?? '#374151';
                $finalStatusBg = $bgColors[$colorKey] ?? '#F3F4F6';

                return [
                    'id' => $fund->id,
                    'caseNumber' => 'SF-' . $fund->id,
                    'fcsFile' => 'SF-' . $fund->id,
                    'pcigId' => $fund->property ? 'PROP-' . $fund->property->id : 'Unknown',
                    'county' => $fund->property ? $fund->property->county : 'Unknown',
                    'parcelId' => $fund->property ? $fund->property->parcel_id : 'Unknown',
                    'originalOwner' => 'Unknown', // No owner field in Property model
                    'amount' => (float)$fund->amount,
                    'collected' => '$' . number_format($fund->amount),
                    'surplusCollected' => '$' . number_format($fund->amount),
                    'paid' => '$0.00', // Need 'paid' field or relation if tracking payments
                    'unclaimed' => '$' . number_format($fund->amount),
                    'surplusUnclaimed' => '$' . number_format($fund->amount),
                    'unclaimedColor' => '#16A34A',
                    'saleDate' => $fund->created_at->format('M d, Y'),
                    'status' => ucfirst(str_replace('_', ' ', $fund->status)),
                    'statusColor' => $finalStatusColor,
                    'statusBg' => $finalStatusBg,
                    'recipientName' => 'Unknown', // No recipient info
                    'dateIdentified' => $fund->created_at->format('Y-m-d'),
                    'claimDeadline' => $fund->created_at->addYears(1)->format('Y-m-d'), // Assuming 1 year deadline
                    'documents' => ['message' => 'No documents uploaded.'],
                    'notes' => $fund->notes ?? '',
                    'contactHistory' => [], // Empty array instead of mock data
                    'outreach' => null, // No outreach tracking yet
                    'recipientInfo' => [
                        'name' => 'Unknown',
                        'address' => $fund->property ? $fund->property->address : '',
                        'city' => $fund->property ? $fund->property->city : '',
                        'state' => $fund->property ? $fund->property->state : '',
                        'phone' => ''
                    ]
                ];
            });

        return response()->json([
            'surplusFundsResearch' => [
                'header' => [
                    'title' => 'Surplus Funds Research',
                    'subtitle' => 'Identify, track, and recover surplus funds from tax sales.'
                ],
                'actionButtons' => [
                    'bulkImport' => ['label' => 'Bulk Import', 'icon' => 'Upload', 'action' => 'upload'],
                    'export' => ['label' => 'Export Report', 'icon' => 'Download', 'action' => 'export'],
                    'addRecord' => ['label' => 'New Research', 'icon' => 'Plus', 'action' => 'new']
                ],
                'alertBanner' => $alertBanner,
                'summaryCards' => [
                    ['label' => 'Active Cases', 'value' => $activeCases, 'subtext' => $activeTrendStr, 'trend' => $activeTrendStr, 'icon' => 'Search', 'color' => '#3B82F6'],
                    ['label' => 'Total Recovered', 'value' => '$' . number_format($totalRecovered), 'subtext' => 'YTD', 'trend' => 'YTD', 'icon' => 'Download', 'color' => '#10B981'],
                    ['label' => 'Success Rate', 'value' => round($successRate) . '%', 'subtext' => 'All time', 'trend' => 'All time', 'icon' => 'CheckCircle2', 'color' => '#F59E0B'],
                    ['label' => 'Pending Claims', 'value' => $pendingClaims, 'subtext' => 'Awaiting approval', 'trend' => 'Current', 'icon' => 'Clock', 'color' => '#6366F1']
                ],
                'searchPlaceholder' => 'Search by case #, county, owner, or parcel ID...',
                'filters' => [
                    ['label' => 'Status', 'selected' => 'All', 'options' => ['All', 'Identified', 'Claim Filed', 'Approved', 'Received']],
                    ['label' => 'County', 'selected' => 'All', 'options' => array_merge(['All'], $counties)],
                    ['label' => 'Amount', 'selected' => 'All', 'options' => ['All', '$0 - $5k', '$5k - $20k', '$20k+']]
                ],
                'generateLettersButton' => ['label' => 'Generate Claim Letters'],
                'tableHeaders' => ['Case #', 'County', 'Parcel ID', 'Original Owner', 'Amount', 'Status', 'Date Identified', 'Claim Deadline', 'Actions'],
                'records' => $records,
                'selectedRecord' => $records->first() ?? null
            ]
        ]);
    }

    private function getStatusColor($status)
    {
        $colors = [
            'identified' => 'blue',
            'claim_filed' => 'orange',
            'approved' => 'green',
            'received' => 'purple',
            'denied' => 'red',
            'new' => 'gray'
        ];
        return $colors[$status] ?? 'gray';
    }

    public function index(Request $request): JsonResponse
    {
        $query = SurplusFund::with('property');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $fund = SurplusFund::create([
            'property_id' => $request->property_id,
            'amount' => $request->amount,
            'status' => 'identified',
            'notes' => $request->notes,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Surplus fund identified successfully'
        ], 201);
    }

    public function claim(Request $request, $id): JsonResponse
    {
        $fund = SurplusFund::findOrFail($id);
        
        $request->validate([
            'claim_filed_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $fund->update([
            'status' => 'claim_filed',
            'claim_filed_date' => $request->claim_filed_date,
            'notes' => $request->notes ? $fund->notes . "\n" . $request->notes : $fund->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Claim filed successfully'
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $fund = SurplusFund::findOrFail($id);

        $request->validate([
            'status' => 'required|in:identified,claim_filed,approved,received,denied',
            'received_date' => 'required_if:status,received|date|nullable',
            'notes' => 'nullable|string',
        ]);

        $fund->update([
            'status' => $request->status,
            'received_date' => $request->received_date,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Surplus fund status updated'
        ]);
    }
}
