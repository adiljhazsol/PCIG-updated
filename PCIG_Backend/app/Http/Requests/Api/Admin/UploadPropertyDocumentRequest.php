<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadPropertyDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:20480',
            'type' => 'required|string|max:100',
        ];
    }
}
