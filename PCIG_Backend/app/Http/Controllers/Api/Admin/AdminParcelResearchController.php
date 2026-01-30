<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParcelResearch;
use App\Models\ParcelInteraction;
use App\Models\ParcelDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminParcelResearchController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        $query = ParcelResearch::with(['researcher', 'interactions', 'documents']);

        // Apply Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('parcel_id', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('situs_address', 'like', "%{$search}%"); // Assuming situs_address is in ParcelResearch or we join properties
            });
        }

        // Apply Filters
        if ($request->has('county') && $request->county !== 'All Counties' && $request->county !== 'All') {
            $query->where('county', $request->county);
        }

        if ($request->has('buy_decision') && $request->buy_decision !== 'All') {
             // Assuming 'status' field holds the buy decision or a specific 'decision' field
             // If status is used for workflow (New, Researching, etc.), we might need a separate field or check values
             if (in_array($request->buy_decision, ['Yes', 'No', 'Pending'])) {
                 $query->where('status', $request->buy_decision);
             }
        }

        // Clone query for stats before pagination/limiting if needed, 
        // but stats usually cover WHOLE dataset, not just filtered. 
        // However, usually dashboard stats are global. Let's keep stats global for now.
        
        $totalParcels = ParcelResearch::count();
        $pendingResearch = ParcelResearch::whereNull('researched_at')->count();
        
        // Calculate Contacted Owners (unique parcels with at least one interaction)
        $contactedOwners = ParcelResearch::whereHas('interactions')->count();
        
        // Calculate Buy Decisions
        $yesDecisions = ParcelResearch::where('status', 'Yes')->count();
        $noDecisions = ParcelResearch::where('status', 'No')->count();
        $buyDecisions = "$yesDecisions Yes | $noDecisions No";

        // Get recent research items with filters applied
        $recentResearch = $query->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($item) {
                // Try to find matching property for more details
                $property = \App\Models\Property::where('parcel_id', $item->parcel_id)->first();
                
                // Calculate contact history
                $interactions = $item->interactions;
                $lastContact = $interactions->sortByDesc('created_at')->first();
                $lastContactDate = $lastContact ? $lastContact->created_at->format('M j, Y') : 'Never';
                
                $calls = $interactions->whereIn('type', ['Call (Outbound)', 'Call (Inbound)'])->count();
                $emails = $interactions->where('type', 'Email')->count();
                $texts = $interactions->where('type', 'Text')->count();
                $summary = "$calls calls, $emails email, $texts texts";

                return [
                    'id' => (string)$item->id,
                    'selected' => false,
                    'fileNumber' => 'N/A', // Not in DB
                    'parcelId' => $item->parcel_id,
                    'situsAddress' => $property ? $property->address : ($item->mailing_address ?? 'Unknown Address'),
                    'county' => $item->county ?? ($property ? $property->county : 'Unknown'),
                    'ownerName' => $item->owner_name ?? ($property ? 'Property Owner' : 'Unknown Owner'),
                    'ownerPhone' => $item->owner_phone ?? '-',
                    'ownerEmail' => $item->owner_email ?? '-',
                    'mailingAddress' => $item->mailing_address ?? '-',
                    'status' => $item->status ?? 'New',
                    'notes' => $item->research_notes ?? '',
                    'contactHistory' => [
                        'lastContact' => $lastContactDate,
                        'summary' => $summary
                    ],
                    'interactions' => $interactions->map(function($i) {
                        return [
                            'id' => $i->id,
                            'type' => $i->type,
                            'notes' => $i->notes,
                            'date' => $i->created_at->format('M j, Y g:i A')
                        ];
                    }),
                    'documents' => $item->documents->map(function($d) {
                        return [
                            'id' => $d->id,
                            'name' => $d->file_name ?? 'Document',
                            'url' => $d->file_path, // Assuming exposed or needs storage url
                            'date' => $d->created_at->format('M j, Y')
                        ];
                    })
                ];
            });

        // Mock a selected parcel for initial state
        $selectedParcel = null;
        if ($recentResearch->isNotEmpty()) {
            $selectedParcel = $recentResearch->first();
            $selectedParcel['selected'] = true;
        } else {
             // Fallback mock if no data exists, to prevent UI crash
            $selectedParcel = [
                'id' => 'mock-1',
                'parcelId' => '00-0000-000',
                'situsAddress' => 'No Data Available',
                'ownerName' => 'N/A'
            ];
        }

        $data = [
            'header' => [
                'title' => 'Parcel Research',
                'subtitle' => 'Excel-like research grid with owner contact tracking',
                'actionButtons' => [
                    [
                        'label' => '+ Add Parcel',
                        'icon' => 'Plus',
                        'variant' => 'primary'
                    ],
                    [
                        'label' => '↑ Bulk Import',
                        'icon' => 'Upload',
                        'variant' => 'secondary'
                    ],
                    [
                        'label' => 'Export',
                        'icon' => 'Download',
                        'variant' => 'secondary'
                    ]
                ]
            ],
            'summaryCards' => [
                [
                    'label' => 'Total Parcels',
                    'value' => (string)$totalParcels,
                    'subtitle' => 'In research pipeline',
                    'icon' => 'Package',
                    'color' => '#64748B',
                    'bg' => '#F1F5F9'
                ],
                [
                    'label' => 'Pending Research',
                    'value' => (string)$pendingResearch,
                    'subtitle' => 'Need attention',
                    'icon' => 'Clock',
                    'color' => '#F59E0B',
                    'bg' => '#FFFBEB'
                ],
                [
                    'label' => 'Contacted Owners',
                    'value' => (string)$contactedOwners,
                    'subtitle' => '0% contact rate',
                    'icon' => 'Phone',
                    'color' => '#10B981',
                    'bg' => '#F0FDF4'
                ],
                [
                    'label' => 'Buy Decisions',
                    'value' => $buyDecisions,
                    'subtitle' => 'Ready for auction',
                    'icon' => 'CheckCircle2',
                    'color' => '#15803D',
                    'bg' => '#F0FDF4'
                ]
            ],
            'searchAndFilters' => [
                'searchPlaceholder' => 'Search by parcel ID, address, owner name...',
                'filters' => [
                    [
                        'label' => 'County',
                        'value' => 'All Counties',
                        'options' => ['All Counties', 'Miami-Dade', 'Broward', 'Palm Beach']
                    ],
                    [
                        'label' => 'Bid Amount',
                        'value' => 'All',
                        'options' => ['All', '$0-$1,000', '$1,000-$5,000', '$5,000+']
                    ],
                    [
                        'label' => 'Contactability',
                        'value' => 'All',
                        'options' => ['All', 'Contacted', 'Not Contacted', 'No Contact Info']
                    ],
                    [
                        'label' => 'Buy Decision',
                        'value' => 'All',
                        'options' => ['All', 'Yes', 'No', 'Pending']
                    ]
                ],
                'clearButton' => 'Clear Filters'
            ],
            'gridActions' => [
                ['label' => 'Bulk Edit', 'variant' => 'secondary'],
                ['label' => 'Save Changes', 'variant' => 'primary'],
                ['label' => 'Undo', 'variant' => 'secondary'],
                ['label' => 'Columns', 'icon' => 'Grid', 'variant' => 'secondary']
            ],
            'dataGrid' => [
                'headers' => ['File #', 'Parcel ID', 'Situs Address', 'County', 'Owner Name', 'Owner Phone', 'Mailing Address', 'Status', 'Notes'],
                'rows' => $recentResearch
            ],
            'detailView' => [
                'tabs' => ['Owner Contact', 'Activity Log', 'Documents', 'Notes'],
                'ownerContact' => [
                    'title' => 'Contact Information',
                    'fields' => [
                        ['label' => 'Owner Name', 'value' => $selectedParcel['ownerName'] ?? 'N/A', 'type' => 'text'],
                        ['label' => 'Phone 1 (Primary)', 'value' => $selectedParcel['ownerPhone'] ?? '-', 'type' => 'phone', 'icons' => ['Phone', 'Message']],
                        ['label' => 'Mailing Address', 'value' => $selectedParcel['mailingAddress'] ?? '-', 'type' => 'text'],
                        ['label' => 'Email', 'value' => '-', 'type' => 'email', 'icons' => ['Mail']]
                    ]
                ]
            ],
            'quickContact' => [
                'title' => 'Quick Contact',
                'selectedParcel' => [
                    'parcelId' => $selectedParcel['parcelId'] ?? '',
                    'address' => $selectedParcel['situsAddress'] ?? '',
                    'owner' => $selectedParcel['ownerName'] ?? ''
                ],
                'contactButtons' => [
                    ['label' => 'Call', 'icon' => 'Phone', 'color' => '#10B981'],
                    ['label' => 'Text', 'icon' => 'MessageSquare', 'color' => '#2563EB'],
                    ['label' => 'Email', 'icon' => 'Mail', 'color' => '#F59E0B']
                ],
                'contactHistory' => [
                    'lastContact' => 'Never',
                    'summary' => '0 calls, 0 email total'
                ],
                'logInteraction' => [
                    'title' => 'LOG INTERACTION',
                    'typeLabel' => 'Interaction Type',
                    'typeOptions' => ['Call (Outbound)', 'Call (Inbound)', 'Text', 'Email', 'Meeting'],
                    'notesLabel' => 'Enter notes about this interaction...',
                    'buttonLabel' => 'Log Interaction'
                ]
            ]
        ];

        return response()->json($data);
    }

    public function export(Request $request)
    {
        $query = ParcelResearch::query();

        // Apply same filters as dashboardData
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('parcel_id', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('situs_address', 'like', "%{$search}%");
            });
        }
        if ($request->has('county') && $request->county !== 'All Counties' && $request->county !== 'All') {
            $query->where('county', $request->county);
        }
        if ($request->has('buy_decision') && $request->buy_decision !== 'All') {
             if (in_array($request->buy_decision, ['Yes', 'No', 'Pending'])) {
                 $query->where('status', $request->buy_decision);
             }
        }

        $filename = "parcel-research-" . date('Y-m-d') . ".csv";
        
        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=\"$filename\"",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['Parcel ID', 'County', 'Owner Name', 'Owner Phone', 'Owner Email', 'Mailing Address', 'Status', 'Research Notes', 'Created At'];

        $callback = function() use ($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $query->chunk(100, function($rows) use ($file) {
                foreach ($rows as $row) {
                    fputcsv($file, [
                        $row->parcel_id,
                        $row->county,
                        $row->owner_name,
                        $row->owner_phone,
                        $row->owner_email,
                        $row->mailing_address,
                        $row->status,
                        $row->research_notes,
                        $row->created_at,
                    ]);
                }
            });
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function search(Request $request): JsonResponse
    {
        // This endpoint would normally integrate with a 3rd party API
        // For now, it returns local research history + mock data
        
        $request->validate([
            'parcel_id' => 'required|string',
            'county' => 'nullable|string',
        ]);

        $parcelId = $request->parcel_id;

        // Check local history
        $localResearch = ParcelResearch::where('parcel_id', $parcelId)
            ->with(['researcher', 'documents'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Mock external data (e.g. from county assessor)
        $externalData = [
            'parcel_id' => $parcelId,
            'owner' => 'Unknown Owner',
            'address' => '123 County Rd',
            'assessed_value' => rand(50000, 500000),
            'tax_due' => rand(1000, 10000),
            'source' => 'Mock County Assessor API'
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'external_data' => $externalData,
                'history' => $localResearch,
            ],
        ]);
    }

    public function saveResearch(Request $request): JsonResponse
    {
        $request->validate([
            'parcel_id' => 'required|string',
            'county' => 'nullable|string',
            'research_notes' => 'nullable|string',
            'owner_name' => 'nullable|string',
            'owner_phone' => 'nullable|string',
            'owner_email' => 'nullable|string',
            'mailing_address' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $research = ParcelResearch::create([
            'parcel_id' => $request->parcel_id,
            'county' => $request->county,
            'research_notes' => $request->research_notes,
            'owner_name' => $request->owner_name,
            'owner_phone' => $request->owner_phone,
            'owner_email' => $request->owner_email,
            'mailing_address' => $request->mailing_address,
            'status' => $request->status ?? 'New',
            'researched_by' => $request->user()->id,
            'researched_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Research notes saved successfully',
            'data' => $research->load('researcher'),
        ], 201);
    }

    public function logInteraction(Request $request, $id): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'notes' => 'required|string',
        ]);

        $research = ParcelResearch::findOrFail($id);

        $interaction = ParcelInteraction::create([
            'parcel_research_id' => $research->id,
            'type' => $request->type,
            'notes' => $request->notes,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Interaction logged successfully',
            'data' => $interaction,
        ], 201);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'changes' => 'required|array',
            'changes.*.id' => 'required|exists:parcel_research,id',
            // Add other validation rules as needed
        ]);

        $count = 0;
        foreach ($request->changes as $change) {
            $research = ParcelResearch::find($change['id']);
            if ($research) {
                // Update allowed fields
                $fillable = ['county', 'research_notes', 'status', 'owner_name', 'owner_phone', 'owner_email', 'mailing_address']; // Add more as needed
                $dataToUpdate = array_intersect_key($change, array_flip($fillable));
                
                if (!empty($dataToUpdate)) {
                    $research->update($dataToUpdate);
                    $count++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Updated $count parcels successfully"
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'batch_name' => 'required|string',
            'import_date' => 'required|date',
            'files' => 'required|array',
            'files.*' => 'file|mimes:csv,txt,xlsx,xls',
        ]);

        $count = 0;

        foreach ($request->file('files') as $file) {
            // Simple CSV parsing
            if ($file->getClientOriginalExtension() === 'csv' || $file->getClientOriginalExtension() === 'txt') {
                $path = $file->getRealPath();
                $data = array_map('str_getcsv', file($path));
                $header = array_shift($data); // Assume first row is header
                
                // Map headers to columns (simplified)
                $parcelIdIdx = -1;
                $countyIdx = -1;
                $ownerNameIdx = -1;
                $ownerPhoneIdx = -1;
                $ownerEmailIdx = -1;
                $mailingAddressIdx = -1;
                $statusIdx = -1;
                
                foreach ($header as $idx => $col) {
                    $col = strtolower(trim($col));
                    if (str_contains($col, 'parcel') && str_contains($col, 'id')) $parcelIdIdx = $idx;
                    if (str_contains($col, 'county')) $countyIdx = $idx;
                    if (str_contains($col, 'owner') && str_contains($col, 'name')) $ownerNameIdx = $idx;
                    if (str_contains($col, 'owner') && str_contains($col, 'phone')) $ownerPhoneIdx = $idx;
                    if (str_contains($col, 'owner') && str_contains($col, 'email')) $ownerEmailIdx = $idx;
                    if (str_contains($col, 'mailing') && str_contains($col, 'address')) $mailingAddressIdx = $idx;
                    if (str_contains($col, 'status')) $statusIdx = $idx;
                }

                if ($parcelIdIdx !== -1) {
                    foreach ($data as $row) {
                        if (isset($row[$parcelIdIdx]) && !empty($row[$parcelIdIdx])) {
                            ParcelResearch::create([
                                'parcel_id' => $row[$parcelIdIdx],
                                'county' => $countyIdx !== -1 ? ($row[$countyIdx] ?? 'Unknown') : 'Unknown',
                                'owner_name' => $ownerNameIdx !== -1 ? ($row[$ownerNameIdx] ?? null) : null,
                                'owner_phone' => $ownerPhoneIdx !== -1 ? ($row[$ownerPhoneIdx] ?? null) : null,
                                'owner_email' => $ownerEmailIdx !== -1 ? ($row[$ownerEmailIdx] ?? null) : null,
                                'mailing_address' => $mailingAddressIdx !== -1 ? ($row[$mailingAddressIdx] ?? null) : null,
                                'status' => $statusIdx !== -1 ? ($row[$statusIdx] ?? 'New') : 'New',
                                'research_notes' => 'Imported from batch: ' . $request->batch_name,
                                'researched_by' => $request->user()->id,
                                'created_at' => $request->import_date,
                            ]);
                            $count++;
                        }
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Imported $count parcels successfully",
            'count' => $count
        ]);
    }

    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $research = ParcelResearch::findOrFail($id);
        $file = $request->file('file');
        
        $path = $file->store('parcel-documents', 'public');
        
        $document = ParcelDocument::create([
            'parcel_research_id' => $research->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => Storage::url($path),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
            'uploaded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => [
                'id' => $document->id,
                'name' => $document->file_name,
                'url' => $document->file_path,
                'date' => $document->created_at->format('M j, Y')
            ]
        ], 201);
    }
}
