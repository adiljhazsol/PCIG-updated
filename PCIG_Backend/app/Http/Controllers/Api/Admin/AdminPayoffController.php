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
        
        // Calculate Avg Response Time
        $completedReqs = PayoffRequest::where('status', 'completed')->get();
        $completedLawyerReqs = LawyerPayoffRequest::where('status', 'completed')->get();
        $allCompleted = $completedReqs->concat($completedLawyerReqs);
        
        $avgHours = 0;
        if ($allCompleted->count() > 0) {
            $totalHours = $allCompleted->sum(function($req) {
                return $req->updated_at->diffInHours($req->created_at);
            });
            $avgHours = round($totalHours / $allCompleted->count(), 1);
        }

        $summaryCards = [
            ['label' => 'Pending Requests', 'value' => $pendingRequests, 'trend' => 'Requires Action', 'icon' => 'Clock', 'color' => '#F59E0B'],
            ['label' => 'Processing', 'value' => $processing, 'trend' => 'In Progress', 'icon' => 'RefreshCw', 'color' => '#3B82F6'],
            ['label' => 'Completed Today', 'value' => $completedToday, 'trend' => 'Daily Volume', 'icon' => 'CheckCircle2', 'color' => '#10B981'],
            ['label' => 'Avg Response Time', 'value' => $avgHours . ' hrs', 'trend' => 'Based on completed', 'icon' => 'Zap', 'color' => '#6366F1']
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
                'raw_id' => $req->id,
                'type_slug' => $isLawyer ? 'lawyer' : 'owner',
                'property' => $req->property ? $req->property->address : 'Unknown Property',
                'parcelId' => $req->property ? $req->property->parcel_id : '-',
                'requester' => $req->requester_name ?? $req->lawyer_name ?? 'Unknown',
                'requesterFirm' => $req->lawyer_firm_name ?? null,
                'source' => $req->type,
                'sourceColor' => $sourceColor,
                'sourceBg' => $sourceBg,
                'date' => $req->created_at->format('M d, Y'),
                'amount' => '$' . number_format($req->amount ?? 0, 2),
                'priority' => 'Medium', // Default for now
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
                'raw_id' => $firstReq->id,
                'type_slug' => $isLawyer ? 'lawyer' : 'owner',
                'date' => $firstReq->created_at->format('M d, Y'),
                'alert' => [
                    'bg' => '#EFF6FF', // blue-50
                    'borderColor' => '#BFDBFE', // blue-200
                    'textColor' => '#1E40AF', // blue-800
                    'message' => 'This request requires immediate attention. Please review the payoff details and supporting documents.'
                ],
                'propertyDetails' => [
                    'id' => $firstReq->property_id,
                    'address' => $firstReq->property ? $firstReq->property->address : 'Unknown Address',
                    'parcelId' => $firstReq->property ? $firstReq->property->parcel_id : '-',
                    'county' => $firstReq->property ? $firstReq->property->county : 'Unknown County',
                    'taxYear' => '2024'
                ],
                'requesterInfo' => [
                    'name' => $firstReq->requester_name ?? $firstReq->lawyer_name ?? 'Unknown',
                    'firm' => $firstReq->lawyer_firm_name ?? '-',
                    'role' => $isLawyer ? 'Lawyer' : 'Property Owner',
                    'client' => $firstReq->requester_name ?? 'Unknown',
                    'email' => $firstReq->requester_email ?? $firstReq->lawyer_email ?? 'unknown@example.com'
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
                    'id' => 1,
                    'identified' => true,
                    'address' => '1240 Oak Street, Miami, FL 33133',
                    'parcelId' => '01-4138-005-1230'
                ],
                'client' => [
                    'name' => 'John Doe (Owner)',
                    'representedBy' => 'James Smith, Esq.',
                    'email' => 'james.smith@lawfirm.com'
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
                    'id' => 1,
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
     * Get specific payoff request details
     */
    public function show(Request $request, $id): JsonResponse
    {
        $type = $request->query('type', 'owner'); // Default to owner
        
        if ($type === 'lawyer') {
            $req = LawyerPayoffRequest::with('property')->findOrFail($id);
            $req->type = 'Lawyer Request';
        } else {
            $req = PayoffRequest::with('property')->findOrFail($id);
            $req->type = 'Owner Request';
        }

        $isLawyer = $type === 'lawyer';
        $prefix = $isLawyer ? 'LPR-' : 'PR-';
        
        $selectedRequest = [
            'id' => $prefix . str_pad($req->id, 4, '0', STR_PAD_LEFT),
            'raw_id' => $req->id,
            'type_slug' => $type,
            'date' => $req->created_at->format('M d, Y'),
            'alert' => [
                'bg' => '#EFF6FF',
                'borderColor' => '#BFDBFE',
                'textColor' => '#1E40AF',
                'message' => 'This request requires immediate attention. Please review the payoff details and supporting documents.'
            ],
            'propertyDetails' => [
                'id' => $req->property_id,
                'address' => $req->property ? $req->property->address : 'Unknown Address',
                'parcelId' => $req->property ? $req->property->parcel_id : '-',
                'county' => $req->property ? $req->property->county : 'Unknown County',
                'taxYear' => '2024'
            ],
            'requesterInfo' => [
                'name' => $req->requester_name ?? $req->lawyer_name ?? 'Unknown',
                'firm' => $req->lawyer_firm_name ?? '-',
                'role' => $isLawyer ? 'Lawyer' : 'Property Owner',
                'client' => $req->requester_name ?? 'Unknown',
                'email' => $req->requester_email ?? $req->lawyer_email ?? 'unknown@example.com'
            ],
            'supportingDocuments' => [
                ['name' => 'Payoff_Request_Form.pdf', 'date' => $req->created_at->format('M d, Y'), 'size' => '2.4 MB'],
                ['name' => 'Property_Deed.pdf', 'date' => $req->created_at->format('M d, Y'), 'size' => '1.8 MB']
            ],
            'payoffEstimation' => [
                'principal' => '$' . number_format($req->amount ?? 0, 2),
                'interest' => '$0.00',
                'fees' => '$50.00',
                'total' => '$' . number_format(($req->amount ?? 0) + 50, 2)
            ],
            'actionButtons' => [
                'approve' => ['label' => 'Approve Request', 'color' => '#10B981'],
                'reject' => ['label' => 'Reject Request', 'color' => '#EF4444']
            ]
        ];

        return response()->json(['success' => true, 'data' => $selectedRequest]);
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
     * Delete Payoff Request
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $type = $request->query('type', 'owner');
        
        if ($type === 'lawyer') {
            $payoff = LawyerPayoffRequest::findOrFail($id);
            $payoff->delete();
        } else {
            $payoff = PayoffRequest::findOrFail($id);
            $payoff->delete();
        }

        return response()->json(['success' => true, 'message' => 'Request deleted successfully']);
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
            'amount' => 'nullable|numeric',
            'relationship' => 'nullable|string',
            'mailing_address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'zip' => 'nullable|string',
            'additional_notes' => 'nullable|string',
            'id_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB
        ]);

        $filePath = null;
        if ($request->hasFile('id_file')) {
            $filePath = $request->file('id_file')->store('payoff_ids', 'public');
        }

        $payoff = PayoffRequest::create([
            'property_id' => $request->property_id,
            'requester_name' => $request->requester_name,
            'requester_email' => $request->requester_email,
            'requester_phone' => $request->requester_phone ?? null,
            'relationship' => $request->relationship,
            'mailing_address' => $request->mailing_address,
            'city' => $request->city,
            'state' => $request->state,
            'zip' => $request->zip,
            'additional_notes' => $request->additional_notes,
            'id_file_path' => $filePath,
            'amount' => $request->amount,
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'data' => $payoff], 201);
    }

    /**
     * Submit Lawyer Payoff Request
     */
    public function storeLawyerRequest(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'lawyer_name' => 'required|string',
            'lawyer_email' => 'required|email',
            'firm_name' => 'nullable|string',
            'client_name' => 'required|string',
            'billing_address' => 'required|string',
            'billing_city' => 'required|string',
            'billing_state' => 'required|string',
            'billing_zip' => 'required|string',
            'card_number' => 'required|string', // In real app, this should be tokenized
            'amount' => 'required|numeric',
        ]);

        // Simulate Payment Processing
        // In a real application, you would interact with Stripe/PayPal here
        $paymentStatus = 'paid';
        $transactionId = 'txn_' . uniqid();

        $payoff = LawyerPayoffRequest::create([
            'property_id' => $request->property_id,
            'lawyer_name' => $request->lawyer_name,
            'lawyer_email' => $request->lawyer_email,
            'firm_name' => $request->firm_name,
            'client_name' => $request->client_name,
            'amount' => $request->amount,
            'status' => 'pending', // Request is pending admin review, but payment is done
            'billing_address' => $request->billing_address,
            'billing_city' => $request->billing_city,
            'billing_state' => $request->billing_state,
            'billing_zip' => $request->billing_zip,
            'payment_method' => 'stripe',
            'payment_status' => $paymentStatus,
            'transaction_id' => $transactionId,
        ]);

        return response()->json(['success' => true, 'data' => $payoff, 'message' => 'Payment successful and request submitted.'], 201);
    }

    /**
     * Export Payoff Requests to CSV
     */
    public function exportCsv(Request $request)
    {
        $fileName = 'payoff_requests_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Type', 'Property Address', 'Parcel ID', 'Requester Name', 'Requester Email', 'Status', 'Amount', 'Date Created'];

        $callback = function() {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Type', 'Property Address', 'Parcel ID', 'Requester Name', 'Requester Email', 'Status', 'Amount', 'Date Created']);

            // Fetch Owner Requests
            PayoffRequest::with('property')->chunk(100, function($requests) use ($file) {
                foreach ($requests as $req) {
                    fputcsv($file, [
                        'PR-' . str_pad($req->id, 4, '0', STR_PAD_LEFT),
                        'Owner Request',
                        $req->property ? $req->property->address : 'N/A',
                        $req->property ? $req->property->parcel_id : 'N/A',
                        $req->requester_name,
                        $req->requester_email,
                        ucfirst($req->status),
                        $req->amount,
                        $req->created_at->format('Y-m-d H:i:s')
                    ]);
                }
            });

            // Fetch Lawyer Requests
            LawyerPayoffRequest::with('property')->chunk(100, function($requests) use ($file) {
                foreach ($requests as $req) {
                    fputcsv($file, [
                        'LPR-' . str_pad($req->id, 4, '0', STR_PAD_LEFT),
                        'Lawyer Request',
                        $req->property ? $req->property->address : 'N/A',
                        $req->property ? $req->property->parcel_id : 'N/A',
                        $req->lawyer_name . ' (' . $req->lawyer_firm_name . ')',
                        $req->lawyer_email,
                        ucfirst($req->status),
                        $req->amount,
                        $req->created_at->format('Y-m-d H:i:s')
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate Payoff Letters (PDF)
     */
    public function generateLetters(Request $request)
    {
        set_time_limit(300); // Increase timeout to 5 minutes

        $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'string' // Format: PR-0001 or LPR-0001
        ]);

        $ids = $request->request_ids;
        $payoffRequests = [];

        foreach ($ids as $idStr) {
            if (str_starts_with($idStr, 'LPR-')) {
                $id = (int) substr($idStr, 4);
                $req = LawyerPayoffRequest::with('property')->find($id);
                if ($req) {
                    $req->display_id = $idStr;
                    $req->type_label = 'Lawyer Request';
                    $payoffRequests[] = $req;
                }
            } else {
                // Assume PR- or just ID
                $id = (int) (str_starts_with($idStr, 'PR-') ? substr($idStr, 3) : $idStr);
                $req = PayoffRequest::with('property')->find($id);
                if ($req) {
                    $req->display_id = str_starts_with($idStr, 'PR-') ? $idStr : 'PR-' . str_pad($id, 4, '0', STR_PAD_LEFT);
                    $req->type_label = 'Owner Request';
                    $payoffRequests[] = $req;
                }
            }
        }

        if (empty($payoffRequests)) {
            return response()->json(['error' => 'No valid requests found'], 404);
        }

        try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('admin.payoff.letters', ['requests' => $payoffRequests]);
                return $pdf->download('payoff_letters_' . date('Y-m-d') . '.pdf');
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('PDF Generation Error: ' . $e->getMessage());
                return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
            }
    }
}
