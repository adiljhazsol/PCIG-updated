<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $fundId = $this->route('id');
        
        return [
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', Rule::unique('funds', 'slug')->ignore($fundId)],
            'description' => 'nullable|string',
            'min_investment' => 'nullable|numeric|min:0',
            'current_nav' => 'nullable|numeric|min:0',
            'total_assets' => 'nullable|numeric|min:0',
            'total_shares' => 'nullable|integer|min:0',
            'available_shares' => 'nullable|integer|min:0',
            'price_per_share' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:open,closed,fully_subscribed',
            'launch_date' => 'nullable|date',
            'close_date' => 'nullable|date',
            'strategy' => 'nullable|string|max:100',
            'target_irr' => 'nullable|string|max:50',
            'lock_up_period' => 'nullable|string|max:50',
            'performance_metric' => 'nullable|numeric',
            'management_fee' => 'nullable|numeric|min:0',
            'cap' => 'nullable|numeric|min:0',
        ];
    }
}
