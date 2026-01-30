<?php

namespace App\Http\Requests\Api\Investor;

use Illuminate\Foundation\Http\FormRequest;

class InvestPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->route('id')) {
            $this->merge(['property_id' => $this->route('id')]);
        }
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'shares' => 'required|integer|min:1',
        ];
    }
}
