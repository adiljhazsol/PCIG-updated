<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoffRequest;
use App\Models\LawyerPayoffRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminPayoffController extends Controller
{
    /**
     * Get dashboard data for Payoff Requests
     */
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Stats
        $pendingRequests = PayoffRequest::where('status', 'pending')->count() + LawyerPayoffRequest::where('status', 'pending')->count();
        $processing = PayoffRequest::where('status', 'processing')->count();
        $completedToday = PayoffRequest::where('status', 'completed')->whereDate('updated_at', now())->count();
        
        $summaryCards = [
            ['label' => 'Pending Requests', 'value' => $pendingRequests, 'trend' => 'Requires Action', 'icon' => 'Clock', 'color' => '#F59E0B'],
            ['label' => 'Processing', 'value' => $processing, 'trend' => 'In Progress', 'icon' => 'RefreshCw', 'color' => '#3B82F6'],
            ['label' => 'Completed Today', 'value' => $completedToday, 'trend' => 'Daily Volume', 'icon' => 'CheckCircle2', 'color' => '#10B981'],
            ['label' => 'Avg Response Time', 'value' => '4.2 hrs', 'trend' => '-15% vs last wk', 'icon' => 'Zap', 'color' => '#6366F1']
        ];

        // 2. Requests List
        // Merge Owner and Lawyer requests
        $ownerRequests = PayoffRequest::with('property')->get()->map(function($r) {
            $r->type = 'Owner Request';
            $r->source = 'Owner Portal';
            return $r;
        });
        
        $lawyerRequests = LawyerPayoffRequest::with('property')->get()->map(function($r) {
            $r->type = 'Lawyer Request';
            $r->source = 'Lawyer Portal';
            return $r;
        });

        $merged = $ownerRequests->concat($lawyerRequests)->sortByDesc('created_at')->values();

        $requests = $merged->map(function ($req) {
            $statusLabel = ucfirst($req->status);
            
            // Map status to colors
            $statusColor = match($req->status) {
                'pending' => '#B45309', // amber-700
                'processing' => '#1D4ED8', // blue-700
                'approved', 'completed', 'quote_generated' => '#047857', // emerald-700
                'rejected' => '#B91C1C', // red-700
                default => '#374151' // gray-700
            };
            
            $statusBg = match($req->status) {
                'pending' => '#FEF3C7', // amber-100
                'processing' => '#DBEAFE', // blue-100
                'approved', 'completed', 'quote_generated' => '#D1FAE5', // emerald-100
                'rejected' => '#FEE2E2', // red-100
                default => '#F3F4F6' // gray-100
            };

            // Map source/type to colors
            $isLawyer = str_contains($req->type, 'Lawyer');
            $sourceColor = $isLawyer ? '#4338CA' : '#A21CAF'; // indigo-700 : fuchsia-700
            $sourceBg = $isLawyer ? '#E0E7FF' : '#FAE8FF'; // indigo-100 : fuchsia-100

            // Unique ID generation based on type to avoid React duplicate key errors
            $prefix = $isLawyer ? 'LPR-' : 'PR-';
            $displayId = $prefix . str_pad($req->id, 4, '0', STR_PAD_LEFT);

            return [
                'id' => $displayId,
                'property' => $req->property ? $req->property->address : 'Unknown Property',
                'parcelId' => $req->property ? $req->property->parcel_id : '-',
                'requester' => $req->requester_name ?? $req->lawyer_name ?? 'Unknown',
                'requesterFirm' => $req->lawyer_firm_name ?? null,
                'source' => $req->type,
                'sourceColor' => $sourceColor,
                'sourceBg' => $sourceBg,
                'date' => $req->created_at->format('M d, Y'),
                'statuses' => [
                    [
                        'label' => $statusLabel,
                        'color' => $statusColor,
                        'bg' => $statusBg
                    ]
                ]
            ];
        });

        // 3. Prepare Selected Request (Detailed View for the first item)
        $firstReq = $merged->first();
        $selectedRequest = null;

        if ($firstReq) {
            $isLawyer = str_contains($firstReq->type, 'Lawyer');
            $prefix = $isLawyer ? 'LPR-' : 'PR-';
            $selectedRequest = [
                'id' => $prefix . str_pad($firstReq->id, 4, '0', STR_PAD_LEFT),
                'date' => $firstReq->created_at->format('M d, Y'),
                'alert' => [
                    'bg' => '#EFF6FF', // blue-50
                    'borderColor' => '#BFDBFE', // blue-200
                    'textColor' => '#1E40AF', // blue-800
                    'message' => 'This request requires immediate attention. Please review the payoff details and supporting documents.'
                ],
                'propertyDetails' => [
                    'address' => $firstReq->property ? $firstReq->property->address : 'Unknown Address',
                    'parcelId' => $firstReq->property ? $firstReq->property->parcel_id : '-',
                    'county' => $firstReq->property ? $firstReq->property->county : 'Unknown County',
                    'taxYear' => '2024'
                ],
                'requesterInfo' => [
                    'name' => $firstReq->requester_name ?? $firstReq->lawyer_name ?? 'Unknown',
                    'firm' => $firstReq->lawyer_firm_name ?? '-',
                    'role' => $isLawyer ? 'Lawyer' : 'Property Owner',
                    'client' => 'Client Name', // Mock
                    'email' => 'requester@example.com' // Mock
                ],
                'supportingDocuments' => [
                    ['name' => 'Payoff_Request_Form.pdf', 'date' => $firstReq->created_at->format('M d, Y'), 'size' => '2.4 MB'],
                    ['name' => 'Property_Deed.pdf', 'date' => $firstReq->created_at->format('M d, Y'), 'size' => '1.8 MB']
                ],
                'payoffEstimation' => [
                    'principal' => '$' . number_format($firstReq->amount ?? 0, 2),
                    'interest' => '$0.00',
                    'fees' => '$50.00',
                    'total' => '$' . number_format(($firstReq->amount ?? 0) + 50, 2)
                ],
                'actionButtons' => [
                    'approve' => ['label' => 'Approve Request', 'color' => '#10B981'],
                    'reject' => ['label' => 'Reject Request', 'color' => '#EF4444']
                ]
            ];
        }

        return response()->json([
            'payoffRequestQueue' => [
                'header' => [
                    'title' => 'Payoff Request Queue',
                    'subtitle' => 'Manage and process payoff requests from property owners and lawyers.'
                ],
                'actionButtons' => [
                    'exportCSV' => ['label' => 'Export CSV', 'icon' => 'Download'],
                    'manualRequest' => ['label' => 'Manual Request', 'icon' => 'Plus']
                ],
                'summaryCards' => $summaryCards,
                'searchPlaceholder' => 'Search by property, requester, or ID...',
                'filters' => [
                    ['label' => 'Status', 'options' => ['All', 'Pending', 'Processing', 'Approved', 'Completed']],
                    ['label' => 'Type', 'options' => ['All', 'Owner Request', 'Lawyer Request']],
                    ['label' => 'Priority', 'options' => ['All', 'High', 'Medium', 'Low']]
                ],
                'tableHeaders' => ['Request ID', 'Property', 'Requester', 'Type', 'Date', 'Amount', 'Status', 'Priority', 'Actions'],
                'requests' => $requests,
                'selectedRequest' => $selectedRequest
            ]
        ]);
    }

    /**
     * Get data for the payoff portals (Request & Lawyer)
     */
    public function portalData(Request $request): JsonResponse
    {
        // Mock data for the portals
        return response()->json([
            'lawyerPayoffPortal' => [
                'header' => [
                    'title' => 'New Payoff Request',
                    'subtitle' => 'Complete the payment below to process your payoff request.'
                ],
                'property' => [
                    'identified' => true,
                    'address' => '1240 Oak Street, Miami, FL 33133',
                    'parcelId' => '01-4138-005-1230'
                ],
                'client' => [
                    'name' => 'John Doe (Owner)',
                    'representedBy' => 'James Smith, Esq.'
                ],
                'fees' => [
                    'processing' => 50.00
                ]
            ],
            'requestPropertyPayoff' => [
                'header' => [
                    'title' => 'Request Property Payoff',
                    'subtitle' => 'Submit your information to receive an official payoff quote and payment instructions.'
                ],
                'relationshipOptions' => [
                    'I am the Property Owner',
                    'Authorized Representative',
                    'Lawyer',
                    'Other'
                ],
                'selectedProperty' => [
                    'address' => '1240 Oak Street, Miami, FL 33133',
                    'parcelId' => '01-4138-005-1230',
                    'county' => 'Miami-Dade'
                ]
            ]
        ]);
    }

    /**
     * Get all payoff requests (Owner & Lawyer)
     */
    public function index(Request $request): JsonResponse
    {
        $ownerRequests = PayoffRequest::with('property')
            ->when($request->status, function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->latest()
            ->get();

        $lawyerRequests = LawyerPayoffRequest::with('property')
            ->when($request->status, function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'owner_requests' => $ownerRequests,
                'lawyer_requests' => $lawyerRequests,
            ]
        ]);
    }

    /**
     * Update Payoff Request Status (Owner)
     */
    public function updateOwnerRequest(Request $request, $id): JsonResponse
    {
        $payoff = PayoffRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,processing,approved,rejected,completed',
            'amount' => 'nullable|numeric',
        ]);

        $payoff->update([
            'status' => $request->status,
            'amount' => $request->amount ?? $payoff->amount,
            'processed_at' => $request->status === 'completed' ? now() : $payoff->processed_at,
        ]);

        return response()->json(['success' => true, 'data' => $payoff]);
    }

    /**
     * Update Lawyer Payoff Request Status
     */
    public function updateLawyerRequest(Request $request, $id): JsonResponse
    {
        $payoff = LawyerPayoffRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,quote_generated,approved,rejected',
            'amount' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $payoff->update($request->only(['status', 'amount', 'notes']));

        return response()->json(['success' => true, 'data' => $payoff]);
    }

    /**
     * Submit Payoff Request (Public/User facing, but placed here for simplicity or routed via Public controller)
     * For Admin usage, we might want to create on behalf of someone.
     */
    public function storeOwnerRequest(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'requester_name' => 'required|string',
            'requester_email' => 'required|email',
        ]);

        $payoff = PayoffRequest::create($request->all());

        return response()->json(['success' => true, 'data' => $payoff], 201);
    }
}
