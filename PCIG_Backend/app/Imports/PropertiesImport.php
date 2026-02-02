<?php

namespace App\Imports;

use App\Models\Property;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class PropertiesImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Normalize keys to lowercase
        $row = array_change_key_case($row, CASE_LOWER);

        // Normalize zip code
        if (!isset($row['zip_code']) && isset($row['zip'])) {
            $row['zip_code'] = $row['zip'];
        }

        // Simple validation or default values
        $purchasePrice = isset($row['purchase_price']) ? floatval(str_replace(['$', ','], '', $row['purchase_price'])) : 0;
        $totalShares = isset($row['total_shares']) ? intval($row['total_shares']) : 100;
        
        return new Property([
            'parcel_id'       => $row['parcel_id'],
            'property_code'   => $row['parcel_id'] ?? uniqid('PROP-'),
            'address'         => $row['address'],
            'location'        => isset($row['city']) && isset($row['state']) ? $row['city'] . ', ' . $row['state'] : ($row['city'] ?? 'Unknown'),
            'city'            => $row['city'],
            'county'          => $row['county'],
            'state'           => $row['state'],
            'zip_code'        => $row['zip_code'],
            'status'          => $row['status'] ?? 'active',
            'workflow_stage'  => $row['workflow_stage'] ?? 'acquisition',
            'purchase_price'  => $purchasePrice,
            'current_value'   => isset($row['current_value']) ? floatval(str_replace(['$', ','], '', $row['current_value'])) : $purchasePrice,
            'roi'             => $row['roi'] ?? 0,
            'total_shares'    => $totalShares,
            'available_shares'=> $row['available_shares'] ?? $totalShares, // Default to all available if not specified
            'price_per_share' => isset($row['price_per_share']) ? floatval(str_replace(['$', ','], '', $row['price_per_share'])) : 0,
            'purchase_date'   => isset($row['purchase_date']) ? Carbon::parse($row['purchase_date']) : now(),
        ]);
    }
}
