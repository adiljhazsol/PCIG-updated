<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parcel_id' => 'required|string|unique:properties,parcel_id',
            'address' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'county' => 'nullable|string|max:100',
            'state' => 'nullable|string|size:2',
            'zip_code' => 'nullable|string|max:10',
            'status' => 'nullable|in:active,pending,redeemed,barment,quiet_title,sheriff_sale,reo,sold,leased,archived',
            'workflow_stage' => 'nullable|in:research,tax_appeal,fifa_import,fifa_processing,sheriff,redemption,barment,quiet_title,auction,reo_disposition,reo_leased,completed,surplus',
            'purchase_price' => 'nullable|numeric|min:0',
            'current_value' => 'nullable|numeric|min:0',
            'assessed_value' => 'nullable|numeric|min:0',
            'roi' => 'nullable|numeric',
            'total_shares' => 'nullable|integer|min:0',
            'available_shares' => 'nullable|integer|min:0',
            'price_per_share' => 'nullable|numeric|min:0',
            'purchase_date' => 'nullable|date',
            'redemption_deadline' => 'nullable|date',
            'description' => 'nullable|string',
            'legal_description' => 'nullable|string',
            'zoning' => 'nullable|string|max:100',
            'lot_size' => 'nullable|string|max:100',
            'year_built' => 'nullable|string|max:4',
        ];
    }
}
