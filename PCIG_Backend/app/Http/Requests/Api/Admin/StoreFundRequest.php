<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string',
            'description' => 'nullable|string',
            'min_investment' => 'nullable|numeric|min:0',
            'current_nav' => 'nullable|numeric|min:0',
            'total_assets' => 'nullable|numeric|min:0',
            'total_shares' => 'nullable|integer|min:0',
            'available_shares' => 'nullable|integer|min:0',
            'price_per_share' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:open,closed,fully_subscribed,coming_soon,liquidating',
            'launch_date' => 'nullable|date',
            'close_date' => 'nullable|date',
            'strategy' => 'nullable|string|max:100',
            'target_irr' => 'nullable|string|max:50',
            'lock_up_period' => 'nullable|string|max:50',
            'performance_metric' => 'nullable|numeric',
            'management_fee' => 'nullable|numeric|min:0',
            'performance_fee' => 'nullable|numeric|min:0',
            'cap' => 'nullable|numeric|min:0',
            'prospectus' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB
            'term_sheet' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // Max 5MB
            'fund_code' => 'required|string|max:50|unique:funds,fund_code',
        ];
    }
}
