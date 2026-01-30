<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\SheriffSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSheriffController extends Controller
{
    public function dashboardData(): JsonResponse
    {
        // Calculate stats
        
        // "Pending Export" - Properties in 'sheriff' stage that have NOT been scheduled/exported yet
        $pendingExportCount = Property::where('workflow_stage', 'sheriff')
            ->whereDoesntHave('sheriffSale', function($q) {
                $q->whereIn('status', ['scheduled', 'completed']);
            })
            ->count();
        
        // "Scheduled Pickups" - Properties with active SheriffSale scheduled
        $scheduledCount = SheriffSale::where('status', 'scheduled')
            ->whereHas('property', function($q) {
                $q->where('workflow_stage', 'sheriff');
            })
            ->count();
        
        // "Exports this Month" - Properties that entered 'scheduled' status this month
        $completedCount = SheriffSale::whereIn('status', ['scheduled', 'completed'])
            ->whereMonth('updated_at', now()->month)
            ->whereYear('updated_at', now()->year)
            ->count();
        
        // "Pending Delivery" - Completed sales (delivered) but maybe waiting for something?
        // Or "Not delivered". Let's assume 'scheduled' items past their sale_date are "Pending Delivery" or similar?
        // For now, let's just count 'completed' items that are still in sheriff stage (which shouldn't happen if they move to REO).
        // Let's assume "Pending Delivery" means "Scheduled but date passed".
        $pendingDeliveryCount = SheriffSale::where('status', 'scheduled')
            ->where('sale_date', '<', now())
            ->count(); 
            
        // "Active Levies" - All properties currently in sheriff workflow
        $activeLeviesCount = Property::where('workflow_stage', 'sheriff')->count();

        // Queue / List (Initial preview)
        // We'll return an empty list here as the frontend fetches via /properties endpoint
        $queueRows = []; 

        $data = [
            'header' => [
                'title' => 'Sheriff Workflow',
                'subtitle' => 'Sheriff exports, levy tracking, and pickup scheduling'
            ],
            'actionButtons' => [
                'generateExport' => [
                    'label' => 'Generate Export File',
                    'icon' => 'Download',
                    'variant' => 'primary'
                ],
                'schedulePickup' => [
                    'label' => 'Schedule Pickup',
                    'icon' => 'Calendar',
                    'variant' => 'secondary'
                ]
            ],
            'statsCards' => [
                [
                    'label' => 'Pending Export',
                    'value' => (string)$pendingExportCount,
                    'subtext' => 'Ready for export',
                    'icon' => 'Cloud',
                    'color' => '#F59E0B'
                ],
                [
                    'label' => 'Scheduled Pickups',
                    'value' => (string)$scheduledCount,
                    'subtext' => 'Upcoming pickups',
                    'icon' => 'Calendar',
                    'color' => '#F97316'
                ],
                [
                    'label' => 'Pending Delivery',
                    'value' => (string)$pendingDeliveryCount,
                    'subtext' => 'Not delivered',
                    'icon' => 'Truck',
                    'color' => '#DC2626'
                ],
                [
                    'label' => 'Active Levies',
                    'value' => (string)$activeLeviesCount,
                    'subtext' => 'In progress',
                    'icon' => 'Gavel',
                    'color' => '#64748B'
                ],
                [
                    'label' => 'Exports this Month',
                    'value' => (string)$completedCount,
                    'subtext' => 'Files generated',
                    'icon' => 'FileText',
                    'color' => '#10B981'
                ]
            ],
            'tabs' => [
                ['label' => 'Export Queue', 'count' => $pendingExportCount],
                ['label' => 'Pickup Schedule', 'count' => $scheduledCount],
                ['label' => 'Levy Tracking', 'count' => $activeLeviesCount],
                ['label' => 'Export Logs']
            ],
            'filters' => [
                'searchPlaceholder' => 'Search by parcel ID, PCIG ID, sheriff file #...',
                'dropdowns' => [
                    [
                        'label' => 'Status',
                        'options' => ['All', 'Pending', 'Exported', 'Delivered']
                    ]
                ],
                'clearButton' => 'Clear Filters'
            ],
            'queue' => [
                'title' => 'Export Queue',
                'count' => $pendingExportCount . ' items',
                'tableHeaders' => ['', 'Parcel / PCIG', 'Property Address', 'Owner Name(s)', 'Sheriff File #', 'Tax Year', 'Amount Due', 'Export Status', 'Delivery Status', 'Actions'],
                'rows' => $queueRows
            ],
            'workflowIntegration' => [
                'messages' => [],
                'link' => 'View Notice Letter Queue'
            ]
        ];

        return response()->json(['sheriffWorkflow' => $data]);
    }

    public function properties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'sheriff')
            ->with(['primaryImage', 'sheriffSale']);

        // Tab Filtering
        $tab = $request->get('tab', 'Export Queue');
        
        if ($tab === 'Export Queue') {
            $query->whereDoesntHave('sheriffSale', function($q) {
                $q->whereIn('status', ['scheduled', 'completed']);
            });
        } elseif ($tab === 'Pickup Schedule') {
            $query->whereHas('sheriffSale', function($q) {
                $q->where('status', 'scheduled');
            });
        } elseif ($tab === 'Levy Tracking') {
            // All sheriff properties, no additional filter
        } elseif ($tab === 'Export Logs') {
            // For now, show all properties that have ever been scheduled/completed
            // even if they are still in sheriff stage (which they should be if 'scheduled')
            $query->whereHas('sheriffSale');
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('parcel_id', 'like', "%{$search}%")
                  ->orWhere('sheriff_file_number', 'like', "%{$search}%");
            });
        }

        // Filter by status (Dropdown)
        if ($request->has('status') && $request->status !== 'All') {
             if ($request->status === 'Exported') {
                 $query->whereHas('sheriffSale', function($q) {
                     $q->where('status', 'scheduled');
                 });
             } elseif ($request->status === 'Pending') {
                 $query->whereDoesntHave('sheriffSale');
             } elseif ($request->status === 'Delivered') {
                 $query->whereHas('sheriffSale', function($q) {
                     $q->where('status', 'completed');
                 });
             }
        }

        $perPage = $request->get('per_page', 20);
        $properties = $query->latest()->paginate($perPage);

        $data = $properties->getCollection()->map(function ($prop) {
            return $this->mapPropertyRow($prop);
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function generateExport(Request $request)
    {
        $ids = $request->input('ids', []);
        
        $query = Property::where('workflow_stage', 'sheriff')
            ->with(['sheriffSale']);

        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        }

        $properties = $query->get();

        $csvFileName = 'sheriff_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $csvFileName . '"',
        ];

        $callback = function () use ($properties) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Property ID', 'Parcel ID', 'Address', 'City', 'State', 'Zip', 
                'Owner', 'Sheriff File #', 'Tax Year', 'Amount Due', 'Status'
            ]);

            foreach ($properties as $prop) {
                fputcsv($file, [
                    $prop->id,
                    $prop->parcel_id,
                    $prop->address,
                    $prop->city,
                    $prop->state,
                    $prop->zip_code,
                    $prop->owner ?? 'Unknown',
                    $prop->sheriff_file_number ?? '',
                    $prop->tax_year ?? date('Y'),
                    $prop->purchase_price ?? 0, // Fallback for total_due
                    $prop->sheriffSale ? $prop->sheriffSale->status : 'Pending'
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    public function schedulePickup(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:properties,id',
            'date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $ids = $request->input('ids');
        $date = $request->input('date');
        $notes = $request->input('notes');

        $count = 0;
        foreach ($ids as $id) {
            $property = Property::findOrFail($id);
            
            // Create or update Sheriff Sale record
            $sheriffSale = SheriffSale::firstOrCreate(
                ['property_id' => $property->id],
                ['status' => 'scheduled'] // Default status
            );

            $sheriffSale->update([
                'status' => 'scheduled',
                'sale_date' => $date,
                'notes' => $notes ? ($sheriffSale->notes . "\n" . $notes) : $sheriffSale->notes
            ]);
            
            $count++;
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully scheduled pickup for {$count} properties.",
        ]);
    }

    private function mapPropertyRow($prop)
    {
        // Determine statuses based on real logic
        $exportStatus = ['label' => 'Pending', 'color' => 'warning'];
        if ($prop->sheriffSale && $prop->sheriffSale->status == 'scheduled') {
            $exportStatus = ['label' => 'Exported', 'color' => 'success'];
        }
        
        $deliveryStatus = ['label' => 'Pending', 'color' => 'neutral'];
        if ($prop->sheriffSale && $prop->sheriffSale->status == 'completed') {
            $deliveryStatus = ['label' => 'Delivered', 'color' => 'success'];
        }
        
        return [
            'id' => $prop->id,
            'parcelId' => $prop->parcel_id ?? 'Unknown',
            'pcigId' => 'PROP-' . $prop->id,
            'address' => $prop->address,
            'city' => $prop->city ?? 'Unknown',
            'owner' => $prop->owner ?? 'Unknown',
            'sheriffFile' => $prop->sheriff_file_number ?? 'Pending',
            'taxYear' => $prop->tax_year ?? date('Y'),
            'amount' => '$' . number_format($prop->purchase_price ?? 0, 2), // Using purchase_price as proxy
            'exportStatus' => $exportStatus,
            'deliveryStatus' => $deliveryStatus,
            'actionOverride' => null
        ];
    }


    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'sale_date' => 'nullable|date',
            'status' => 'nullable|in:scheduled,completed,cancelled,postponed',
            'winning_bid' => 'nullable|numeric|min:0',
            'winner_info' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $property = Property::where('workflow_stage', 'sheriff')
            ->findOrFail($id);

        $sheriffSale = SheriffSale::firstOrCreate(
            ['property_id' => $property->id],
            ['status' => 'scheduled']
        );

        $sheriffSale->update($request->only([
            'sale_date',
            'status',
            'winning_bid',
            'winner_info',
            'notes',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Sheriff sale updated successfully',
            'data' => $sheriffSale->load('property'),
        ]);
    }

    public function complete(Request $request, $id): JsonResponse
    {
        $property = Property::where('workflow_stage', 'sheriff')
            ->findOrFail($id);

        $sheriffSale = SheriffSale::where('property_id', $property->id)->firstOrFail();

        $sheriffSale->update([
            'status' => 'completed',
        ]);

        // Move property to next stage
        $property->update([
            'workflow_stage' => 'reo_disposition',
            'status' => 'reo',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sheriff sale completed',
            'data' => $sheriffSale->load('property'),
        ]);
    }
}
