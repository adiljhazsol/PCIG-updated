<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CreateDistributionRequest;
use App\Models\Distribution;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDistributionController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $query = Distribution::with(['user', 'property', 'fund', 'investment', 'fundInvestment']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('distribution_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('distribution_date', '<=', $request->date_to);
        }

        $sortBy = $request->get('sort_by', 'distribution_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $distributions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $distributions->items(),
            'meta' => [
                'current_page' => $distributions->currentPage(),
                'last_page' => $distributions->lastPage(),
                'per_page' => $distributions->perPage(),
                'total' => $distributions->total(),
            ],
        ]);
    }

    public function store(CreateDistributionRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $referenceNumber = 'DIST-' . str_pad(Distribution::max('id') + 1, 8, '0', STR_PAD_LEFT);

            $distribution = Distribution::create([
                'user_id' => $request->user_id,
                'investment_id' => $request->investment_id,
                'fund_investment_id' => $request->fund_investment_id,
                'property_id' => $request->property_id,
                'fund_id' => $request->fund_id,
                'amount' => $request->amount,
                'distribution_date' => $request->distribution_date,
                'status' => 'pending',
                'description' => $request->description,
                'reference_number' => $referenceNumber,
            ]);

            // Create transaction record
            Transaction::create([
                'user_id' => $request->user_id,
                'type' => 'distribution',
                'amount' => $request->amount,
                'property_id' => $request->property_id,
                'fund_id' => $request->fund_id,
                'description' => $request->description ?? 'Distribution payment',
                'status' => 'pending',
                'reference_number' => $referenceNumber,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Distribution created successfully',
                'data' => $distribution->load(['user', 'property', 'fund']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Distribution creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function process(Request $request, $id): JsonResponse
    {
        $distribution = Distribution::findOrFail($id);

        if ($distribution->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Distribution is not pending',
            ], 400);
        }

        $distribution->update(['status' => 'processed']);

        // Update related transaction
        Transaction::where('reference_number', $distribution->reference_number)
            ->update(['status' => 'completed']);

        return response()->json([
            'success' => true,
            'message' => 'Distribution processed successfully',
            'data' => $distribution,
        ]);
    }
}
