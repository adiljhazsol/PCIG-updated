<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'status' => $this->status,
            'reference_number' => $this->reference_number,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toIso8601String(),
            'property' => $this->when($this->property_id, function () {
                return [
                    'id' => $this->property_id,
                    'address' => $this->property ? $this->property->address : null,
                ];
            }),
            'fund' => $this->when($this->fund_id, function () {
                return [
                    'id' => $this->fund_id,
                    'name' => $this->fund ? $this->fund->name : null,
                ];
            }),
        ];
    }
}
