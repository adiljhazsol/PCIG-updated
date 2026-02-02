<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FundResource extends JsonResource
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
            'fund_code' => $this->fund_code,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'min_investment' => (float) $this->min_investment,
            'current_nav' => (float) $this->current_nav,
            'total_assets' => (float) $this->total_assets,
            'total_shares' => $this->total_shares,
            'available_shares' => $this->available_shares,
            'price_per_share' => (float) $this->price_per_share,
            'status' => $this->status,
            'strategy' => $this->strategy,
            'target_irr' => $this->target_irr,
            'lock_up_period' => $this->lock_up_period,
            'performance_metric' => (float) $this->performance_metric,
            'management_fee' => (float) $this->management_fee,
            'performance_fee' => (float) $this->performance_fee,
            'cap' => (float) $this->cap,
            'prospectus_url' => $this->prospectus_path ? asset('storage/' . $this->prospectus_path) : null,
            'term_sheet_url' => $this->term_sheet_path ? asset('storage/' . $this->term_sheet_path) : null,
            'image_url' => $this->image_path ? asset('storage/' . $this->image_path) : null,
            'launch_date' => $this->launch_date?->format('Y-m-d'),
            'close_date' => $this->close_date?->format('Y-m-d'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
