<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'type' => 'required|in:investment,distribution,sale,purchase,deposit,withdrawal,refund',
            'amount' => 'required|numeric',
            'description' => 'nullable|string|max:500',
            'property_id' => 'nullable|exists:properties,id',
            'fund_id' => 'nullable|exists:funds,id',
            'investment_id' => 'nullable|exists:investments,id',
            'status' => 'nullable|in:pending,completed,failed,cancelled',
            'metadata' => 'nullable|array',
        ];
    }
}
