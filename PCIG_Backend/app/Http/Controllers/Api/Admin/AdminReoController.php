<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\ReoProperty;
use App\Models\ReoOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminReoController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Summary Stats
        $totalInventory = Property::where('workflow_stage', 'reo_disposition')->count();
        $activeListings = ReoProperty::where('status', 'marketing')->count();
        $pendingOffers = ReoOffer::where('status', 'pending')->count();
        $soldYTD = ReoProperty::where('status', 'sold')
            ->whereYear('updated_at', date('Y'))
            ->count();

        // Properties
        $properties = Property::where('workflow_stage', 'reo_disposition')
            ->with(['primaryImage', 'reoProperty', 'reoProperty.offers'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($prop) {
                $status = $prop->reoProperty->status ?? 'new';
                $statusColors = [
                    'marketing' => '#3B82F6',
                    'offer_accepted' => '#F59E0B',
                    'sold' => '#10B981',
                    'leased' => '#8B5CF6',
                    'new' => '#64748B',
                ];
                $statusColor = $statusColors[$status] ?? '#64748B';

                return [
                    'id' => $prop->id,
                    'parcelId' => $prop->parcel_id ?? 'Unknown',
                    'pcigId' => 'PROP-' . $prop->id,
                    'address' => $prop->address,
                    'city' => $prop->city,
                    'state' => $prop->state,
                    'zip' => $prop->zip,
                    'status' => $status,
                    'statusColor' => $statusColor,
                    'type' => $prop->reoProperty->disposition_strategy ?? 'TBD',
                    'strategy' => $prop->reoProperty->disposition_strategy ?? 'TBD',
                    'price' => '$' . number_format($prop->reoProperty->listed_price ?? 0),
                    'listPrice' => $prop->reoProperty->listed_price ?? 0,
                    'currentOffer' => $prop->reoProperty && $prop->reoProperty->offers->count() > 0 ? $prop->reoProperty->offers->max('offer_amount') : 0,
                    'daysOnMarket' => $prop->reoProperty && $prop->reoProperty->listing_date 
                        ? Carbon::parse($prop->reoProperty->listing_date)->diffInDays(now()) 
                        : 0,
                    'image' => $prop->primaryImage->file_path ?? null,
                    'listing_agent' => $prop->reoProperty->listing_agent ?? 'Unassigned',
                    'listing_date' => $prop->reoProperty->listing_date ?? null,
                    'acquisition_date' => $prop->reoProperty->acquisition_date ?? null,
                    'notes' => $prop->reoProperty->notes ?? '',
                ];
            });

        return response()->json([
            'reoDisposition' => [
                'header' => [
                    'title' => 'REO Disposition',
                    'subtitle' => 'Manage owned properties, sales, and leasing'
                ],
                'actionButtons' => [
                    'createListing' => ['label' => 'List Property', 'icon' => 'Plus', 'action' => 'list'],
                    'export' => ['label' => 'Export Report', 'icon' => 'Download', 'action' => 'export']
                ],
                'summaryCards' => [
                    ['label' => 'Total Inventory', 'value' => $totalInventory, 'subtext' => '+2 this week'],
                    ['label' => 'Active Listings', 'value' => $activeListings, 'subtext' => 'Avg 45 days on market'],
                    ['label' => 'Pending Offers', 'value' => $pendingOffers, 'subtext' => 'Review needed'],
                    ['label' => 'Sold YTD', 'value' => $soldYTD, 'subtext' => '$2.4M Volume']
                ],
                'tabs' => [
                    ['key' => 'for-sale', 'label' => 'For Sale'],
                    ['key' => 'for-lease', 'label' => 'For Lease'],
                    ['key' => 'all', 'label' => 'All Properties']
                ],
                'searchPlaceholder' => [
                    'mobile' => 'Search properties...',
                    'desktop' => 'Search properties, agents, or buyers...'
                ],
                'filters' => [
                    'status' => ['label' => 'Status', 'options' => ['All', 'Marketing', 'Offer Accepted', 'Sold', 'Leased']],
                    'type' => ['label' => 'Strategy', 'options' => ['All', 'Sale', 'Lease', 'Hold']],
                    'moreFilters' => 'More Filters'
                ],
                'tableHeaders' => [
                    'Property', 'Status', 'Strategy', 'List Price', 'Current Offer', 'Days on Market', 'Actions'
                ],
                'properties' => $properties,
                'selectedProperty' => null
            ]
        ]);
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'reo_disposition')
            ->with(['primaryImage', 'reoProperty', 'reoProperty.offers']);

        if ($request->has('status')) {
            $query->whereHas('reoProperty', function($q) use ($request) {
                $q->where('status', $request->status);
            });
        }

        $perPage = $request->get('per_page', 20);
        $properties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PropertyResource::collection($properties->items()),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'disposition_strategy' => 'nullable|in:sale,lease,hold',
            'listed_price' => 'nullable|numeric|min:0',
            'listing_agent' => 'nullable|string|max:255',
            'listing_date' => 'nullable|date',
            'status' => 'nullable|in:marketing,offer_accepted,sold,leased',
            'notes' => 'nullable|string|max:1000',
        ]);

        $reoProperty = ReoProperty::findOrFail($id);
        $reoProperty->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'REO property updated successfully',
            'data' => $reoProperty->load(['property', 'offers']),
        ]);
    }

    public function listForSale(Request $request, $id): JsonResponse
    {
        $request->validate([
            'listed_price' => 'required|numeric|min:0',
            'listing_agent' => 'nullable|string|max:255',
            'listing_date' => 'required|date',
        ]);

        $property = Property::findOrFail($id);
        
        if ($property->workflow_stage !== 'reo_disposition') {
            $property->update(['workflow_stage' => 'reo_disposition']);
        }

        // Create or update ReoProperty record
        $reoProperty = ReoProperty::updateOrCreate(
            ['property_id' => $property->id],
            [
                'listed_price' => $request->listed_price,
                'listing_agent' => $request->listing_agent,
                'listing_date' => $request->listing_date,
                'status' => 'marketing',
                'disposition_strategy' => 'sale',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Property listed for sale successfully',
            'data' => $reoProperty->load(['property', 'offers']),
        ]);
    }

    public function addOffer(Request $request, $id): JsonResponse
    {
        $request->validate([
            'offer_amount' => 'required|numeric|min:0',
            'buyer_info' => 'required|string|max:255',
            'offer_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $reoProperty = ReoProperty::findOrFail($id);

        $offer = $reoProperty->offers()->create([
            'offer_amount' => $request->offer_amount,
            'buyer_info' => $request->buyer_info,
            'offer_date' => $request->offer_date,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Offer added successfully',
            'data' => $offer,
        ], 201);
    }

    public function updateOffer(Request $request, $offerId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,accepted,rejected,counter',
            'notes' => 'nullable|string|max:1000',
        ]);

        $offer = ReoOffer::findOrFail($offerId);
        $offer->update($request->all());

        if ($request->status === 'accepted') {
            // Update REO property status to offer_accepted
            $offer->reoProperty->update(['status' => 'offer_accepted']);
            
            // Reject other pending offers? Maybe not automatically, let admin decide.
        }

        return response()->json([
            'success' => true,
            'message' => 'Offer updated successfully',
            'data' => $offer,
        ]);
    }
}
