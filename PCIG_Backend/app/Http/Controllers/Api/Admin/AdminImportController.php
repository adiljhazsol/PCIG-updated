<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DataImport;
use App\Models\DataImportError;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminImportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DataImport::with('importer');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function show($id): JsonResponse
    {
        $import = DataImport::with(['importer', 'errors'])->findOrFail($id);
        return response()->json(['data' => $import]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:properties,investors,transactions',
            'file' => 'required|file|mimes:csv,txt,xlsx,xls',
        ]);

        $path = $request->file('file')->store('imports');
        $fullPath = storage_path('app/' . $path);

        $import = DataImport::create([
            'type' => $request->type,
            'file_path' => $path,
            'status' => 'processing',
            'total_rows' => 0,
            'imported_by' => $request->user()->id,
        ]);

        try {
            if ($request->type === 'properties') {
                $this->processPropertiesImport($import, $fullPath);
            } else {
                 // Placeholder for other types
                 $import->update(['status' => 'completed', 'total_rows' => 0, 'success_count' => 0, 'error_count' => 0]);
            }
        } catch (\Exception $e) {
            $import->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $import->load('errors'),
            'message' => 'File imported successfully'
        ], 201);
    }

    private function processPropertiesImport(DataImport $import, string $filePath)
    {
        if (!file_exists($filePath)) {
            throw new \Exception("File not found at path: $filePath");
        }

        $file = fopen($filePath, 'r');
        $header = fgetcsv($file);
        
        // Normalize headers: lowercase, snake_case
        $header = array_map(function($h) { 
            return strtolower(trim(str_replace([' ', '/'], '_', $h))); 
        }, $header);

        $rowNum = 1; // Header is row 1
        $successCount = 0;
        $errorCount = 0;
        $totalRows = 0;

        while (($row = fgetcsv($file)) !== false) {
            $rowNum++;
            $totalRows++;
            
            // Skip empty rows
            if (empty(array_filter($row))) continue;

            if (count($row) !== count($header)) {
                DataImportError::create([
                    'data_import_id' => $import->id,
                    'row_number' => $rowNum,
                    'error_message' => 'Column count mismatch',
                    'row_data' => json_encode($row)
                ]);
                $errorCount++;
                continue;
            }

            $data = array_combine($header, $row);

            try {
                // Basic Validation
                if (empty($data['parcel_id']) && empty($data['address'])) {
                    throw new \Exception("Missing Parcel ID or Address");
                }

                // Check for duplicate parcel_id if provided
                if (!empty($data['parcel_id']) && Property::where('parcel_id', $data['parcel_id'])->exists()) {
                    throw new \Exception("Duplicate Parcel ID: " . $data['parcel_id']);
                }

                Property::create([
                    'parcel_id' => $data['parcel_id'] ?? null,
                    'address' => $data['address'] ?? 'Unknown Address',
                    'city' => $data['city'] ?? null,
                    'county' => $data['county'] ?? null,
                    'state' => $data['state'] ?? 'GA',
                    'zip_code' => $data['zip_code'] ?? null,
                    'purchase_price' => isset($data['purchase_price']) ? (float)str_replace(['$', ','], '', $data['purchase_price']) : 0,
                    'status' => 'active',
                    'workflow_stage' => 'research', // Default stage
                    'purchase_date' => isset($data['purchase_date']) ? date('Y-m-d', strtotime($data['purchase_date'])) : now(),
                ]);

                $successCount++;

            } catch (\Exception $e) {
                DataImportError::create([
                    'data_import_id' => $import->id,
                    'row_number' => $rowNum,
                    'error_message' => $e->getMessage(),
                    'row_data' => json_encode($data)
                ]);
                $errorCount++;
            }
        }

        fclose($file);

        $import->update([
            'status' => 'completed',
            'total_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => $errorCount,
        ]);
    }
}
