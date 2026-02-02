<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\Admin\CreateTransactionRequest;
use Carbon\Carbon;

class AdminTransactionController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Date ranges
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Stats
        $totalVolume = Transaction::sum('amount');
        
        // Volume Trends (This Month vs Last Month)
        $thisMonthVolume = Transaction::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('amount');
        $lastMonthVolume = Transaction::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->sum('amount');
        $volumeTrend = $lastMonthVolume > 0 ? (($thisMonthVolume - $lastMonthVolume) / $lastMonthVolume) * 100 : 100;
        $volumeTrendStr = ($volumeTrend >= 0 ? '+' : '') . number_format($volumeTrend, 1) . '%';

        $transactionCount = Transaction::count();
        
        // Count Trends
        $thisMonthCount = Transaction::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $lastMonthCount = Transaction::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $countTrend = $lastMonthCount > 0 ? (($thisMonthCount - $lastMonthCount) / $lastMonthCount) * 100 : 100;
        $countTrendStr = ($countTrend >= 0 ? '+' : '') . number_format($countTrend, 1) . '%';

        $pendingVolume = Transaction::where('status', 'pending')->sum('amount');
        $pendingCount = Transaction::where('status', 'pending')->count();

        $avgTransaction = Transaction::count() > 0 ? Transaction::avg('amount') : 0;
        
        // Avg Trends
        $thisMonthAvg = $thisMonthCount > 0 ? $thisMonthVolume / $thisMonthCount : 0;
        $lastMonthAvg = $lastMonthCount > 0 ? $lastMonthVolume / $lastMonthCount : 0;
        $avgTrend = $lastMonthAvg > 0 ? (($thisMonthAvg - $lastMonthAvg) / $lastMonthAvg) * 100 : 0;
        $avgTrendStr = ($avgTrend >= 0 ? '+' : '') . number_format($avgTrend, 1) . '%';

        // Transactions List
        $transactionsModels = Transaction::with(['user', 'property', 'fund'])
            ->latest()
            ->limit(20)
            ->get();

        $transactions = $transactionsModels->map(function ($txn) {
                // Determine Type Colors
                $typeColors = $this->getTypeColors($txn->type);
                
                // Determine Status Colors
                $statusColors = $this->getStatusColors($txn->status);

                // Determine Asset
                $asset = 'General Platform';
                $assetId = 'N/A';
                if ($txn->property) {
                    $asset = $txn->property->address;
                    $assetId = 'PROP-' . $txn->property->id;
                } elseif ($txn->fund) {
                    $asset = $txn->fund->name;
                    $assetId = 'FUND-' . $txn->fund->id;
                }

                // Determine Counterparty
                $counterparty = $txn->user ? $txn->user->name : 'Platform System';
                $counterpartyRole = $txn->user ? 'Investor' : 'Admin';

                return [
                    'id' => 'TX-' . str_pad($txn->id, 5, '0', STR_PAD_LEFT),
                    'type' => ucfirst($txn->type),
                    'typeBg' => $typeColors['bg'],
                    'typeColor' => $typeColors['text'],
                    'asset' => $asset,
                    'assetId' => $assetId,
                    'counterparty' => $counterparty,
                    'counterpartyRole' => $counterpartyRole,
                    'price' => ($txn->type == 'withdrawal' || $txn->type == 'expense' ? '-' : '+') . '$' . number_format($txn->amount, 2),
                    'status' => ucfirst($txn->status),
                    'statusBg' => $statusColors['bg'],
                    'statusColor' => $statusColors['text'],
                    'date' => $txn->created_at->format('M d, Y'),
                    'selected' => false
                ];
            });

        $selectedTransaction = null;
        if ($transactionsModels->isNotEmpty()) {
            $selectedTransaction = $this->formatSelectedTransaction($transactionsModels->first());
        }

        return response()->json([
            'assetTransactions' => [
                'header' => [
                    'title' => 'Transactions',
                    'subtitle' => 'Monitor and manage all financial transactions across the platform.'
                ],
                'actionButtons' => [
                    'createTransaction' => ['label' => 'New Transaction', 'icon' => 'Plus', 'action' => 'new'],
                    'export' => ['label' => 'Export Report', 'icon' => 'Download', 'action' => 'export']
                ],
                'summaryCards' => [
                    ['label' => 'Total Volume', 'value' => '$' . number_format($totalVolume), 'trend' => $volumeTrendStr, 'icon' => 'TrendingUp', 'color' => '#10B981'],
                    ['label' => 'Transactions', 'value' => number_format($transactionCount), 'trend' => $countTrendStr, 'icon' => 'FileText', 'color' => '#3B82F6'],
                    ['label' => 'Pending', 'value' => '$' . number_format($pendingVolume), 'trend' => $pendingCount . ' items', 'icon' => 'Clock', 'color' => '#F59E0B'],
                    ['label' => 'Avg. Transaction', 'value' => '$' . number_format($avgTransaction, 2), 'trend' => $avgTrendStr, 'icon' => 'CheckCircle2', 'color' => '#6366F1']
                ],
                'tabs' => [
                    ['key' => 'all', 'label' => 'All Transactions'],
                    ['key' => 'incoming', 'label' => 'Incoming'],
                    ['key' => 'outgoing', 'label' => 'Outgoing'],
                    ['key' => 'pending', 'label' => 'Pending'],
                    ['key' => 'failed', 'label' => 'Failed']
                ],
                'searchPlaceholder' => 'Search by transaction ID, recipient, or amount...',
                'filters' => [
                    ['label' => 'Status', 'options' => ['Completed', 'Pending', 'Failed', 'Cancelled']],
                    ['label' => 'Type', 'options' => ['Investment', 'Distribution', 'Expense', 'Refund']],
                    ['label' => 'Date Range', 'options' => ['Last 7 Days', 'This Month', 'Last Month', 'This Year']]
                ],
                'tableHeaders' => ['', 'Transaction ID', 'Type', 'Asset', 'Counterparty', 'Amount', 'Status', 'Date'],
                'transactions' => $transactions,
                'selectedTransaction' => $selectedTransaction
            ]
        ]);
    }

    private function formatSelectedTransaction($txn)
    {
        $typeColors = $this->getTypeColors($txn->type);
        $statusColors = $this->getStatusColors($txn->status);

        // Asset
        $asset = 'General Platform';
        if ($txn->property) {
            $asset = $txn->property->address;
        } elseif ($txn->fund) {
            $asset = $txn->fund->name;
        }

        // Counterparty
        $counterpartyName = $txn->user ? $txn->user->name : 'Platform System';
        $initials = 'PS';
        if ($txn->user && $txn->user->name) {
            $words = explode(' ', $txn->user->name);
            $initials = '';
            foreach ($words as $w) {
                $initials .= strtoupper(substr($w, 0, 1));
            }
            $initials = substr($initials, 0, 2);
        }
        
        // Formatted dates/amounts
        $contractDate = $txn->created_at->format('M d, Y');
        $closingDate = $txn->updated_at->format('M d, Y');
        $earnestMoney = '$0.00';
        $netProceeds = '$' . number_format($txn->amount, 2);

        return [
            'id' => 'TX-' . str_pad($txn->id, 5, '0', STR_PAD_LEFT),
            'status' => ucfirst($txn->status),
            'statusBg' => $statusColors['bg'],
            'statusColor' => $statusColors['text'],
            'type' => ucfirst($txn->type),
            'asset' => $asset,
            'price' => ($txn->type == 'withdrawal' || $txn->type == 'expense' ? '-' : '+') . '$' . number_format($txn->amount, 2),
            'typeBg' => $typeColors['bg'],
            'typeColor' => $typeColors['text'],
            'priceLabel' => 'Total Amount',
            'details' => [
                'property' => $asset,
                'counterparty' => $counterpartyName,
                'contractDate' => $contractDate,
                'closingDate' => $closingDate,
                'earnestMoney' => $earnestMoney,
                'netProceeds' => $netProceeds
            ],
            'timeline' => [
                [
                    'status' => 'completed',
                    'step' => 'Initiated',
                    'date' => $txn->created_at->format('M d, Y h:i A'),
                    'color' => '#10B981',
                    'subtext' => 'Transaction initiated by system'
                ],
                [
                    'status' => $txn->status === 'completed' ? 'completed' : 'current',
                    'step' => 'Processing',
                    'date' => $txn->updated_at->format('M d, Y h:i A'),
                    'color' => '#3B82F6',
                    'subtext' => 'Transaction is being processed'
                ],
                [
                    'status' => $txn->status === 'completed' ? 'completed' : 'pending',
                    'step' => 'Completed',
                    'date' => $txn->status === 'completed' ? $txn->updated_at->format('M d, Y h:i A') : 'Pending',
                    'color' => '#6366F1',
                    'subtext' => 'Funds successfully transferred'
                ]
            ],
            'documents' => [],
            'counterparty' => [
                'name' => $counterpartyName,
                'role' => $txn->user ? 'Investor' : 'System',
                'email' => $txn->user ? $txn->user->email : 'system@platform.com',
                'phone' => $txn->user ? $txn->user->phone : 'N/A',
                'initials' => $initials
            ],
            'activityLog' => [
                [
                    'action' => 'Transaction Created',
                    'date' => $txn->created_at->format('M d, Y h:i A'),
                    'author' => 'System'
                ]
            ],
            'actionButtons' => [
                'terminate' => [
                    'label' => 'Terminate',
                    'color' => '#EF4444',
                    'icon' => 'XCircle'
                ],
                'updateStatus' => [
                    'label' => 'Update Status',
                    'color' => '#3B82F6',
                    'icon' => 'Edit'
                ],
                'closeTransaction' => [
                    'label' => 'Close Transaction',
                    'color' => '#10B981',
                    'icon' => 'CheckCircle2'
                ]
            ]
        ];
    }

    private function getTypeColors($type)
    {
        $colors = [
            'investment' => ['bg' => '#DBEAFE', 'text' => '#1E40AF'], // Blue
            'distribution' => ['bg' => '#D1FAE5', 'text' => '#065F46'], // Green
            'expense' => ['bg' => '#FEE2E2', 'text' => '#991B1B'], // Red
            'withdrawal' => ['bg' => '#F3F4F6', 'text' => '#374151'], // Gray
            'deposit' => ['bg' => '#E0E7FF', 'text' => '#3730A3'], // Indigo
        ];
        return $colors[$type] ?? ['bg' => '#F3F4F6', 'text' => '#374151'];
    }

    private function getStatusColors($status)
    {
        $colors = [
            'completed' => ['bg' => '#DCFCE7', 'text' => '#166534'], // Green
            'pending' => ['bg' => '#FEF3C7', 'text' => '#B45309'], // Yellow
            'failed' => ['bg' => '#FEE2E2', 'text' => '#991B1B'], // Red
            'cancelled' => ['bg' => '#F1F5F9', 'text' => '#64748B'], // Gray
            'processing' => ['bg' => '#DBEAFE', 'text' => '#1E40AF'], // Blue
        ];
        return $colors[$status] ?? ['bg' => '#F1F5F9', 'text' => '#64748B'];
    }

    public function list(Request $request): JsonResponse
    {
        $query = Transaction::with(['user', 'property', 'fund']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('fund_id')) {
            $query->where('fund_id', $request->fund_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 50);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => TransactionResource::collection($transactions->items()),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $transaction = Transaction::with(['user', 'property', 'fund', 'investment'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction),
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,completed,failed,cancelled',
        ]);

        $transaction = Transaction::findOrFail($id);
        $transaction->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction status updated',
            'data' => new TransactionResource($transaction),
        ]);
    }

    public function store(CreateTransactionRequest $request): JsonResponse
    {
        $referenceNumber = 'TXN-' . str_pad(Transaction::max('id') + 1, 8, '0', STR_PAD_LEFT);

        $transaction = Transaction::create([
            'user_id' => $request->user_id, // Can be null
            'type' => $request->type,
            'date' => Carbon::now(),
            'amount' => $request->amount,
            'property_id' => $request->property_id,
            'fund_id' => $request->fund_id,
            'investment_id' => $request->investment_id,
            'description' => $request->description,
            'status' => $request->status ?? 'pending',
            'reference_number' => $referenceNumber,
            'metadata' => $request->metadata,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => new TransactionResource($transaction->load(['user', 'property', 'fund'])),
        ], 201);
    }
}
