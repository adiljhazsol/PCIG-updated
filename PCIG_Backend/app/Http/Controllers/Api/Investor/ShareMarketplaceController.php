<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Models\ShareListing;
use App\Models\ShareTransaction;
use App\Models\Investment;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShareMarketplaceController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Total Volume (Global sold listings)
        $totalVolume = ShareListing::where('status', 'sold')->sum('total_price');

        // Active Listings Count
        $activeListings = ShareListing::where('status', 'active')->count();

        // Avg Share Price (Active listings)
        $avgPrice = ShareListing::where('status', 'active')->avg('price_per_share') ?? 0;

        // My Trades (Last 30 days)
        $myTrades = ShareTransaction::where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
            })
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_volume' => $totalVolume,
                'active_listings' => $activeListings,
                'avg_price' => round($avgPrice, 2),
                'my_trades' => $myTrades,
            ],
        ]);
    }

    public function available(Request $request): JsonResponse
    {
        $query = ShareListing::where('status', 'active')
            ->with(['seller', 'property']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->filled('min_price')) {
            $query->where('price_per_share', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price_per_share', '<=', $request->max_price);
        }

        if ($request->filled('min_shares')) {
            $query->where('shares', '>=', $request->min_shares);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->whereHas('property', function ($q) use ($searchTerm) {
                $q->where('address', 'like', "%{$searchTerm}%")
                  ->orWhere('city', 'like', "%{$searchTerm}%")
                  ->orWhere('zip_code', 'like', "%{$searchTerm}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $listings->items(),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'shares' => 'required|integer|min:1',
            'price_per_share' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:500',
        ]);

        // Verify seller owns shares
        $investment = Investment::where('user_id', $user->id)
            ->where('property_id', $request->property_id)
            ->where('status', 'active')
            ->first();

        if (!$investment || $investment->shares < $request->shares) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have enough shares to list',
            ], 400);
        }

        $totalPrice = $request->shares * $request->price_per_share;

        $listing = ShareListing::create([
            'seller_id' => $user->id,
            'property_id' => $request->property_id,
            'shares' => $request->shares,
            'price_per_share' => $request->price_per_share,
            'total_price' => $totalPrice,
            'status' => 'active',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shares listed successfully',
            'data' => $listing->load(['property', 'seller']),
        ], 201);
    }

    public function buy(Request $request, $id): JsonResponse
    {
        $buyer = $request->user();
        $listing = ShareListing::with('property')->where('status', 'active')->findOrFail($id);

        if ($listing->seller_id === $buyer->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot buy your own listing',
            ], 400);
        }

        $request->validate([
            'shares' => 'required|integer|min:1|max:' . $listing->shares,
        ]);

        $sharesToBuy = $request->shares;
        $totalPrice = $sharesToBuy * $listing->price_per_share;

        DB::beginTransaction();
        try {
            // Check seller's investment
            $sellerInvestment = Investment::where('user_id', $listing->seller_id)
                ->where('property_id', $listing->property_id)
                ->where('status', 'active')
                ->first();

            if (!$sellerInvestment || $sellerInvestment->shares < $sharesToBuy) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Seller no longer has sufficient shares',
                ], 400);
            }

            // Create share transaction
            $shareTransaction = ShareTransaction::create([
                'listing_id' => $listing->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $listing->seller_id,
                'shares' => $sharesToBuy,
                'total_price' => $totalPrice,
                'transaction_date' => now(),
                'status' => 'pending',
            ]);

            // Update seller's investment
            $sellerInvestment->shares -= $sharesToBuy;
            if ($sellerInvestment->shares <= 0) {
                $sellerInvestment->update(['status' => 'sold']);
            } else {
                $sellerInvestment->save();
            }

            // Create or update buyer's investment
            $buyerInvestment = Investment::firstOrCreate(
                [
                    'user_id' => $buyer->id,
                    'property_id' => $listing->property_id,
                    'status' => 'active',
                ],
                [
                    'investment_id' => 'INV-' . Str::random(8),
                    'name' => $listing->property->address ?? 'Investment Property',
                    'type' => 'Equity',
                    'details' => 'Marketplace Purchase',
                    'shares' => 0,
                    'amount' => 0,
                    'current_value' => 0,
                    'price_per_share' => $listing->price_per_share,
                    'purchase_date' => now(),
                ]
            );

            $buyerInvestment->shares += $sharesToBuy;
            $buyerInvestment->amount += $totalPrice;
            $buyerInvestment->current_value += $totalPrice;
            // Update weighted average price per share
            if ($buyerInvestment->shares > 0) {
                 $buyerInvestment->price_per_share = $buyerInvestment->amount / $buyerInvestment->shares;
            }
            $buyerInvestment->save();

            // Update listing
            $listing->shares -= $sharesToBuy;
            $listing->total_price = $listing->shares * $listing->price_per_share;
            
            if ($listing->shares <= 0) {
                $listing->status = 'sold';
            }
            $listing->save();

            // Create transaction records
            Transaction::create([
                'user_id' => $buyer->id,
                'type' => 'purchase',
                'date' => now(),
                'amount' => $totalPrice,
                'property_id' => $listing->property_id,
                'description' => "Purchased {$sharesToBuy} shares from marketplace",
                'status' => 'completed',
                'reference_number' => 'SHARE-BUY-' . str_pad($shareTransaction->id, 8, '0', STR_PAD_LEFT),
            ]);

            Transaction::create([
                'user_id' => $listing->seller_id,
                'type' => 'sale',
                'date' => now(),
                'amount' => $totalPrice,
                'property_id' => $listing->property_id,
                'description' => "Sold {$sharesToBuy} shares via marketplace",
                'status' => 'completed',
                'reference_number' => 'SHARE-SELL-' . str_pad($shareTransaction->id, 8, '0', STR_PAD_LEFT),
            ]);

            // Complete share transaction
            $shareTransaction->update(['status' => 'completed']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Shares purchased successfully',
                'data' => $shareTransaction->load(['listing', 'buyer', 'seller']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Purchase failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function cancel(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $listing = ShareListing::where('seller_id', $user->id)
            ->where('status', 'active')
            ->findOrFail($id);

        $listing->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Listing cancelled successfully',
        ]);
    }

    public function myListings(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = ShareListing::where('seller_id', $user->id)
            ->with(['property']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $listings->items(),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    public function portfolio(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Investment::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('shares', '>', 0)
            ->with(['property']);

        $perPage = $request->get('per_page', 20);
        $investments = $query->paginate($perPage);

        // Map investments to listing-like structure
        $data = $investments->getCollection()->map(function ($investment) {
            return [
                'id' => 'INV-' . $investment->id,
                'rawId' => $investment->property_id, // Use property ID for linking/selling
                'property' => $investment->property,
                'property_id' => $investment->property_id,
                'shares' => $investment->shares,
                'price_per_share' => $investment->price_per_share, // Purchase price or current value?
                'total_price' => $investment->shares * $investment->price_per_share,
                'status' => 'owned',
                'created_at' => $investment->created_at,
            ];
        });

        $investments->setCollection($data);

        return response()->json([
            'success' => true,
            'data' => $investments->items(),
            'meta' => [
                'current_page' => $investments->currentPage(),
                'last_page' => $investments->lastPage(),
                'per_page' => $investments->perPage(),
                'total' => $investments->total(),
            ],
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $type = $request->get('type', 'history'); // history or orders

        $query = ShareTransaction::with(['listing.property', 'buyer', 'seller'])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)
                  ->orWhere('seller_id', $user->id);
            });

        if ($type === 'orders') {
            $query->where('status', 'pending');
        } else {
            $query->whereIn('status', ['completed', 'cancelled', 'rejected']);
        }

        $perPage = $request->get('per_page', 20);
        $transactions = $query->latest()->paginate($perPage);

        // Map to listing-like structure for the frontend grid
        $data = $transactions->getCollection()->map(function ($tx) use ($user) {
            $isBuyer = $tx->buyer_id === $user->id;
            $otherParty = $isBuyer ? $tx->seller : $tx->buyer;
            
            return [
                'id' => $tx->id,
                'created_at' => $tx->created_at,
                'status' => $tx->status,
                'shares' => $tx->shares,
                'price_per_share' => $tx->total_price / ($tx->shares ?: 1),
                'total_price' => $tx->total_price,
                'property' => $tx->listing->property,
                'seller' => $otherParty, // Shows the other party involved
                'seller_id' => $otherParty->id ?? null,
            ];
        });

        $transactions->setCollection($data);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }
}

