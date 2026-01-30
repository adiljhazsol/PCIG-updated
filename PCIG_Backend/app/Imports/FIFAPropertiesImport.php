<?php

namespace App\Imports;

use App\Models\Property;
use App\Models\FIFAImport;
use App\Models\FIFAImportError;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;

class FIFAPropertiesImport implements ToCollection, WithHeadingRow
{
    protected $import;

    public function __construct(FIFAImport $import)
    {
        $this->import = $import;
    }

    public function collection(Collection $rows)
    {
        $totalRows = $rows->count();
        $this->import->update(['total_rows' => $totalRows]);

        $successCount = 0;
        $errorCount = 0;

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +1 for header, +1 for 0-based index

            // Normalize keys (handle Parcel_Number -> parcel_id)
            if (!isset($row['parcel_id']) && isset($row['parcel_number'])) {
                $row['parcel_id'] = $row['parcel_number'];
            }
            // Normalize zip
            if (!isset($row['zip_code'])) {
                $row['zip_code'] = $row['zip'] ?? null;
            }

            // Basic Validation
            $validator = Validator::make($row->toArray(), [
                'parcel_id' => 'required',
                'address' => 'required',
                // Add other fields as necessary
            ]);

            if ($validator->fails()) {
                FIFAImportError::create([
                    'import_id' => $this->import->id,
                    'row_number' => $rowNumber,
                    'error_message' => implode(', ', $validator->errors()->all()),
                    'row_data' => $row->toArray()
                ]);
                $errorCount++;
                continue;
            }

            try {
                // Check if property exists
                $property = Property::where('parcel_id', $row['parcel_id'])->first();

                if (!$property) {
                    Property::create([
                        'fifa_import_id' => $this->import->id,
                        'parcel_id' => $row['parcel_id'],
                        'property_code' => $row['parcel_id'],
                        'address' => $row['address'],
                        'location' => ($row['city'] ?? 'Unknown') . ', ' . ($row['state'] ?? 'GA'),
                        'city' => $row['city'] ?? null,
                        'county' => $row['county'] ?? null,
                        'state' => $row['state'] ?? 'GA', // Default to GA or from row
                        'zip_code' => $row['zip'] ?? ($row['zip_code'] ?? null),
                        'status' => 'pending_review',
                        'workflow_stage' => 'fifa_processing',
                        'purchase_price' => $row['purchase_price'] ?? 0,
                        'current_value' => $row['current_value'] ?? 0,
                        'roi' => 0,
                        'total_shares' => 0,
                        'available_shares' => 0,
                        'price_per_share' => 0,
                    ]);
                } else {
                    // Update existing property with new batch ID and latest data
                    $property->update([
                        'fifa_import_id' => $this->import->id,
                        // Optionally update other fields if we want the CSV to be the source of truth
                        'purchase_price' => $row['purchase_price'] ?? $property->purchase_price,
                        'current_value' => $row['current_value'] ?? $property->current_value,
                    ]);
                }

                $successCount++;
            } catch (\Exception $e) {
                FIFAImportError::create([
                    'import_id' => $this->import->id,
                    'row_number' => $rowNumber,
                    'error_message' => $e->getMessage(),
                    'row_data' => $row->toArray()
                ]);
                $errorCount++;
            }
        }

        $this->import->update([
            'status' => $errorCount > 0 ? ($successCount > 0 ? 'completed_with_errors' : 'failed') : 'completed',
            'processed_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'completed_at' => now(),
        ]);
    }
}
