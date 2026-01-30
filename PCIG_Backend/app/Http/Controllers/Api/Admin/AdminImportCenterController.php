<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FIFAImport;
use App\Models\FIFAImportError;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\PropertiesImport;

class AdminImportCenterController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Fetch recent batches from database
        $recentBatches = FIFAImport::latest()->take(5)->get()->map(function($import) {
            return [
                'id' => $import->id,
                'batchName' => $import->file_name,
                'type' => 'FIFA (PDF)',
                'date' => $import->created_at->format('M d, Y'),
                'items' => $import->total_rows ?? 0,
                'status' => ucfirst($import->status),
                'statusColor' => $this->getStatusColor($import->status),
                'statusBg' => $this->getStatusBg($import->status),
                'actionLabel' => 'View Details'
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
                'FIFA Import',
                'Parcel Research',
                'Sheriff Lists',
                'Auction Results',
                'Documents',
                'Time Tracking'
            ],
            'uploadPanels' => [
                'fifa' => [
                    'title' => 'Upload FIFA PDFs (OCR)',
                    'description' => 'Upload scanned FIFA documents. System will auto-extract parcel data.',
                    'primaryButton' => 'Choose PDF Files',
                    'helper' => 'Drag & drop supported'
                ],
                'excel' => [
                    'title' => 'Upload Excel / CSV List',
                    'description' => 'Import bulk parcel lists. Use the standard template for best results.',
                    'templateButton' => 'Template',
                    'uploadButton' => 'Upload Excel'
                ]
            ],
            'statusFilters' => [
                'All Items',
                'Matched (0)',
                'Pending (0)',
                'Errors (0)'
            ],
            'reviewQueue' => [
                'title' => 'Review Queue: No Pending Items',
                'subtitle' => 'All items have been processed or no import is active.',
                'confirmButton' => 'Confirm Selected (0)',
                'tableHeaders' => [
                    'Extracted Data',
                    'Proposed Match',
                    'Confidence',
                    'Status',
                    'Actions'
                ],
                'rows' => []
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
            } elseif ($type === 'properties') {
                fputcsv($file, [
                    'parcel_id', 'address', 'city', 'county', 'state', 'zip_code', 
                    'status', 'workflow_stage', 'purchase_price', 'current_value', 
                    'roi', 'total_shares', 'available_shares', 'price_per_share', 'purchase_date'
                ]);
                fputcsv($file, [
                    '12-345-67', '123 Main St', 'Atlanta', 'Fulton', 'GA', '30303',
                    'active', 'acquisition', '150000', '160000', '12.5', '100', '100', '1500', '2024-01-01'
                ]);
            } else {
                fputcsv($file, ['Column1', 'Column2', 'Column3']);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function uploadProperties(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        try {
            Excel::import(new PropertiesImport, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => 'Properties imported successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error importing properties: ' . $e->getMessage(),
            ], 500);
        }
    }
}
