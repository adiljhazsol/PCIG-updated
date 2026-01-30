<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
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
            'parcel_id' => $this->parcel_id,
            'address' => $this->address,
            'city' => $this->city,
            'county' => $this->county,
            'state' => $this->state,
            'zip_code' => $this->zip_code,
            'status' => $this->status,
            'workflow_stage' => $this->workflow_stage,
            'purchase_price' => (float) $this->purchase_price,
            'current_value' => (float) $this->current_value,
            'roi' => (float) $this->roi,
            'total_shares' => $this->total_shares,
            'available_shares' => $this->available_shares,
            'price_per_share' => (float) $this->price_per_share,
            'purchase_date' => $this->purchase_date?->format('Y-m-d'),
            'redemption_deadline' => $this->redemption_deadline?->format('Y-m-d'),
            'description' => $this->description,
            'primary_image' => $this->primaryImage?->file_path,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'reo_property' => $this->whenLoaded('reoProperty'),
            'auction' => $this->whenLoaded('auction'),
            'reo_lease' => $this->whenLoaded('reoLease'),
        ];
    }
}
