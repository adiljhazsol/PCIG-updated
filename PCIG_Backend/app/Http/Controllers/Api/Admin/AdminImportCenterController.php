<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FIFAImport;
use App\Models\DataImport;
use App\Models\FIFAImportError;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\PropertiesImport;
use App\Models\Property;
use App\Imports\FIFAPropertiesImport;

class AdminImportCenterController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Fetch recent batches from database (FIFA and DataImport)
        $fifaImports = FIFAImport::latest()->take(5)->get()->map(function($import) {
            return [
                'id' => $import->id,
                'batchName' => $import->file_name,
                'type' => 'FIFA (Excel)',
                'date' => $import->created_at->format('M d, Y'),
                'timestamp' => $import->created_at->timestamp,
                'items' => $import->total_rows ?? 0,
                'status' => ucfirst($import->status),
                'statusColor' => $this->getStatusColor($import->status),
                'statusBg' => $this->getStatusBg($import->status),
                'actionLabel' => 'View Details'
            ];
        });

        $dataImports = DataImport::latest()->take(5)->get()->map(function($import) {
            return [
                'id' => $import->id,
                'batchName' => $import->name ?? basename($import->file_path),
                'type' => ucfirst(str_replace('_', ' ', $import->type)),
                'date' => $import->created_at->format('M d, Y'),
                'timestamp' => $import->created_at->timestamp,
                'items' => $import->total_rows ?? 0,
                'status' => ucfirst($import->status),
                'statusColor' => $this->getStatusColor($import->status),
                'statusBg' => $this->getStatusBg($import->status),
                'actionLabel' => 'View Details'
            ];
        });

        // Merge and sort
        $recentBatches = $fifaImports->merge($dataImports)->sortByDesc('timestamp')->take(5)->values();

        // Fetch pending properties for review queue
        $pendingProperties = Property::where('status', 'pending_review')
            ->orWhere('workflow_stage', 'fifa_processing')
            ->latest()
            ->take(10)
            ->get()
            ->map(function($property) {
                return [
                    'id' => $property->id,
                    'extracted' => [
                        'primary' => $property->address,
                        'secondary' => ($property->city ?? '') . ', ' . ($property->state ?? '') . ' ' . ($property->zip_code ?? ''),
                        'meta' => 'Source: Excel Import'
                    ],
                    'proposed' => [
                        'primary' => $property->parcel_id,
                        'secondary' => $property->owner_name ?? 'Unknown Owner',
                        'link' => 'View Property',
                        'accentColor' => '#1E3A5F'
                    ],
                    'confidence' => [
                        'value' => '100%',
                        'barPercent' => '100%',
                        'color' => '#15803D'
                    ],
                    'status' => [
                        'label' => 'Pending Review',
                        'color' => '#B45309',
                        'bg' => '#FFFBEB'
                    ],
                    'actions' => [
                        ['label' => 'Confirm', 'action' => 'confirm', 'variant' => 'primary'],
                        ['label' => 'Edit', 'action' => 'edit', 'variant' => 'secondary']
                    ]
                ];
            });

        $data = [
            'header' => [
                'title' => 'Import Center',
                'subtitle' => 'Bulk import documents and data for processing, workflow updates, and research.'
            ],
            'headerButtons' => [
                'importHistory' => 'Import History',
                'downloadTemplates' => 'Download Templates'
            ],
            'tabs' => [
                ['id' => 'fifa', 'label' => 'FIFA Import', 'type' => 'fifa'],
                ['id' => 'parcel_research', 'label' => 'Parcel Research', 'type' => 'excel'],
                ['id' => 'sheriff_lists', 'label' => 'Sheriff Lists', 'type' => 'excel'],
                ['id' => 'auction_results', 'label' => 'Auction Results', 'type' => 'excel'],
                ['id' => 'documents', 'label' => 'Documents', 'type' => 'generic'],
                ['id' => 'time_tracking', 'label' => 'Time Tracking', 'type' => 'excel']
            ],
            'uploadPanels' => [
                'fifa' => [
                    'title' => 'Upload FIFA List (Excel/CSV)',
                    'description' => 'Upload FIFA property list for automated processing.',
                    'primaryButton' => 'Upload Excel/CSV',
                    'helper' => 'Supports .xlsx, .csv',
                    'acceptedFileTypes' => '.csv,.xlsx,.xls'
                ],
                'excel' => [
                    'title' => 'Upload Excel / CSV List',
                    'description' => 'Import bulk data. Use the standard template for best results.',
                    'templateButton' => 'Download Template',
                    'uploadButton' => 'Upload Excel/CSV',
                    'acceptedFileTypes' => '.csv,.xlsx,.xls'
                ],
                'generic' => [
                    'title' => 'Upload Documents',
                    'description' => 'Upload general documents for storage and processing.',
                    'primaryButton' => 'Select Documents',
                    'helper' => 'Supports PDF, Word, Images',
                    'acceptedFileTypes' => '.pdf,.doc,.docx,.jpg,.png'
                ]
            ],
            'statusFilters' => [
                'All Items',
                'Matched (' . $pendingProperties->count() . ')',
                'Pending (' . $pendingProperties->count() . ')',
                'Errors (0)'
            ],
            'reviewQueue' => [
                'title' => $pendingProperties->isEmpty() ? 'Review Queue: No Pending Items' : 'Review Queue: Pending Items (' . $pendingProperties->count() . ')',
                'subtitle' => $pendingProperties->isEmpty() ? 'All items have been processed or no import is active.' : 'Please review and confirm the imported properties.',
                'confirmButton' => 'Confirm Selected (0)',
                'tableHeaders' => [
                    'Address',
                    'Parcel ID',
                    'Confidence',
                    'Status',
                    'Actions'
                ],
                'rows' => $pendingProperties
            ],
            'recentBatches' => [
                'title' => 'Recent Import Batches',
                'viewAllLabel' => 'View All',
                'tableHeaders' => [
                    'Batch Name',
                    'Type',
                    'Date',
                    'Items',
                    'Status'
                ],
                'rows' => $recentBatches->isEmpty() ? [] : $recentBatches
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => ['importCenter' => $data]
        ]);
    }

    private function getStatusColor($status)
    {
        return match (strtolower($status)) {
            'completed' => '#15803D',
            'processing' => '#B45309',
            'error' => '#DC2626',
            default => '#64748B',
        };
    }

    private function getStatusBg($status)
    {
        return match (strtolower($status)) {
            'completed' => '#F0FDF4',
            'processing' => '#FFFBEB',
            'error' => '#FEF2F2',
            default => '#F1F5F9',
        };
    }

    /**
     * Download import template.
     * 
     * @param string $type
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadTemplate($type)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="import-template-' . $type . '.csv"',
        ];

        $callback = function() use ($type) {
            $file = fopen('php://output', 'w');
            
            if ($type === 'fifa') {
                fputcsv($file, ['Address', 'Parcel_Number', 'Date_Of_Sale', 'Owner', 'County']);
                fputcsv($file, ['123 Main St', '12-345-67', '2023-01-01', 'John Doe', 'Fulton']);
            } elseif ($type === 'parcel_research' || $type === 'properties') {
                fputcsv($file, [
                    'parcel_id', 'address', 'city', 'county', 'state', 'zip_code', 
                    'status', 'workflow_stage', 'purchase_price', 'current_value', 
                    'roi', 'total_shares', 'available_shares', 'price_per_share', 'purchase_date'
                ]);
            } elseif ($type === 'sheriff_lists') {
                fputcsv($file, ['Sale Date', 'Case Number', 'Address', 'Plaintiff', 'Defendant', 'Judgment Amount', 'Opening Bid']);
            } elseif ($type === 'auction_results') {
                fputcsv($file, ['Auction Date', 'Parcel ID', 'Winning Bidder', 'Winning Bid', 'Sold Amount', 'Status']);
            } elseif ($type === 'time_tracking') {
                fputcsv($file, ['Date', 'Employee ID', 'Task', 'Hours', 'Notes']);
            } else {
                fputcsv($file, ['Column1', 'Column2', 'Column3']);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function upload(Request $request, $type)
    {
        $request->validate([
            'file' => 'required|file',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date' => 'nullable|date',
        ]);

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $path = $file->storeAs('imports/' . $type, Carbon::now()->timestamp . '_' . $originalName);
            
            // Handle optional date override
            $createdAt = $request->date ? Carbon::parse($request->date) : Carbon::now();

            if ($type === 'fifa') {
                 // Create FIFA Import record
                 $import = new FIFAImport();
                 $import->file_name = $request->name ?? $originalName;
                 $import->description = $request->description;
                 $import->file_path = $path;
                 $import->created_at = $createdAt;
                 $import->status = 'processing';
                 $import->total_rows = 0; // Will be updated by Import
                 $import->imported_by = $request->user() ? $request->user()->id : null;
                 $import->save();
                 
                 // Process Excel/CSV immediately
                 if ($request->hasFile('file') && in_array($file->getClientOriginalExtension(), ['csv', 'xlsx', 'xls'])) {
                     try {
                         Excel::import(new FIFAPropertiesImport($import), $file);
                         // Status is updated inside FIFAPropertiesImport
                     } catch (\Exception $e) {
                         $import->status = 'failed';
                         $import->save();
                         // Log error or handle as needed
                     }
                 }
            } else {
                // Create generic DataImport record for other types
                $import = new DataImport();
                $import->type = $type;
                $import->name = $request->name ?? $originalName;
                $import->description = $request->description;
                $import->file_path = $path;
                $import->created_at = $createdAt;
                $import->status = 'pending';
                $import->imported_by = $request->user() ? $request->user()->id : 1; // Fallback to system user if needed
                $import->save();

                // Process Excel immediately for supported types
                if ($request->hasFile('file') && in_array($file->getClientOriginalExtension(), ['csv', 'xlsx', 'xls'])) {
                    if ($type === 'parcel_research' || $type === 'properties') {
                         try {
                             Excel::import(new PropertiesImport, $file);
                             $import->status = 'completed';
                             $import->save();
                         } catch (\Exception $e) {
                             $import->status = 'failed';
                             $import->save();
                         }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' uploaded successfully',
                'file_path' => $path
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading ' . $type . ': ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadProperties(Request $request)
    {
        return $this->upload($request, 'properties');
    }

    /**
     * Get FIFA Import details.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function fifaImportDetails($id): JsonResponse
    {
        $import = FIFAImport::with(['errors'])->find($id);

        if (!$import) {
            return response()->json(['message' => 'Import batch not found'], 404);
        }

        // Fetch properties associated with this import (assuming there is a relationship or query logic)
        // Since the current Property model might not have a direct relation, we'll fetch via a column if it exists,
        // or just return empty properties for now if the migration hasn't linked them fully.
        // Assuming Property has 'fifa_import_id' or we use the errors for details.
        
        $properties = Property::where('fifa_import_id', $id)->get()->map(function($prop) {
             return [
                 'id' => $prop->id,
                 'address' => $prop->address,
                 'parcel_id' => $prop->parcel_id,
                 'owner' => $prop->owner_name,
                 'status' => $prop->status,
                 'confidence' => '100%', // Excel imports are usually high confidence
             ];
        });

        return response()->json([
            'batch' => [
                'id' => $import->id,
                'fileName' => $import->file_name,
                'description' => $import->description,
                'status' => $import->status,
                'totalRows' => $import->total_rows,
                'processedRows' => $import->processed_rows ?? 0,
                'createdAt' => $import->created_at->format('M d, Y H:i A'),
                'completedAt' => $import->completed_at ? $import->completed_at->format('M d, Y H:i A') : null,
            ],
            'errors' => $import->errors,
            'properties' => $properties
        ]);
    }

    /**
     * Get paginated list of FIFA imports.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function fifaImportsIndex(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        
        $imports = FIFAImport::latest()
            ->paginate($perPage);

        $mappedImports = $imports->getCollection()->map(function($import) {
            return [
                'id' => $import->id,
                'batchName' => $import->file_name,
                'description' => $import->description,
                'date' => $import->created_at->format('M d, Y'),
                'items' => $import->total_rows ?? 0,
                'status' => ucfirst($import->status),
                'statusColor' => $this->getStatusColor($import->status),
                'statusBg' => $this->getStatusBg($import->status),
            ];
        });

        $imports->setCollection($mappedImports);

        return response()->json($imports);
    }

    /**
     * Get FIFA Dashboard Data.
     * 
     * @return JsonResponse
     */
    public function fifaDashboardData(): JsonResponse
    {
        $totalBatches = FIFAImport::count();
        $activeImports = FIFAImport::where('status', 'processing')->count();
        $totalProperties = FIFAImport::sum('total_rows');
        
        // Calculate success rate (completed vs failed/errors)
        $completedBatches = FIFAImport::where('status', 'completed')->count();
        $successRate = $totalBatches > 0 ? round(($completedBatches / $totalBatches) * 100) : 0;

        $recentBatches = FIFAImport::with('importedBy')->latest()->take(5)->get()->map(function($import) {
            return [
                'id' => $import->id,
                'batchName' => $import->file_name,
                'uploadedBy' => $import->importedBy ? $import->importedBy->name : 'System',
                'type' => 'FIFA (Excel)',
                'date' => $import->created_at->format('M d, Y'),
                'items' => $import->total_rows ?? 0,
                'status' => ucfirst($import->status),
                'statusColor' => $this->getStatusColor($import->status),
                'statusBg' => $this->getStatusBg($import->status),
                'action' => 'View Details'
            ];
        });

        // Construct the response structure expected by FIFAImport.tsx
        return response()->json([
            'header' => [
                'title' => 'FIFA Import',
                'subtitle' => 'Upload scanned FIFA documents. System will auto-extract parcel data.',
                'actionButtons' => [
                    ['label' => 'View History', 'icon' => 'FileText'],
                    ['label' => 'New Batch', 'icon' => 'Plus']
                ]
            ],
            'summaryCards' => [
                [
                    'label' => 'Total Batches', 
                    'value' => $totalBatches, 
                    'subtitle' => 'All time', 
                    'color' => '#2563EB', 
                    'bg' => '#F1F5F9', 
                    'icon' => 'FileText'
                ],
                [
                    'label' => 'Active Imports', 
                    'value' => $activeImports, 
                    'subtitle' => 'Processing now', 
                    'color' => '#B45309', 
                    'bg' => '#FFFBEB', 
                    'icon' => 'Clock'
                ],
                [
                    'label' => 'Total Properties', 
                    'value' => $totalProperties, 
                    'subtitle' => 'Processed', 
                    'color' => '#15803D', 
                    'bg' => '#F0FDF4', 
                    'icon' => 'CheckCircle2'
                ],
                [
                    'label' => 'Success Rate', 
                    'value' => $successRate . '%', 
                    'subtitle' => 'Last 30 days', 
                    'color' => '#7C3AED', 
                    'bg' => '#F5F3FF', 
                    'icon' => 'CheckCircle2'
                ]
            ],
            'uploadSection' => [
                'title' => 'Upload FIFA List',
                'subtitle' => 'Drag & drop supported',
                'downloadTemplate' => 'Download Template',
                'uploadAreas' => [
                    [
                        'id' => 'excel',
                        'title' => 'Upload Excel List',
                        'description' => 'Import bulk parcel lists via Excel. Use the standard template for best results.',
                        'color' => '#10B981',
                        'icon' => 'FileSpreadsheet',
                        'buttonText' => 'Select Excel File',
                        'dragDropText' => 'Excel (.xlsx, .xls)'
                    ],
                    [
                        'id' => 'csv',
                        'title' => 'Upload CSV List',
                        'description' => 'Import bulk parcel lists via CSV. Use the standard template for best results.',
                        'color' => '#F59E0B',
                        'icon' => 'FileText',
                        'buttonText' => 'Select CSV File',
                        'dragDropText' => 'CSV (.csv)'
                    ]
                ],
                'formFields' => [
                    ['label' => 'Batch Name', 'placeholder' => 'Enter batch name (optional)', 'type' => 'text'],
                    ['label' => 'Notes', 'placeholder' => 'Enter notes (optional)', 'type' => 'textarea']
                ],
                'formActions' => [
                    ['label' => 'Cancel', 'variant' => 'secondary'],
                    ['label' => 'Start Import', 'variant' => 'primary']
                ]
            ],
            'fieldMapping' => [
                'title' => 'Field Mapping',
                'subtitle' => 'Verify how columns are mapped.',
                'tableHeaders' => ['System Field', 'File Column', 'Sample Data', 'Required'],
                'mappings' => [
                    ['systemField' => 'Parcel ID', 'fileColumn' => 'Parcel_Number', 'sampleData' => '12-345-67', 'required' => 'Yes'],
                    ['systemField' => 'Address', 'fileColumn' => 'Address', 'sampleData' => '123 Main St', 'required' => 'Yes'],
                    ['systemField' => 'Owner', 'fileColumn' => 'Owner', 'sampleData' => 'John Doe', 'required' => 'No'],
                ],
                'actionButton' => 'Confirm Mapping'
            ],
            'reviewQueue' => [
                'title' => 'Review Queue: No Pending Items',
                'subtitle' => 'All items have been processed or no import is active.',
                'searchPlaceholder' => 'Search by address, parcel ID...',
                'filterTabs' => ['All', 'Matched', 'Pending', 'Errors'],
                'bulkActions' => [
                    ['label' => 'Confirm Selected', 'variant' => 'primary'],
                    ['label' => 'Reject Selected', 'variant' => 'secondary']
                ],
                'tableHeaders' => ['Select', 'Extracted Data', 'Proposed Match', 'Confidence', 'Status', 'Actions'],
                'items' => [] // Populate this with real data if available
            ],
            'workflowIntegration' => [
                'title' => 'Workflow Integration',
                'items' => [
                    ['id' => 1, 'text' => 'Auto-create tasks for new properties', 'action' => 'Configure', 'icon' => 'CheckCircle2', 'color' => '#10B981'],
                    ['id' => 2, 'text' => 'Notify team on high-value matches', 'action' => 'Edit Rule', 'icon' => 'AlertCircle', 'color' => '#F59E0B']
                ]
            ],
            'importBatches' => [
                'title' => 'Recent Import Batches',
                'viewAllLabel' => 'View All',
                'tableHeaders' => ['Batch Name', 'Date', 'Uploaded By', 'Items', 'Status', 'Actions'],
                'batches' => $recentBatches
            ]
        ]);
    }

    /**
     * Confirm a property from review queue.
     */
    public function confirm(Request $request, $id)
    {
        try {
            $property = Property::findOrFail($id);
            $property->status = 'active';
            $property->workflow_stage = 'research'; // Move to research stage
            $property->save();

            return response()->json([
                'message' => 'Property confirmed successfully',
                'property' => $property
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to confirm property: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Confirm multiple properties from review queue.
     */
    public function confirmBatch(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:properties,id'
        ]);

        $count = 0;
        foreach ($request->ids as $id) {
            $property = Property::find($id);
            if ($property) {
                $property->status = 'active';
                $property->workflow_stage = 'research';
                $property->save();
                $count++;
            }
        }

        return response()->json([
            'message' => "$count properties confirmed successfully",
            'count' => $count
        ]);
    }

    /**
     * Update a property from review queue (Edit action).
     */
    public function updateReviewItem(Request $request, $id)
    {
        try {
            $property = Property::findOrFail($id);
            
            // Validate and update fields
            $validated = $request->validate([
                'address' => 'sometimes|string',
                'parcel_id' => 'sometimes|string',
                'city' => 'sometimes|nullable|string',
                'state' => 'sometimes|nullable|string',
                'zip_code' => 'sometimes|nullable|string',
                // Add other fields as needed
            ]);

            $property->update($validated);
            
            return response()->json([
                'message' => 'Property updated successfully',
                'property' => $property
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update property: ' . $e->getMessage()], 500);
        }
    }
}
