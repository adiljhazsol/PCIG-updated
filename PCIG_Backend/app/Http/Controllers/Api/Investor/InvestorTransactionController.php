<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvestorTransactionController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Transaction::where('user_id', $user->id);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
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

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $totalDeposits = Transaction::where('user_id', $user->id)
            ->where('type', 'deposit')
            ->where('status', 'completed')
            ->sum('amount');

        $totalWithdrawals = Transaction::where('user_id', $user->id)
            ->where('type', 'withdrawal')
            ->where('status', 'completed')
            ->sum('amount');

        $totalDistributions = Transaction::where('user_id', $user->id)
            ->where('type', 'distribution')
            ->where('status', 'completed')
            ->sum('amount');

        $pendingCount = Transaction::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_deposits' => (float) $totalDeposits,
                'total_withdrawals' => (float) $totalWithdrawals,
                'total_distributions' => (float) $totalDistributions,
                'pending_count' => $pendingCount,
            ],
        ]);
    }

    public function deposit(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'method' => 'required|string',
        ]);

        $user = $request->user();
        $amount = $request->amount;
        
        // Create transaction
        $transaction = Transaction::create([
            'reference_number' => 'DEP-' . strtoupper(uniqid()),
            'user_id' => $user->id,
            'type' => 'Deposit',
            'date' => now(),
            'amount' => $amount,
            'status' => 'Completed', // Auto-complete for demo
            'description' => 'Manual Deposit',
            'property_fund' => 'Wallet Deposit',
            'method' => $request->method,
            'type_icon' => 'Wallet',
            'type_icon_color' => '#6366F1',
            'type_icon_bg_color' => '#EEF2FF',
            'amount_color' => '#10B981',
            'status_bg_color' => '#ECFDF5',
            'status_color' => '#10B981',
            'action' => 'View',
            'action_color' => '#2563EB',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Deposit successful',
            'data' => new TransactionResource($transaction),
        ]);
    }
}
