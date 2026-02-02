<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\LedgerEntry;
use App\Models\Property;
use App\Models\Fund;
use App\Models\Transaction;
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
        if ($request->boolean('recalculate')) {
            $this->recalculateBalancesInternal();
        }

        $totalAssets = \App\Models\Property::sum('current_value') + \App\Models\Fund::sum('total_assets');
        $totalLiabilities = \App\Models\Expense::sum('amount'); // Simplified liability proxy
        $netEquity = $totalAssets - $totalLiabilities;
        
        // Calculate Net Income (YTD)
        $incomeYTD = \App\Models\Payment::where('type', 'incoming')
            ->where('status', 'completed')
            ->whereYear('processed_at', now()->year)
            ->sum('amount');
            
        $expensesYTD = \App\Models\Expense::whereYear('date', now()->year)->sum('amount');
        $netIncome = $incomeYTD - $expensesYTD;
        
        // Calculate trends (vs last month)
        $lastMonthAssets = \App\Models\Property::where('created_at', '<', now()->subMonth())->sum('current_value'); 
        $assetTrend = $lastMonthAssets > 0 ? (($totalAssets - $lastMonthAssets) / $lastMonthAssets) * 100 : 0;
        $assetTrendStr = ($assetTrend >= 0 ? '+' : '') . number_format($assetTrend, 1) . '% vs last mo';

        $stats = [
            ['label' => 'Total Assets', 'value' => '$' . number_format($totalAssets / 1000000, 2) . 'M', 'change' => $assetTrendStr, 'icon' => 'Scale', 'color' => '#10B981'],
            ['label' => 'Total Liabilities', 'value' => '$' . number_format($totalLiabilities / 1000000, 2) . 'M', 'change' => '+0.0% vs last mo', 'icon' => 'TrendingDown', 'color' => '#F59E0B'],
            ['label' => 'Equity', 'value' => '$' . number_format($netEquity / 1000000, 2) . 'M', 'change' => '+0.0% vs last mo', 'icon' => 'TrendingUp', 'color' => '#3B82F6'],
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
                    'subDescription' => $entry->transaction_id ? 'Ref: #' . $entry->transaction_id : 'Manual Entry',
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

        // 3. Account Balances
        $accounts = Account::orderBy('code')->get()->map(function ($acc) {
            return [
                'id' => $acc->id,
                'code' => $acc->code,
                'name' => $acc->name,
                'type' => ucfirst($acc->type),
                'balance' => '$' . number_format($acc->balance, 2)
            ];
        });

        // 4. Property P&L
        $propertyPL = Property::select('id', 'address')->get()->map(function ($p) {
            // Expenses from Expense model
            $expenses = \App\Models\Expense::where('property_id', $p->id)->sum('amount');
            
            // Income from Transactions (assuming type 'rent' or 'income')
            $income = Transaction::where('property_id', $p->id)
                ->whereIn('type', ['rent', 'income', 'revenue', 'sale'])
                ->sum('amount');

            return [
                'id' => $p->id,
                'name' => $p->address,
                'income' => '$' . number_format($income, 2),
                'expenses' => '$' . number_format($expenses, 2),
                'netIncome' => '$' . number_format($income - $expenses, 2),
                'rawNet' => $income - $expenses // for sorting/styling
            ];
        });

        // 5. Fund P&L
        $fundPL = Fund::select('id', 'name')->get()->map(function ($f) {
            // Expenses linked to Fund (if Expense has fund_id, else 0)
            // Assuming Expense model has fund_id based on typical structure, if not we check
            // For now, let's assume it might not, so we use Transaction for both if possible.
            // Or just use Transaction for everything related to Fund.
            
            $income = Transaction::where('fund_id', $f->id)
                ->whereIn('type', ['subscription', 'income', 'revenue'])
                ->sum('amount');
                
            $expenses = Transaction::where('fund_id', $f->id)
                ->whereIn('type', ['expense', 'fee', 'management_fee'])
                ->sum('amount');

            return [
                'id' => $f->id,
                'name' => $f->name,
                'income' => '$' . number_format($income, 2),
                'expenses' => '$' . number_format($expenses, 2),
                'netIncome' => '$' . number_format($income - $expenses, 2),
                'rawNet' => $income - $expenses
            ];
        });

        return response()->json([
            'lightweightLedger' => [
                'stats' => $stats,
                'journalEntries' => $entries,
                'accounts' => $accounts,
                'propertyPL' => $propertyPL,
                'fundPL' => $fundPL
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
     * Recalculate all account balances from ledger entries
     */
    public function recalculate(): JsonResponse
    {
        try {
            $this->recalculateBalancesInternal();

            return response()->json([
                'success' => true,
                'message' => 'Account balances recalculated successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to recalculate balances: ' . $e->getMessage()
            ], 500);
        }
    }

    private function recalculateBalancesInternal()
    {
        DB::beginTransaction();

        try {
            // Reset all balances to 0
            Account::query()->update(['balance' => 0]);

            $accounts = Account::all();

            foreach ($accounts as $account) {
                $debits = LedgerEntry::where('account_id', $account->id)->sum('debit');
                $credits = LedgerEntry::where('account_id', $account->id)->sum('credit');

                if (in_array($account->type, ['asset', 'expense'])) {
                    $account->balance = $debits - $credits;
                } else {
                    $account->balance = $credits - $debits;
                }
                $account->save();
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Export ledger entries to CSV
     */
    public function export()
    {
        $filename = 'ledger_export_' . date('Y-m-d_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Date', 'Entry #', 'Description', 'Account', 'Debit', 'Credit', 'Transaction ID'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            LedgerEntry::with('account')
                ->orderBy('entry_date', 'desc')
                ->chunk(100, function($entries) use ($file) {
                    foreach ($entries as $entry) {
                        fputcsv($file, [
                            $entry->entry_date->format('Y-m-d'),
                            'JE-' . str_pad($entry->id, 5, '0', STR_PAD_LEFT),
                            $entry->description,
                            $entry->account ? $entry->account->name : 'Unknown',
                            $entry->debit,
                            $entry->credit,
                            $entry->transaction_id ?? 'Manual'
                        ]);
                    }
                });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Create a manual journal entry (Double Entry)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'entry_date' => 'required|date',
            'description' => 'required|string',
            'entries' => 'required|array|min:1',
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
