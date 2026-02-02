<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminPaymentController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Summary Cards
        $totalProcessed = Payment::where('status', 'completed')->sum('amount');
        $pendingApproval = Payment::where('status', 'pending')->sum('amount');
        $failedPayments = Payment::where('status', 'failed')->count();
        
        // Calculate average processing time (hours)
        $avgHours = Payment::where('status', 'completed')
            ->whereNotNull('processed_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, processed_at)) as avg_hours')
            ->value('avg_hours');
            
        $avgProcessingTime = $avgHours ? round($avgHours / 24, 1) . ' Days' : '0 Days';

        $summaryCards = [
            [
                'label' => 'Total Processed',
                'amount' => '$' . number_format($totalProcessed, 2),
                'subtext' => 'Volume YTD'
            ],
            [
                'label' => 'Pending Approval',
                'amount' => '$' . number_format($pendingApproval, 2),
                'count' => Payment::where('status', 'pending')->count() . ' items'
            ],
            [
                'label' => 'Failed Payments',
                'count' => $failedPayments . ' items',
                'subtext' => 'Requires attention'
            ],
            [
                'label' => 'Avg Processing Time',
                'amount' => $avgProcessingTime,
                'subtext' => '-4 hours vs last month'
            ]
        ];

        // 2. Payments List
        $payments = Payment::with('user')
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($payment) {
                // Map status to frontend colors
                $statusConfig = $this->getStatusConfig($payment->status);
                
                // Determine direction/type styling
                $direction = $payment->type === 'incoming' ? 'Incoming' : 'Outgoing';
                $directionColor = $payment->type === 'incoming' ? '#16A34A' : '#DC2626'; // Green / Red

                return [
                    'id' => (string)$payment->id,
                    'type' => ucfirst($payment->type ?? 'Transfer'),
                    'direction' => $direction,
                    'directionColor' => $directionColor,
                    'status' => ucfirst($payment->status),
                    'statusBg' => $statusConfig['bg'],
                    'statusColor' => $statusConfig['color'],
                    'recipient' => $payment->user ? $payment->user->name : 'Unknown User',
                    'recipientType' => 'Investor', // Could be derived from user role
                    'amount' => '$' . number_format($payment->amount, 2),
                    'relatedTo' => 'Fund A', // Mock or derive if we add relation
                    'method' => $payment->payment_method ?? 'Wire Transfer',
                    'date' => $payment->created_at->format('M d, Y'),
                    
                    // Detail view data
                    'details' => [
                        'recipient' => $payment->user ? $payment->user->name : 'Unknown',
                        'method' => $payment->payment_method ?? 'Wire Transfer',
                        'account' => '****' . rand(1000, 9999), // Mock for security
                        'accountVerified' => true,
                        'initiated' => $payment->created_at->format('M d, Y h:i A'),
                        'initiatedBy' => 'System'
                    ],
                    'context' => [
                        'fundName' => 'Growth Fund I',
                        'fundId' => 'FUND-001',
                        'description' => 'Quarterly distribution payment'
                    ],
                    'timeline' => [
                        [
                            'step' => 'Initiated',
                            'status' => 'completed',
                            'color' => '#10B981',
                            'date' => $payment->created_at->format('M d, Y h:i A')
                        ],
                        [
                            'step' => 'Processing',
                            'status' => $payment->status === 'completed' ? 'completed' : 'current',
                            'color' => '#3B82F6',
                            'date' => $payment->updated_at->format('M d, Y h:i A')
                        ],
                        [
                            'step' => 'Completed',
                            'status' => $payment->status === 'completed' ? 'completed' : 'pending',
                            'color' => '#10B981'
                        ]
                    ],
                    'actionButtons' => [
                        'approve' => ['label' => 'Approve', 'color' => 'bg-green-600'],
                        'reject' => ['label' => 'Reject', 'color' => 'bg-red-600']
                    ]
                ];
            });

        // 3. Filters & Tabs
        $tabs = [
            ['key' => 'all', 'label' => 'All Payments'],
            ['key' => 'pending', 'label' => 'Pending Approval'],
            ['key' => 'completed', 'label' => 'Completed'],
            ['key' => 'failed', 'label' => 'Failed']
        ];

        $filters = [
            ['label' => 'Status', 'options' => ['All', 'Completed', 'Pending', 'Failed']],
            ['label' => 'Type', 'options' => ['All', 'Incoming', 'Outgoing']],
            ['label' => 'Method', 'options' => ['All', 'Wire', 'ACH', 'Check']],
            ['label' => 'Date', 'options' => ['Last 7 Days', 'This Month', 'Last Month']]
        ];

        return response()->json([
            'header' => [
                'title' => 'Payments Center',
                'subtitle' => 'Manage incoming and outgoing payments across all funds and properties.'
            ],
            'actionButtons' => [
                'reports' => ['label' => 'Download Reports', 'icon' => 'FileText'],
                'processPayments' => ['label' => 'Process Payments', 'icon' => 'Plus']
            ],
            'summaryCards' => $summaryCards,
            'tabs' => $tabs,
            'searchPlaceholder' => 'Search payments by ID, recipient, or amount...',
            'filters' => $filters,
            'tableHeaders' => ['', 'Payment ID', 'Type', 'Recipient', 'Amount', 'Related To', 'Method', 'Status', 'Date'],
            'payments' => $payments,
            'selectedPayment' => $payments->first() // Default selection
        ]);
    }

    private function getStatusConfig($status)
    {
        switch (strtolower($status)) {
            case 'completed':
                return ['bg' => '#ECFDF5', 'color' => '#059669'];
            case 'pending':
                return ['bg' => '#EFF6FF', 'color' => '#3B82F6'];
            case 'failed':
                return ['bg' => '#FEF2F2', 'color' => '#DC2626'];
            case 'processing':
                return ['bg' => '#FFFBEB', 'color' => '#D97706'];
            default:
                return ['bg' => '#F3F4F6', 'color' => '#6B7280'];
        }
    }

    public function index()
    {
        return response()->json(Payment::all());
    }

    public function pending()
    {
        return response()->json(Payment::where('status', 'pending')->get());
    }

    public function processBatch(Request $request)
    {
        // Mock processing
        return response()->json(['message' => 'Batch processed successfully']);
    }

    public function store(Request $request)
    {
        // Validation would go here
        $payment = Payment::create($request->all());
        return response()->json($payment, 201);
    }
}
