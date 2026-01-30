<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Auction;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuctionController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $totalAuctions = Property::where('workflow_stage', 'auction')->count();
        $upcomingAuctions = Auction::where('status', 'scheduled')
            ->where('auction_date', '>', now())
            ->count();
        $completedAuctions = Auction::where('status', 'completed')->count();
        $pendingResults = Auction::where('status', 'scheduled')
            ->where('auction_date', '<=', now())
            ->count();

        // Tabs counts
        $scheduledCount = Auction::where('status', 'scheduled')->count();
        $completedCount = Auction::where('status', 'completed')->count();
        $allCount = Property::where('workflow_stage', 'auction')->count();

        // Queue (Properties)
        $properties = Property::where('workflow_stage', 'auction')
            ->with(['auction'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($prop) {
                $auction = $prop->auction;
                return [
                    'id' => $prop->id,
                    'pcigId' => 'PCIG-'.$prop->id,
                    'address' => $prop->address,
                    'city' => $prop->city,
                    'state' => $prop->state,
                    'zip' => $prop->zip,
                    'auctionDate' => $auction ? $auction->auction_date : 'Not Scheduled',
                    'auctionTime' => '10:00 AM', // Mock
                    'startBid' => '$' . number_format($auction ? $auction->starting_bid : 0),
                    'soldAmount' => $auction && $auction->winning_bid ? '$' . number_format($auction->winning_bid) : null,
                    'surplus' => $auction && $auction->winning_bid ? '+$' . number_format($auction->winning_bid - ($auction->starting_bid ?? 0)) : null,
                    'maxBid' => '$' . number_format(($auction ? $auction->starting_bid : 0) * 1.5), // Mock
                    'status' => $auction ? ucfirst($auction->status) : 'New',
                    'statusColor' => $this->getStatusColor($auction ? $auction->status : 'new'),
                    'location' => $prop->county . ' County Steps',
                    'prepStatus' => 'Ready', 
                    'prepStatusColor' => 'green',
                ];
            });

        return response()->json([
            'auction' => [
                'header' => [
                    'title' => 'Sheriff Sale Auction',
                    'subtitle' => 'Manage upcoming auctions, bidding results, and property acquisition.'
                ],
                'actionButtons' => [
                    'createAuction' => ['label' => 'Schedule Auction', 'icon' => 'Plus', 'action' => 'schedule'],
                    'importResults' => ['label' => 'Import Results', 'icon' => 'Upload', 'action' => 'import'],
                    'exportSheets' => ['label' => 'Export Calendar', 'icon' => 'Download', 'action' => 'export']
                ],
                'stats' => [
                    ['label' => 'Total Auctions', 'value' => $totalAuctions, 'subtext' => 'Active properties', 'icon' => 'FileText', 'color' => '#3B82F6'],
                    ['label' => 'Upcoming', 'value' => $upcomingAuctions, 'subtext' => 'Next 7 days', 'icon' => 'Calendar', 'color' => '#F59E0B'],
                    ['label' => 'Pending Results', 'value' => $pendingResults, 'subtext' => 'Awaiting confirmation', 'icon' => 'AlertCircle', 'color' => '#EF4444'],
                    ['label' => 'Completed', 'value' => $completedAuctions, 'subtext' => 'This month', 'icon' => 'CheckCircle2', 'color' => '#10B981']
                ],
                'tabs' => [
                    ['key' => 'auction-ready', 'label' => 'Auction Ready', 'count' => $scheduledCount],
                    ['key' => 'pending-results', 'label' => 'Pending Results', 'count' => $pendingResults],
                    ['key' => 'completed', 'label' => 'Completed', 'count' => $completedCount],
                    ['key' => 'all', 'label' => 'All Properties', 'count' => $allCount]
                ],
                'filters' => [
                    ['label' => 'Status', 'options' => ['Scheduled', 'Completed', 'Cancelled']],
                    ['label' => 'County', 'options' => ['All Counties', 'Fulton', 'Dekalb', 'Gwinnett']],
                    ['label' => 'Date Range', 'options' => ['Next 7 Days', 'This Month', 'Next Month']]
                ],
                'queue' => [
                    'title' => 'Auction Queue',
                    'subtitle' => 'Properties scheduled for auction',
                    'tableHeaders' => ['', 'Property', 'Date/Time', 'Status', 'Bidding', 'Location', 'Prep', 'Actions'],
                    'rows' => $properties
                ]
            ]
        ]);
    }

    private function getStatusColor($status)
    {
        $colors = [
            'scheduled' => 'blue',
            'completed' => 'green',
            'cancelled' => 'gray',
            'failed' => 'orange',
            'new' => 'gray'
        ];
        return $colors[$status] ?? 'gray';
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'auction')
            ->with(['primaryImage', 'auction']);

        if ($request->has('status')) {
            $query->whereHas('auction', function($q) use ($request) {
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

    public function schedule(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'auction_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'starting_bid' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::findOrFail($request->property_id);
        
        if ($property->workflow_stage !== 'auction') {
            $property->update(['workflow_stage' => 'auction']);
        }

        // Check if active auction exists? Maybe not strictly necessary.
        
        $auction = Auction::create([
            'property_id' => $property->id,
            'auction_date' => $request->auction_date,
            'location' => $request->location,
            'starting_bid' => $request->starting_bid,
            'status' => 'scheduled',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Auction scheduled successfully',
            'data' => $auction->load('property'),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'auction_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'starting_bid' => 'nullable|numeric|min:0',
            'winning_bid' => 'nullable|numeric|min:0',
            'winner_info' => 'nullable|string',
            'status' => 'nullable|in:scheduled,completed,cancelled,failed',
            'notes' => 'nullable|string|max:1000',
        ]);

        $auction = Auction::findOrFail($id);
        $auction->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Auction details updated successfully',
            'data' => $auction->load('property'),
        ]);
    }

    public function complete(Request $request, $id): JsonResponse
    {
        $request->validate([
            'winning_bid' => 'nullable|numeric|min:0',
            'winner_info' => 'nullable|string',
            'status' => 'required|in:completed,failed,cancelled',
        ]);

        $auction = Auction::findOrFail($id);
        
        $auction->update([
            'winning_bid' => $request->winning_bid ?? $auction->winning_bid,
            'winner_info' => $request->winner_info ?? $auction->winner_info,
            'status' => $request->status,
        ]);

        // Workflow transition
        if ($request->status === 'completed') {
            // Sold
            $auction->property->update([
                'workflow_stage' => 'completed',
                'status' => 'sold',
            ]);
        } elseif ($request->status === 'failed') {
            // Failed -> REO Disposition
            $auction->property->update([
                'workflow_stage' => 'reo_disposition',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Auction completed successfully',
            'data' => $auction->load('property'),
        ]);
    }
}
