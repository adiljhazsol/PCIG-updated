<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AssignPropertyToFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fund_id' => 'required|exists:funds,id',
            'property_id' => 'required|exists:properties,id',
            'allocation_percentage' => 'required|numeric|min:0|max:100',
        ];
    }
}
