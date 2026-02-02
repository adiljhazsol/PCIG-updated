<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EfileCancellation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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

        // Calculate trends
        $currentMonthStart = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        // Total Requests Trend
        $newThisMonth = EfileCancellation::whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])->count();
        $newLastMonth = EfileCancellation::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $diff = $newThisMonth - $newLastMonth;
        $trend = $diff >= 0 ? 'up' : 'down';
        $change = ($diff >= 0 ? '+' : '') . abs($diff) . ' vs last mo';

        // Pending Trend
        $pendingThisMonth = EfileCancellation::where('status', 'pending')->whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])->count();
        $pendingLastMonth = EfileCancellation::where('status', 'pending')->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $pendingDiff = $pendingThisMonth - $pendingLastMonth;
        $pendingTrend = $pendingDiff >= 0 ? 'up' : 'down';
        $pendingChange = ($pendingDiff >= 0 ? '+' : '') . abs($pendingDiff) . ' vs last mo';

        // Processed Trend
        $processedThisMonth = EfileCancellation::where('status', 'cancelled')->whereBetween('updated_at', [$currentMonthStart, $currentMonthEnd])->count();
        $processedLastMonth = EfileCancellation::where('status', 'cancelled')->whereBetween('updated_at', [$lastMonthStart, $lastMonthEnd])->count();
        $processedDiff = $processedThisMonth - $processedLastMonth;
        $processedTrend = $processedDiff >= 0 ? 'up' : 'down';
        $processedChange = ($processedDiff >= 0 ? '+' : '') . abs($processedDiff) . ' vs last mo';

        // Failed Trend
        $failedThisMonth = EfileCancellation::where('status', 'failed')->whereBetween('updated_at', [$currentMonthStart, $currentMonthEnd])->count();
        $failedLastMonth = EfileCancellation::where('status', 'failed')->whereBetween('updated_at', [$lastMonthStart, $lastMonthEnd])->count();
        $failedDiff = $failedThisMonth - $failedLastMonth;
        $failedTrend = $failedDiff >= 0 ? 'up' : 'down';
        $failedChange = ($failedDiff >= 0 ? '+' : '') . abs($failedDiff) . ' vs last mo';

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
                    'taxYear' => '-', 
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
                'gsccca_status' => $cancellation->gsccca_status ?? 'pending',
                'submitted_at' => $cancellation->submitted_at ? $cancellation->submitted_at->format('M d, Y • h:i A') : null,
                'created_at_fmt' => $cancellation->created_at->format('M d, Y • h:i A'),
            ];
        });

        return response()->json([
            'header' => [
                'title' => 'E-File & Cancellations',
                'subtitle' => 'Manage electronic filings and cancellation requests',
                'actionButtons' => [
                    ['label' => 'Batch E-File', 'icon' => 'Upload', 'variant' => 'primary']
                ]
            ],
            'summaryCards' => [
                [
                    'id' => 'total-requests',
                    'title' => 'Total Requests',
                    'value' => (string)$totalRequests,
                    'change' => $change,
                    'trend' => $trend,
                    'icon' => 'FileText',
                    'color' => '#3B82F6'
                ],
                [
                    'id' => 'pending-approval',
                    'title' => 'Pending Approval',
                    'value' => (string)$pendingApproval,
                    'change' => $pendingChange,
                    'trend' => $pendingTrend,
                    'icon' => 'Clock',
                    'color' => '#F59E0B'
                ],
                [
                    'id' => 'processed',
                    'title' => 'Processed',
                    'value' => (string)$processed,
                    'change' => $processedChange,
                    'trend' => $processedTrend,
                    'icon' => 'CheckCircle2',
                    'color' => '#10B981'
                ],
                [
                    'id' => 'failed',
                    'title' => 'Failed / Action Needed',
                    'value' => (string)$failed,
                    'change' => $failedChange,
                    'trend' => $failedTrend,
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
            // Removed static detailPanel
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

        $cancellation = EfileCancellation::create([
            'property_id' => $request->property_id,
            'filing_id' => $request->filing_id,
            'reason' => $request->reason,
            'requested_at' => now(),
            'status' => 'processing', // Initial status
            'requested_by' => $request->user()->id,
            'gsccca_status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'data' => $cancellation,
            'message' => 'E-File cancellation submitted successfully'
        ], 201);
    }
    
    public function submitToGsccca(Request $request, $id): JsonResponse
    {
        $cancellation = EfileCancellation::findOrFail($id);
        
        $xmlContent = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" .
            "<CancellationRequest>\n" .
            "  <RequestID>{$cancellation->id}</RequestID>\n" .
            "  <PropertyAddress>" . ($cancellation->property->address ?? 'N/A') . "</PropertyAddress>\n" .
            "  <Timestamp>" . now()->toIso8601String() . "</Timestamp>\n" .
            "  <Type>Cancellation</Type>\n" .
            "</CancellationRequest>";

        // Simulate GSCCCA submission
        $cancellation->update([
            'gsccca_status' => 'submitted',
            'submitted_at' => now(),
            'gsccca_transaction_id' => 'GSCCCA-' . strtoupper(uniqid()),
            'status' => 'processing',
            'xml_content' => $xmlContent
        ]);
        
        return response()->json(['success' => true, 'message' => 'Submitted to GSCCCA', 'data' => $cancellation]);
    }

    public function viewXml(Request $request, $id): JsonResponse
    {
        $cancellation = EfileCancellation::findOrFail($id);
        
        if (!$cancellation->xml_content) {
             return response()->json(['success' => false, 'message' => 'No XML content available'], 404);
        }

        return response()->json(['success' => true, 'xml_content' => $cancellation->xml_content]);
    }
    
    public function checkStatus(Request $request, $id): JsonResponse
    {
        $cancellation = EfileCancellation::findOrFail($id);
        
        // Simulate status check logic
        if ($cancellation->gsccca_status === 'submitted') {
            // Randomly approve or keep processing for demo
            $cancellation->update([
                'gsccca_status' => 'accepted',
                'status' => 'cancelled'
            ]);
        }
        
        return response()->json(['success' => true, 'status' => $cancellation->gsccca_status]);
    }
    
    public function batchEfile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls,xml|max:10240', // 10MB max
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('efile-batches', 'local');
            
            // In a real scenario, we would dispatch a job to process this file
            // ProcessBatchEfile::dispatch($path);
            
            return response()->json([
                'success' => true, 
                'message' => 'Batch file uploaded and queued for processing.',
                'path' => $path
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file uploaded'], 400);
    }
}
