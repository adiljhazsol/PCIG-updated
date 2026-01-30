<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\RedemptionTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRedemptionController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $activeRedemptions = Property::where('workflow_stage', 'redemption')->count();
        $totalRedeemedAmount = RedemptionTracking::where('status', 'redeemed')->sum('redemption_amount');
        $approachingDeadline = RedemptionTracking::where('status', 'pending')
            ->where('redemption_deadline', '<=', now()->addDays(30))
            ->where('redemption_deadline', '>=', now())
            ->count();
        $avgTurnaround = 45; // Mock

        // Queue / List
        $queueRows = Property::where('workflow_stage', 'redemption')
            ->with(['redemptionTracking'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($prop) {
                $tracking = $prop->redemptionTracking;
                $deadline = $tracking ? ($tracking->redemption_deadline ? \Carbon\Carbon::parse($tracking->redemption_deadline) : null) : null;
                $daysRemaining = $deadline ? now()->diffInDays($deadline, false) : 0;
                
                $statusColor = 'active';
                $statusLabel = 'Active';

                if ($tracking) {
                    if ($tracking->status == 'redeemed') {
                        $statusColor = 'success';
                        $statusLabel = 'Redeemed';
                    } elseif ($daysRemaining < 0) {
                        $statusColor = 'critical';
                        $statusLabel = 'Expired';
                    } elseif ($daysRemaining <= 30) {
                        $statusColor = 'critical';
                        $statusLabel = 'Deadline Near';
                    }
                }

                // Calculate estimated payoff (mock logic + DB)
                $amount = $tracking ? $tracking->redemption_amount : 0;
                if ($amount == 0) {
                     $amount = $prop->purchase_price ? ($prop->purchase_price * 1.2) : 0;
                }

                return [
                    'id' => $prop->id,
                    'pcigId' => 'PROP-' . $prop->id,
                    'parcelId' => $prop->parcel_id ?? 'Unknown',
                    'address' => $prop->address,
                    'county' => $prop->county,
                    'owner' => 'PCIG', // Mock
                    'deadline' => $deadline ? $deadline->format('M d, Y') : 'N/A',
                    'daysRemaining' => $deadline ? $deadline->diffForHumans() : 'N/A',
                    'status' => [
                        'label' => $statusLabel,
                        'color' => $statusColor
                    ],
                    'estimatedPayoff' => '$' . number_format($amount, 2),
                    'payoffDateVal' => 'Valid until ' . now()->endOfMonth()->format('M d'),
                    'payoffStatus' => [
                        'label' => 'Pending', // Mock
                        'color' => 'warning'
                    ],
                    'actions' => [
                        ['label' => 'Process Payoff', 'primary' => true],
                        ['label' => 'View Property', 'primary' => false]
                    ]
                ];
            });

        // History - Real Data
        $historyRows = RedemptionTracking::where('status', 'redeemed')
            ->with('property')
            ->latest('redeemed_at')
            ->limit(10)
            ->get()
            ->map(function ($tracking) {
                return [
                    'id' => $tracking->id,
                    'property' => [
                        'parcelId' => $tracking->property->parcel_id ?? 'Unknown',
                        'address' => $tracking->property->address ?? 'Unknown'
                    ],
                    'owner' => 'Unknown',
                    'redemptionDate' => $tracking->redeemed_at ? $tracking->redeemed_at->format('M d, Y') : 'N/A',
                    'amount' => '$' . number_format($tracking->redemption_amount, 2),
                    'method' => 'Wire', // Mock
                    'status' => 'Completed',
                    'processedBy' => 'System',
                    'action' => 'View'
                ];
            });

        return response()->json([
            'header' => [
                'title' => 'Redemption Tracking',
                'subtitle' => 'Monitor redemption periods, deadlines, and payoff requests.',
                'actionButtons' => [
                    ['label' => 'Process Payoff', 'icon' => 'DollarSign', 'primary' => true],
                    ['label' => 'View History', 'icon' => 'History', 'primary' => false]
                ]
            ],
            'filters' => [
                'searchPlaceholder' => 'Search by address, parcel ID...',
                'dropdowns' => [
                    'All Status',
                    'All Counties',
                    'Any Time'
                ],
                'clearButton' => 'Clear Filters'
            ],
            'summaryCards' => [
                [
                    'label' => 'Active Redemptions',
                    'value' => (string)$activeRedemptions,
                    'subtitle' => 'Total active',
                    'icon' => 'Activity',
                    'color' => '#3B82F6',
                    'bg' => '#EFF6FF'
                ],
                [
                    'label' => 'Approaching Deadline',
                    'value' => (string)$approachingDeadline,
                    'subtitle' => 'Next 30 days',
                    'icon' => 'AlertTriangle',
                    'color' => '#F59E0B',
                    'bg' => '#FFFBEB'
                ],
                [
                    'label' => 'Avg Turnaround',
                    'value' => $avgTurnaround . ' Days',
                    'subtitle' => 'Historical avg',
                    'icon' => 'Clock',
                    'color' => '#10B981',
                    'bg' => '#ECFDF5'
                ],
                [
                    'label' => 'Total Redeemed',
                    'value' => '$' . number_format($totalRedeemedAmount, 0),
                    'subtitle' => 'All time',
                    'icon' => 'CheckCircle2',
                    'color' => '#6366F1',
                    'bg' => '#EEF2FF'
                ]
            ],
            'queue' => [
                'title' => 'Redemption Queue',
                'count' => $activeRedemptions,
                'tableHeaders' => ['Parcel ID', 'Address', 'Owner', 'Deadline', 'Status', 'Est. Payoff', 'Payoff Status', 'Actions'],
                'rows' => $queueRows
            ],
            'history' => [
                'title' => 'Recent Activity',
                'subtitle' => 'Latest redemption actions and updates',
                'tableHeaders' => ['Property', 'Owner', 'Redemption Date', 'Amount', 'Method', 'Status', 'Processed By', 'Action'],
                'rows' => $historyRows
            ]
        ]);
    }

    private function getAlertBanner()
    {
        $expiringCount = RedemptionTracking::where('status', 'pending')
            ->where('redemption_deadline', '<=', now()->addDays(7))
            ->count();

        if ($expiringCount > 0) {
            return [
                'type' => 'warning',
                'title' => 'Urgent Deadlines',
                'message' => "$expiringCount redemptions expiring in the next 7 days.",
                'action' => 'View Properties'
            ];
        }

        return null;
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'redemption')
            ->with(['primaryImage', 'redemptionTracking']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('parcel_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'All Status' && $request->status !== 'All') {
            $status = $request->status;
            if ($status === 'Active') {
                $query->whereHas('redemptionTracking', function($q) {
                    $q->where('status', 'pending');
                });
            } elseif ($status === 'Redeemed' || $status === 'Completed') {
                $query->whereHas('redemptionTracking', function($q) {
                    $q->where('status', 'redeemed');
                });
            } elseif ($status === 'Expired') {
                 $query->whereHas('redemptionTracking', function($q) {
                    $q->where('status', 'pending')
                      ->where('redemption_deadline', '<', now());
                });
            } elseif ($status === 'Deadline Near') {
                 $query->whereHas('redemptionTracking', function($q) {
                    $q->where('status', 'pending')
                      ->where('redemption_deadline', '<=', now()->addDays(30))
                      ->where('redemption_deadline', '>=', now());
                });
            }
        }

        // Filter by deadline approaching (specific param)
        if ($request->has('upcoming')) {
            $days = $request->get('upcoming', 30);
            $query->whereHas('redemptionTracking', function($q) use ($days) {
                $q->where('redemption_deadline', '<=', now()->addDays($days))
                  ->where('status', 'pending');
            });
        }

        $perPage = $request->get('per_page', 20);
        $properties = $query->latest()->paginate($perPage);

        $data = $properties->getCollection()->map(function ($prop) {
            $tracking = $prop->redemptionTracking;
            $deadline = $tracking ? ($tracking->redemption_deadline ? \Carbon\Carbon::parse($tracking->redemption_deadline) : null) : null;
            $daysRemaining = $deadline ? now()->diffInDays($deadline, false) : 0;
            
            $statusColor = 'active';
            $statusLabel = 'Active';

            if ($tracking) {
                if ($tracking->status == 'redeemed') {
                    $statusColor = 'success';
                    $statusLabel = 'Redeemed';
                } elseif ($daysRemaining < 0) {
                    $statusColor = 'critical';
                    $statusLabel = 'Expired';
                } elseif ($daysRemaining <= 30) {
                    $statusColor = 'warning';
                    $statusLabel = 'Deadline Near';
                }
            }

            // Calculate estimated payoff (mock logic + DB)
            $amount = $tracking ? $tracking->redemption_amount : 0;
            if ($amount == 0) {
                 $amount = $prop->purchase_price ? ($prop->purchase_price * 1.2) : 0;
            }

            return [
                'id' => $prop->id,
                'pcigId' => 'PROP-' . $prop->id,
                'parcelId' => $prop->parcel_id ?? 'Unknown',
                'address' => $prop->address,
                'county' => $prop->county,
                'owner' => 'Unknown',
                'deadline' => $deadline ? $deadline->format('M d, Y') : 'N/A',
                'daysRemaining' => $deadline ? (int)$daysRemaining . ' Days' : 'N/A',
                'estimatedPayoff' => '$' . number_format($amount, 2),
                'payoffDateVal' => 'N/A', 
                'status' => [
                    'label' => $statusLabel,
                    'color' => $statusColor
                ],
                'payoffStatus' => [
                    'label' => 'Pending',
                    'color' => 'neutral'
                ],
                'actions' => [
                    ['label' => 'View Property', 'primary' => false],
                    ['label' => 'Process', 'primary' => true]
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'redemption_deadline' => 'nullable|date',
            'status' => 'nullable|in:pending,redeemed,expired',
            'redemption_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::where('workflow_stage', 'redemption')
            ->findOrFail($id);

        $redemption = RedemptionTracking::firstOrCreate(
            ['property_id' => $property->id],
            ['redemption_deadline' => $property->redemption_deadline ?? now()->addDays(30)]
        );

        $redemption->update($request->only([
            'redemption_deadline',
            'status',
            'redemption_amount',
            'notes',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Redemption tracking updated successfully',
            'data' => $redemption->load('property'),
        ]);
    }

    public function redeem(Request $request, $id): JsonResponse
    {
        $request->validate([
            'redemption_amount' => 'required|numeric|min:0.01',
            'redeemed_at' => 'nullable|date',
        ]);

        $property = Property::where('workflow_stage', 'redemption')
            ->findOrFail($id);

        $redemption = RedemptionTracking::where('property_id', $property->id)->firstOrFail();

        $redemption->update([
            'status' => 'redeemed',
            'redemption_amount' => $request->redemption_amount,
            'redeemed_at' => $request->redeemed_at ?? now(),
        ]);

        // Update property status
        $property->update([
            'workflow_stage' => 'completed',
            'status' => 'redeemed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Redemption processed successfully',
            'data' => $redemption->load('property'),
        ]);
    }
}
