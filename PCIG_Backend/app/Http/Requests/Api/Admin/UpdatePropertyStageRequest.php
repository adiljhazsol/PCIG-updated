<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workflow_stage' => 'required|in:research,tax_appeal,fifa_import,fifa_processing,sheriff,redemption,barment,quiet_title,auction,reo_disposition,reo_leased,completed,surplus',
        ];
    }
}
