<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShareListing;
use App\Models\User;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminShareController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats for dashboard
        $totalListings = ShareListing::count();
        $activeListings = ShareListing::where('status', 'active')->count();
        $soldListings = ShareListing::where('status', 'sold')->count();
        $totalVolume = ShareListing::where('status', 'sold')->sum('total_price');

        // Recent listings for table
        $query = ShareListing::with(['seller', 'property']);

        if ($request->has('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('property', function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            })->orWhereHas('seller', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $listings = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'stats' => [
                'total_listings' => $totalListings,
                'active_listings' => $activeListings,
                'sold_listings' => $soldListings,
                'total_volume' => $totalVolume,
            ],
            'listings' => $listings
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'seller_id' => 'required|exists:users,id',
            'property_id' => 'required|exists:properties,id',
            'shares' => 'required|integer|min:1',
            'price_per_share' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,pending,sold,cancelled'
        ]);

        $shares = $validated['shares'];
        $pricePerShare = $validated['price_per_share'];
        $totalPrice = $shares * $pricePerShare;

        $listing = ShareListing::create([
            'seller_id' => $validated['seller_id'],
            'property_id' => $validated['property_id'],
            'shares' => $shares,
            'price_per_share' => $pricePerShare,
            'total_price' => $totalPrice,
            'status' => $request->input('status', 'active'),
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Share listing created successfully',
            'data' => $listing
        ], 201);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $search = $request->input('search');

        // Default: return a dropdown-friendly list of investors when no search term provided
        if (empty($search)) {
            $users = User::where('role_type', 'investor')
                ->orderBy('name')
                ->take(50)
                ->get(['id', 'name', 'email']);
        } else {
            $users = User::where('role_type', 'investor')
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orderBy('name')
                ->take(20)
                ->get(['id', 'name', 'email']);
        }

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
