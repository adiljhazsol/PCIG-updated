<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateDistributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'distribution_date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'property_id' => 'nullable|exists:properties,id',
            'fund_id' => 'nullable|exists:funds,id',
            'investment_id' => 'nullable|exists:investments,id',
            'fund_investment_id' => 'nullable|exists:fund_investments,id',
        ];
    }
}
