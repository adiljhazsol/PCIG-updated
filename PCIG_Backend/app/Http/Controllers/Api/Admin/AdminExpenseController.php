<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseAllocation;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;

class AdminExpenseController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Summary Cards Data
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Total Expenses (All time or Current Month? Usually current month or YTD is better for dashboard, but let's do All Time for "Total" and trend for month)
        // Let's stick to "This Month" for the main big number if it makes sense, or Total YTD.
        // The mock data shows "$124,500" which is quite high for a month, maybe YTD.
        // Let's do Total All Time for the first card.
        $totalExpenses = Expense::sum('amount');
        
        // Pending Allocations - In this system, allocations are created on store, so maybe 0.
        // Or we can check if total allocation amount matches expense amount.
        // For now, let's assume if it has allocations, it's allocated.
        // If we want "Pending", maybe we can look for expenses where allocations sum < expense amount.
        $pendingAllocationsCount = Expense::doesntHave('allocations')->count();

        // Avg Expense (This Month)
        $avgExpense = Expense::whereBetween('date', [$startOfMonth, $endOfMonth])->avg('amount') ?? 0;

        // Active Properties (with expenses this month)
        $activePropertiesCount = Expense::whereBetween('date', [$startOfMonth, $endOfMonth])->distinct('property_id')->count();

        // Trends
        $expensesLastMonth = Expense::whereBetween('date', [$startOfLastMonth, $endOfLastMonth])->sum('amount');
        $expensesThisMonth = Expense::whereBetween('date', [$startOfMonth, $endOfMonth])->sum('amount');
        
        $trendDiff = $expensesThisMonth - $expensesLastMonth;
        $trendStr = ($trendDiff >= 0 ? '+' : '-') . '$' . number_format(abs($trendDiff), 2);
        $trendColor = $trendDiff >= 0 ? '#10B981' : '#EF4444'; // Green if more? Actually for expenses, more is bad usually, but "Growth" is usually green. Let's keep it neutral or green for "Activity".
        // Actually for expenses, + is usually red (more spending), - is green (savings).
        $trendColor = $trendDiff > 0 ? '#EF4444' : '#10B981';

        // 2. Table Data
        $query = Expense::with(['property', 'allocations']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhereHas('property', function($pq) use ($search) {
                      $pq->where('address', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('property') && $request->property !== 'All Properties') {
            $query->whereHas('property', function($q) use ($request) {
                $q->where('address', $request->property);
            });
        }

        if ($request->filled('category') && $request->category !== 'All Categories') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'All Status') {
            if ($request->status === 'Allocated') {
                $query->has('allocations');
            } elseif ($request->status === 'Pending') {
                $query->doesntHave('allocations');
            }
        }

        $expenses = $query->orderBy('date', 'desc')
            ->distinct()
            ->limit(20) // Increased limit for better visibility or could be paginated
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'selected' => false,
                    'date' => $expense->date->format('M d, Y'),
                    'property' => $expense->property->address ?? 'Unknown Property',
                    'category' => ucfirst($expense->category),
                    'description' => $expense->description,
                    'amount' => '$' . number_format($expense->amount, 2),
                    'status' => $expense->allocations->count() > 0 ? 'Allocated' : 'Pending',
                    'statusColor' => $expense->allocations->count() > 0 ? '#10B981' : '#F59E0B',
                ];
            });

        // 3. Filters
        $properties = Property::orderBy('address')->pluck('address')->toArray();
        $propertiesList = Property::select('id', 'address')->orderBy('address')->get();
        $categories = Expense::distinct('category')->pluck('category')->map(fn($c) => ucfirst($c))->toArray();

        // Construct Response
        return response()->json([
            'expenseInputShareAllocation' => [
                'propertiesList' => $propertiesList,
                'header' => [
                    'title' => 'Expense Input & Share Allocation',
                    'subtitle' => 'Manage expenses and allocations',
                    'backLink' => ['label' => 'Back to Dashboard', 'path' => '/admin'],
                    'actionButtons' => [
                        ['label' => 'Bulk Import', 'icon' => 'Upload'],
                        ['label' => 'New Expense', 'icon' => 'Plus']
                    ]
                ],
                'summaryCards' => [
                    [
                        'icon' => 'DollarSign',
                        'label' => 'Total Expenses',
                        'value' => '$' . number_format($totalExpenses, 2),
                        'color' => '#3B82F6',
                        'bg' => '#EFF6FF',
                        'trend' => $trendStr . ' vs last month',
                        'trendColor' => $trendColor
                    ],
                    [
                        'icon' => 'Clock',
                        'label' => 'Pending Allocations',
                        'value' => (string)$pendingAllocationsCount,
                        'color' => '#F59E0B',
                        'bg' => '#FFFBEB',
                        'subtitle' => 'Requires attention'
                    ],
                    [
                        'icon' => 'CheckCircle2',
                        'label' => 'Avg. Expense',
                        'value' => '$' . number_format($avgExpense, 2),
                        'color' => '#10B981',
                        'bg' => '#ECFDF5',
                        'subtitle' => 'This month'
                    ],
                    [
                        'icon' => 'Users',
                        'label' => 'Active Properties',
                        'value' => (string)$activePropertiesCount,
                        'color' => '#8B5CF6',
                        'bg' => '#F5F3FF',
                        'subtitle' => 'With recent expenses'
                    ]
                ],
                'searchAndFilters' => [
                    'searchPlaceholder' => 'Search expenses, properties, or categories...',
                    'filters' => [
                        [
                            'label' => 'Property',
                            'value' => 'All Properties',
                            'icon' => 'Home',
                            'options' => array_merge(['All Properties'], $properties)
                        ],
                        [
                            'label' => 'Category',
                            'value' => 'All Categories',
                            'icon' => 'Search', // Using Search icon as generic filter icon if Category specific one not available
                            'options' => array_merge(['All Categories'], $categories)
                        ],
                        [
                            'label' => 'Status',
                            'value' => 'All Status',
                            'icon' => 'CheckCircle2',
                            'options' => ['All Status', 'Allocated', 'Pending']
                        ]
                    ]
                ],
                'expensesTable' => [
                    'headers' => ['Select', 'Date', 'Property', 'Category', 'Description', 'Amount', 'Status'],
                    'rows' => $expenses
                ],
                'detailPanel' => [
                    'expenseInformation' => [
                        'editIcon' => 'Edit',
                        'fields' => [
                            // We can populate this dynamically if a specific expense is requested, 
                            // but for the initial load, it's often empty or the first item.
                            // The frontend seems to pick the first one or selected one.
                            // We'll leave the structure generic here, frontend logic handles selection.
                        ]
                    ],
                    'actions' => [
                        'approve' => ['icon' => 'Check'],
                        'reject' => ['icon' => 'X']
                    ]
                ]
            ]
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Expense::with(['property', 'allocations']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'required|string',
            'category' => 'required|string',
            'allocation_method' => 'in:equal,ownership_percentage',
        ]);

        $expense = Expense::create([
            'property_id' => $request->property_id,
            'amount' => $request->amount,
            'date' => $request->date,
            'description' => $request->description,
            'category' => $request->category,
            'allocation_method' => $request->allocation_method ?? 'ownership_percentage',
            'created_by' => $request->user()->id,
        ]);

        // If explicitly requested to not allocate immediately (e.g. draft), skip.
        // For now, we keep existing behavior of auto-allocating on create, 
        // unless we want to change to a strict approval flow.
        // But since we have an "Approve" button, let's assume we might want to support delayed allocation.
        // However, to fix the current "Pending" item, we just need the approve method.
        // We will duplicate the logic or extract it. Let's extract it.
        $this->calculateAndSaveAllocations($expense);

        return response()->json([
            'success' => true,
            'data' => $expense->load('allocations'),
            'message' => 'Expense recorded and allocated successfully'
        ], 201);
    }

    public function approve($id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        
        if ($expense->allocations()->count() > 0) {
            return response()->json(['message' => 'Expense is already allocated'], 400);
        }

        $this->calculateAndSaveAllocations($expense);

        return response()->json([
            'success' => true,
            'message' => 'Expense approved and allocated successfully',
            'data' => $expense->load('allocations')
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $expense->allocations()->delete(); // Delete associated allocations first
        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense rejected/deleted successfully'
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx',
        ]);

        $file = $request->file('file');
        
        // Simple CSV parsing
        $data = array_map('str_getcsv', file($file->getRealPath()));
        $header = array_shift($data); // Assume first row is header
        
        // Normalize header keys to lowercase
        $header = array_map('strtolower', $header);

        $count = 0;
        $errors = [];

        foreach ($data as $index => $row) {
            if (count($row) !== count($header)) continue;
            
            $row = array_combine($header, $row);
            
            try {
                // Logic to find property by address or ID
                $property = null;
                if (!empty($row['property_id'])) {
                    $property = Property::find($row['property_id']);
                } elseif (!empty($row['property_address'])) {
                    $property = Property::where('address', 'LIKE', '%' . $row['property_address'] . '%')->first();
                } elseif (!empty($row['property'])) {
                    $property = Property::where('address', 'LIKE', '%' . $row['property'] . '%')->first();
                }

                if (!$property) {
                    throw new \Exception("Property not found");
                }

                $expense = Expense::create([
                    'property_id' => $property->id,
                    'amount' => (float) str_replace(['$', ','], '', $row['amount']),
                    'date' => !empty($row['date']) ? Carbon::parse($row['date']) : now(),
                    'description' => $row['description'] ?? 'Imported Expense',
                    'category' => $row['category'] ?? 'Uncategorized',
                    'allocation_method' => 'ownership_percentage',
                    'created_by' => $request->user()->id,
                ]);

                $this->calculateAndSaveAllocations($expense);
                $count++;

            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Imported $count expenses. " . (count($errors) > 0 ? "Errors: " . implode(', ', $errors) : ""),
            'imported_count' => $count,
            'errors' => $errors
        ]);
    }

    private function calculateAndSaveAllocations(Expense $expense)
    {
        $property = Property::findOrFail($expense->property_id);
        $totalShares = $property->total_shares > 0 ? $property->total_shares : 1;
        
        $investments = \App\Models\Investment::where('property_id', $property->id)
            ->where('status', 'active')
            ->get();
            
        $allocatedShares = 0;

        foreach ($investments as $investment) {
            $percentage = ($investment->shares / $totalShares);
            $allocationAmount = $expense->amount * $percentage;
            
            ExpenseAllocation::create([
                'expense_id' => $expense->id,
                'user_id' => $investment->user_id,
                'amount' => round($allocationAmount, 2),
                'percentage' => round($percentage * 100, 4),
            ]);
            
            $allocatedShares += $investment->shares;
        }

        $remainingShares = $property->total_shares - $allocatedShares;
        if ($remainingShares > 0) {
            $percentage = ($remainingShares / $totalShares);
            $allocationAmount = $expense->amount * $percentage;
            
            ExpenseAllocation::create([
                'expense_id' => $expense->id,
                'user_id' => $expense->created_by, // Assign to Admin/Creator
                'amount' => round($allocationAmount, 2),
                'percentage' => round($percentage * 100, 4),
            ]);
        }
    }
}
