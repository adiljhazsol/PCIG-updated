<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EfileCancellation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminEfileCancellationController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        $query = EfileCancellation::with(['property', 'requestor']);

        // Apply filters
        if ($request->has('status') && $request->status !== 'All Statuses') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('property', function ($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('parcel_number', 'like', "%{$search}%");
            });
        }

        $cancellations = $query->latest()->get();

        // Calculate summary stats
        $totalRequests = EfileCancellation::count();
        $pendingApproval = EfileCancellation::where('status', 'pending')->count();
        $processed = EfileCancellation::where('status', 'cancelled')->count();
        $failed = EfileCancellation::where('status', 'failed')->count();

        // Map rows
        $rows = $cancellations->map(function ($cancellation) {
            $statusColor = match($cancellation->status) {
                'pending' => '#D97706',
                'processing' => '#2563EB',
                'cancelled' => '#16A34A',
                'failed' => '#DC2626',
                default => '#64748B'
            };
            
            $statusBg = match($cancellation->status) {
                'pending' => '#FEF3C7',
                'processing' => '#EFF6FF',
                'cancelled' => '#DCFCE7',
                'failed' => '#FEE2E2',
                default => '#F1F5F9'
            };

            return [
                'id' => (string) $cancellation->id,
                'selected' => false,
                'property' => [
                    'address' => $cancellation->property->address ?? 'N/A',
                    'parcel' => $cancellation->property->parcel_number ?? 'N/A',
                ],
                'lienInfo' => [
                    'fileNumber' => $cancellation->filing_id ?? '-',
                    'taxYear' => '-', // Placeholder as we might not have tax year in this table
                ],
                'payoffDate' => $cancellation->requested_at ? $cancellation->requested_at->format('M d, Y') : '-',
                'status' => ucfirst($cancellation->status),
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'fileDate' => $cancellation->created_at->format('M d, Y'),
                'confirmation' => $cancellation->status === 'cancelled' ? 'CNF-' . str_pad($cancellation->id, 6, '0', STR_PAD_LEFT) : '-',
                'issues' => $cancellation->status === 'failed' ? 'Error processing' : '-',
                // Extra fields for detail panel
                'detail_reason' => $cancellation->reason,
                'detail_requested_by' => $cancellation->requestor->name ?? 'Unknown',
                'detail_requested_at' => $cancellation->requested_at ? $cancellation->requested_at->format('M d, Y') : '-',
                'detail_id' => 'REQ-' . $cancellation->created_at->format('Y') . '-' . str_pad($cancellation->id, 3, '0', STR_PAD_LEFT),
            ];
        });

        return response()->json([
            'header' => [
                'title' => 'E-File & Cancellations',
                'subtitle' => 'Manage electronic filings and cancellation requests',
                'actionButtons' => [
                    ['label' => 'Settings', 'icon' => 'Settings', 'variant' => 'outline'],
                    ['label' => 'Batch E-File', 'icon' => 'Upload', 'variant' => 'primary']
                ]
            ],
            'summaryCards' => [
                [
                    'id' => 'total-requests',
                    'title' => 'Total Requests',
                    'value' => (string)$totalRequests,
                    'change' => '+12%',
                    'trend' => 'up',
                    'icon' => 'FileText',
                    'color' => '#3B82F6'
                ],
                [
                    'id' => 'pending-approval',
                    'title' => 'Pending Approval',
                    'value' => (string)$pendingApproval,
                    'change' => '-5%',
                    'trend' => 'down',
                    'icon' => 'Clock',
                    'color' => '#F59E0B'
                ],
                [
                    'id' => 'processed',
                    'title' => 'Processed',
                    'value' => (string)$processed,
                    'change' => '+8%',
                    'trend' => 'up',
                    'icon' => 'CheckCircle2',
                    'color' => '#10B981'
                ],
                [
                    'id' => 'failed',
                    'title' => 'Failed / Action Needed',
                    'value' => (string)$failed,
                    'change' => '+2%',
                    'trend' => 'up',
                    'icon' => 'AlertCircle',
                    'color' => '#EF4444'
                ]
            ],
            'alertBanners' => [
                [
                    'id' => 'system-maintenance',
                    'type' => 'info',
                    'message' => 'Scheduled maintenance on the e-filing portal this Saturday from 2 AM to 4 AM EST.',
                    'action' => 'View Details'
                ]
            ],
            'searchAndFilters' => [
                'searchPlaceholder' => 'Search by property, file number...',
                'filters' => [
                    [
                        'label' => 'Status',
                        'value' => $request->status ?? 'All Statuses',
                        'options' => ['All Statuses', 'Pending', 'Processing', 'Cancelled', 'Failed']
                    ],
                    [
                        'label' => 'Date Range',
                        'value' => 'Last 30 Days',
                        'options' => ['Last 7 Days', 'Last 30 Days', 'This Quarter', 'Year to Date']
                    ]
                ]
            ],
            'cancellationsTable' => [
                'headers' => ['Select', 'Property', 'Lien Info', 'Payoff Date', 'Status', 'File Date', 'Confirmation #', 'Issues'],
                'rows' => $rows
            ],
            'detailPanel' => [
                'title' => 'Request Details',
                'cancellationDetails' => [
                    'title' => 'Cancellation Details',
                    'fields' => [
                        ['label' => 'Request ID', 'value' => 'REQ-2023-001'],
                        ['label' => 'Request Date', 'value' => 'Oct 12, 2023'],
                        ['label' => 'Reason', 'value' => 'Payoff Received in Full'],
                        ['label' => 'Requested By', 'value' => 'John Doe (Admin)']
                    ]
                ],
                'requiredDocuments' => [
                    'title' => 'Required Documents',
                    'status' => '1/2 Uploaded',
                    'statusBg' => '#FEF3C7',
                    'statusColor' => '#D97706',
                    'documents' => [
                        ['id' => 1, 'name' => 'Payoff Confirmation', 'status' => 'Uploaded', 'statusColor' => '#16A34A', 'date' => 'Oct 12, 2023', 'icon' => 'Eye'],
                        ['id' => 2, 'name' => 'Cancellation Authorization', 'status' => 'Pending', 'statusColor' => '#F59E0B', 'date' => '-', 'icon' => 'Upload']
                    ],
                    'uploadButton' => 'Upload Document'
                ],
                'efileStatus' => [
                    'title' => 'E-File Status',
                    'timeline' => [
                        ['id' => 1, 'label' => 'Request Created', 'date' => 'Oct 12, 2023 • 10:00 AM', 'status' => 'completed', 'statusColor' => '#3B82F6'],
                        ['id' => 2, 'label' => 'Documents Verified', 'date' => 'Oct 12, 2023 • 02:30 PM', 'status' => 'completed', 'statusColor' => '#3B82F6'],
                        ['id' => 3, 'label' => 'Submitted to County', 'date' => 'Pending', 'status' => 'pending', 'statusColor' => '#64748B'],
                        ['id' => 4, 'label' => 'Recording Confirmation', 'date' => '-', 'status' => 'pending', 'statusColor' => '#64748B']
                    ]
                ],
                'gscccaIntegration' => [
                    'title' => 'GSCCCA Integration',
                    'status' => 'Ready to File',
                    'statusColor' => '#16A34A',
                    'primaryAction' => ['label' => 'Submit to GSCCCA', 'bg' => '#3B82F6', 'color' => '#FFFFFF'],
                    'secondaryActions' => [
                        ['label' => 'View XML Preview', 'icon' => 'FileText'],
                        ['label' => 'Check Status', 'icon' => 'RefreshCw']
                    ]
                ]
            ]
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = EfileCancellation::with(['property', 'requestor']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function cancel(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'filing_id' => 'nullable|string',
            'reason' => 'required|string',
        ]);

        // Mock integration with E-Filing System
        // In real app: Call external API to cancel filing using filing_id

        $cancellation = EfileCancellation::create([
            'property_id' => $request->property_id,
            'filing_id' => $request->filing_id,
            'reason' => $request->reason,
            'requested_at' => now(),
            'status' => 'processing', // Initial status
            'requested_by' => $request->user()->id,
        ]);

        // Simulate async processing or immediate success
        $cancellation->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'data' => $cancellation,
            'message' => 'E-File cancellation submitted successfully'
        ], 201);
    }
}
