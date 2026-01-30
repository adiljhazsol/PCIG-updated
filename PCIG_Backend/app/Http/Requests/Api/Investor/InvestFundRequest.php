<?php

namespace App\Http\Requests\Api\Investor;

use Illuminate\Foundation\Http\FormRequest;

class InvestFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->route('id')) {
            $this->merge(['fund_id' => $this->route('id')]);
        }
    }

    public function rules(): array
    {
        return [
            'fund_id' => 'required|exists:funds,id',
            'amount' => 'required|numeric|min:1000',
        ];
    }
}
