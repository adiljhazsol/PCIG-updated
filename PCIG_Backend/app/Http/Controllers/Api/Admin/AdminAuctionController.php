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
        $totalAuctions = Auction::count();
        $upcomingAuctions = Auction::where('status', 'scheduled')
            ->where('auction_date', '>', now())
            ->count();
        $completedAuctions = Auction::where('status', 'completed')->count();
        $pendingResults = Auction::where('status', 'scheduled')
            ->where('auction_date', '<=', now())
            ->count();

        // Tabs counts
        $scheduledCount = Auction::where('status', 'scheduled')
            ->where('auction_date', '>', now())
            ->count();
        $pendingResultsCount = Auction::where('status', 'scheduled')
            ->where('auction_date', '<=', now())
            ->count();
        $completedCount = Auction::where('status', 'completed')->count();
        $allCount = Auction::count();

        // Queue Query
        $query = Auction::with('property');

        // 1. Tab Filter
        $tab = $request->get('tab', 'auction-ready');
        if ($tab === 'auction-ready') {
            $query->where('status', 'scheduled')
                  ->where('auction_date', '>', now());
        } elseif ($tab === 'pending-results') {
            $query->where('status', 'scheduled')
                  ->where('auction_date', '<=', now());
        } elseif ($tab === 'completed') {
            $query->where('status', 'completed');
        } 
        // 'all' -> no specific status filter

        // 2. Search Filter
        if ($search = $request->get('search')) {
            $query->whereHas('property', function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('zip_code', 'like', "%{$search}%")
                  ->orWhere('parcel_id', 'like', "%{$search}%");
            });
        }

        // 3. Status Filter (Dropdown)
        if ($status = $request->get('status')) {
            if ($status !== 'All Statuses' && $status !== 'Status') {
                 $query->where('status', strtolower($status));
            }
        }

        // 4. County Filter
        if ($county = $request->get('county')) {
             if ($county !== 'All Counties' && $county !== 'County') {
                $query->whereHas('property', function($q) use ($county) {
                    $q->where('county', $county);
                });
             }
        }

        // 5. Date Range Filter
        if ($range = $request->get('date_range')) {
            if ($range === 'Next 7 Days') {
                $query->whereBetween('auction_date', [now(), now()->addDays(7)]);
            } elseif ($range === 'This Month') {
                $query->whereMonth('auction_date', now()->month)
                      ->whereYear('auction_date', now()->year);
            } elseif ($range === 'Next Month') {
                $query->whereMonth('auction_date', now()->addMonth()->month)
                      ->whereYear('auction_date', now()->addMonth()->year);
            }
        }

        $rows = $query->latest('auction_date')
            ->limit(50)
            ->get()
            ->map(function ($auction) {
                $prop = $auction->property;
                return [
                    'id' => $prop->id,
                    'auction_id' => $auction->id,
                    'pcigId' => 'PCIG-'.$prop->id,
                    'address' => $prop->address,
                    'city' => $prop->city,
                    'state' => $prop->state,
                    'zip' => $prop->zip,
                    'auctionDate' => $auction->auction_date ? $auction->auction_date->format('Y-m-d') : 'Not Scheduled',
                    'auctionTime' => $auction->auction_date ? $auction->auction_date->format('h:i A') : 'TBD',
                    'startBid' => '$' . number_format($auction->starting_bid ?? 0),
                    'soldAmount' => $auction->winning_bid ? '$' . number_format($auction->winning_bid) : null,
                    'surplus' => $auction->winning_bid ? '+$' . number_format($auction->winning_bid - ($auction->starting_bid ?? 0)) : null,
                    'maxBid' => null, 
                    'status' => ucfirst($auction->status),
                    'statusColor' => $this->getStatusColor($auction->status),
                    'location' => ($prop->county ?? 'Unknown') . ' County Steps',
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
                    ['key' => 'pending-results', 'label' => 'Pending Results', 'count' => $pendingResultsCount],
                    ['key' => 'completed', 'label' => 'Completed', 'count' => $completedCount],
                    ['key' => 'all', 'label' => 'All Properties', 'count' => $allCount]
                ],
                'filters' => [
                    ['label' => 'Status', 'options' => ['All Statuses', 'Scheduled', 'Completed', 'Cancelled']],
                    ['label' => 'County', 'options' => ['All Counties', 'Fulton', 'Dekalb', 'Gwinnett', 'Cobb']],
                    ['label' => 'Date Range', 'options' => ['Any Date', 'Next 7 Days', 'This Month', 'Next Month']]
                ],
                'queue' => [
                    'title' => 'Auction Queue',
                    'subtitle' => 'Properties scheduled for auction',
                    'tableHeaders' => ['', 'Property', 'Date/Time', 'Status', 'Bidding', 'Location', 'Prep', 'Actions'],
                    'rows' => $rows
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

    public function availableProperties(): JsonResponse
    {
        $properties = Property::select('id', 'address', 'city', 'state', 'zip_code', 'county')
            ->orderBy('address')
            ->get();
            
        return response()->json($properties);
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

    public function export(Request $request)
    {
        $fileName = 'auction_calendar_' . date('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Property Address', 'City', 'State', 'Zip', 'County',
            'Auction Date', 'Starting Bid', 'Winning Bid', 'Status', 'Notes'
        ];

        $callback = function() use ($columns, $request) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $query = Auction::with('property');

            // 1. Tab Filter
            $tab = $request->get('tab', 'auction-ready');
            if ($tab === 'auction-ready') {
                $query->where('status', 'scheduled')
                      ->where('auction_date', '>', now());
            } elseif ($tab === 'pending-results') {
                $query->where('status', 'scheduled')
                      ->where('auction_date', '<=', now());
            } elseif ($tab === 'completed') {
                $query->where('status', 'completed');
            } 

            // 2. Search Filter
            if ($search = $request->get('search')) {
                $query->whereHas('property', function($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%")
                      ->orWhere('zip_code', 'like', "%{$search}%")
                      ->orWhere('parcel_id', 'like', "%{$search}%");
                });
            }

            // 3. Status Filter (Dropdown)
            if ($status = $request->get('status')) {
                if ($status !== 'All Statuses' && $status !== 'Status') {
                     $query->where('status', strtolower($status));
                }
            }

            // 4. County Filter
            if ($county = $request->get('county')) {
                 if ($county !== 'All Counties' && $county !== 'County') {
                    $query->whereHas('property', function($q) use ($county) {
                        $q->where('county', $county);
                    });
                 }
            }

            // 5. Date Range Filter
            if ($range = $request->get('date_range')) {
                if ($range === 'Next 7 Days') {
                    $query->whereBetween('auction_date', [now(), now()->addDays(7)]);
                } elseif ($range === 'This Month') {
                    $query->whereMonth('auction_date', now()->month)
                          ->whereYear('auction_date', now()->year);
                } elseif ($range === 'Next Month') {
                    $query->whereMonth('auction_date', now()->addMonth()->month)
                          ->whereYear('auction_date', now()->addMonth()->year);
                }
            }

            $query->chunk(100, function($auctions) use ($file) {
                foreach ($auctions as $auction) {
                    $row = [
                        $auction->property->address ?? '',
                        $auction->property->city ?? '',
                        $auction->property->state ?? '',
                        $auction->property->zip_code ?? '',
                        $auction->property->county ?? '',
                        $auction->auction_date ? $auction->auction_date->format('Y-m-d H:i:s') : '',
                        $auction->starting_bid,
                        $auction->winning_bid,
                        $auction->status,
                        $auction->notes
                    ];
                    fputcsv($file, $row);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        
        // Remove header row
        $header = array_shift($data);
        
        $importedCount = 0;
        $errors = [];

        foreach ($data as $index => $row) {
            // Basic validation of row length
            if (count($row) < 1) continue;

            // Assuming format: Property Address, City, State, Zip, County, Auction Date, Starting Bid, Winning Bid, Status, Notes
            $address = $row[0] ?? null;
            if (!$address) continue;

            // Find property
            $property = Property::where('address', 'like', $address . '%')->first();
            
            if (!$property) {
                $errors[] = "Row " . ($index + 2) . ": Property not found for address '$address'";
                continue;
            }

            $auctionDateStr = $row[5] ?? null;
            $startingBid = $row[6] ?? 0;
            $winningBid = $row[7] ?? null;
            $statusStr = strtolower($row[8] ?? 'scheduled');
            $notes = $row[9] ?? null;

            $auctionDate = null;
            if ($auctionDateStr) {
                try {
                    $auctionDate = \Carbon\Carbon::parse($auctionDateStr);
                } catch (\Exception $e) {
                    // invalid date
                }
            }

            // Find existing auction or create new
            // Logic: if there is an active auction (scheduled) or we are importing results for a recently past auction
            $auction = Auction::where('property_id', $property->id)
                ->latest()
                ->first();
            
            if ($auction) {
                $auction->update([
                    'auction_date' => $auctionDate ? $auctionDate : $auction->auction_date,
                    'starting_bid' => is_numeric($startingBid) ? $startingBid : $auction->starting_bid,
                    'winning_bid' => is_numeric($winningBid) ? $winningBid : $auction->winning_bid,
                    'status' => $statusStr ?: $auction->status,
                    'notes' => $notes ?: $auction->notes,
                ]);
            } else {
                Auction::create([
                    'property_id' => $property->id,
                    'auction_date' => $auctionDate ? $auctionDate : now(),
                    'starting_bid' => is_numeric($startingBid) ? $startingBid : 0,
                    'winning_bid' => is_numeric($winningBid) ? $winningBid : null,
                    'status' => $statusStr ?: 'scheduled',
                    'notes' => $notes,
                ]);
            }
            $importedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Processed $importedCount auctions.",
            'errors' => $errors
        ]);
    }
}
