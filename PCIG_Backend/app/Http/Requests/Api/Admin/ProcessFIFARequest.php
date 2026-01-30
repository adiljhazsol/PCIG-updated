<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProcessFIFARequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string|max:1000',
            'next_stage' => 'nullable|in:sheriff,redemption,barment,quiet_title',
        ];
    }
}
