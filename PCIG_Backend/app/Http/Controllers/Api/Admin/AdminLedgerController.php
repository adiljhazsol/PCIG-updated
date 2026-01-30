<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\LedgerEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminLedgerController extends Controller
{
    /**
     * Get dashboard data for Ledger
     */
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Stats
        $totalAssets = Account::where('type', 'asset')->sum('balance');
        $totalLiabilities = Account::where('type', 'liability')->sum('balance');
        $equity = Account::where('type', 'equity')->sum('balance');
        
        $revenue = Account::where('type', 'revenue')->sum('balance');
        $expenses = Account::where('type', 'expense')->sum('balance');
        $netIncome = $revenue - $expenses;

        // Mocking previous month data for trends (calculating real historical balances is complex without snapshots)
        // For now, we'll keep the trend percentages as placeholders or 0 if no data
        $stats = [
            ['label' => 'Total Assets', 'value' => '$' . number_format($totalAssets / 1000000, 2) . 'M', 'change' => '+0.0% vs last mo', 'icon' => 'Scale', 'color' => '#10B981'],
            ['label' => 'Total Liabilities', 'value' => '$' . number_format($totalLiabilities / 1000000, 2) . 'M', 'change' => '+0.0% vs last mo', 'icon' => 'TrendingDown', 'color' => '#F59E0B'],
            ['label' => 'Equity', 'value' => '$' . number_format($equity / 1000000, 2) . 'M', 'change' => '+0.0% vs last mo', 'icon' => 'TrendingUp', 'color' => '#3B82F6'],
            ['label' => 'Net Income (YTD)', 'value' => '$' . number_format($netIncome / 1000, 0) . 'k', 'change' => '+0.0% vs last year', 'icon' => 'FileText', 'color' => '#6366F1']
        ];

        // 2. Journal Entries
        $entries = LedgerEntry::with('account')
            ->orderBy('entry_date', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($entry) {
                $debit = $entry->debit > 0 ? '$' . number_format($entry->debit, 2) : '-';
                $credit = $entry->credit > 0 ? '$' . number_format($entry->credit, 2) : '-';
                $balance = '$' . number_format($entry->account ? $entry->account->balance : 0, 2);
                
                return [
                    'entryNumber' => 'JE-' . str_pad($entry->id, 5, '0', STR_PAD_LEFT),
                    'date' => $entry->entry_date->format('Y-m-d'),
                    'time' => $entry->created_at->format('h:i A'),
                    'type' => 'Journal', // Simplified for now
                    'typeColor' => '#2563EB',
                    'typeBg' => '#EFF6FF',
                    'description' => $entry->description,
                    'subDescription' => $entry->reference_id ? 'Ref: ' . $entry->reference_id : 'Manual Entry',
                    'propertyFund' => 'N/A', // Placeholder unless linked
                    'propertyAddress' => null,
                    'debit' => $debit,
                    'credit' => $credit,
                    'account' => $entry->account ? $entry->account->name : 'Unknown Account',
                    'source' => 'System',
                    'sourceColor' => '#64748B',
                    'sourceBg' => '#F1F5F9',
                    'balance' => $balance,
                    // Nested details for expansion if needed
                    'cashEntries' => [
                         [
                            'description' => $entry->description,
                            'debit' => $debit,
                            'credit' => $credit,
                            'account' => $entry->account ? $entry->account->name : 'Unknown',
                            'balance' => $balance
                         ]
                    ]
                ];
            });

        return response()->json([
            'lightweightLedger' => [
                'stats' => $stats,
                'journalEntries' => $entries
            ]
        ]);
    }

    /**
     * Get all ledger entries with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = LedgerEntry::with('account');

        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->has('start_date')) {
            $query->whereDate('entry_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('entry_date', '<=', $request->end_date);
        }

        $entries = $query->orderBy('entry_date', 'desc')
                         ->orderBy('created_at', 'desc')
                         ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $entries
        ]);
    }

    /**
     * Get Chart of Accounts with balances
     */
    public function accounts(): JsonResponse
    {
        $accounts = Account::orderBy('code')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    }

    /**
     * Create a manual journal entry (Double Entry)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'entry_date' => 'required|date',
            'description' => 'required|string',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|exists:accounts,id',
            'entries.*.debit' => 'required|numeric|min:0',
            'entries.*.credit' => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($request->entries)->sum('debit');
        $totalCredit = collect($request->entries)->sum('credit');

        // Allow a small float difference epsilon if needed, but strict equality is best for accounting
        if (abs($totalDebit - $totalCredit) > 0.001) {
            return response()->json([
                'success' => false,
                'message' => 'Debits must equal Credits. Difference: ' . ($totalDebit - $totalCredit),
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->entries as $entryData) {
                // Skip if both 0
                if ($entryData['debit'] == 0 && $entryData['credit'] == 0) {
                    continue;
                }

                LedgerEntry::create([
                    'account_id' => $entryData['account_id'],
                    'entry_date' => $request->entry_date,
                    'description' => $request->description,
                    'debit' => $entryData['debit'],
                    'credit' => $entryData['credit'],
                ]);

                // Update Account Balance
                // Asset/Expense: Debit increases, Credit decreases
                // Liability/Equity/Revenue: Credit increases, Debit decreases
                $account = Account::find($entryData['account_id']);
                
                if (in_array($account->type, ['asset', 'expense'])) {
                    $account->balance += ($entryData['debit'] - $entryData['credit']);
                } else {
                    $account->balance += ($entryData['credit'] - $entryData['debit']);
                }
                $account->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Journal entry recorded successfully.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to record journal entry: ' . $e->getMessage()
            ], 500);
        }
    }
}
