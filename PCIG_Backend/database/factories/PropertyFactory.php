<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'parcel_id' => $this->faker->unique()->numerify('##########'),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'county' => $this->faker->city() . ' County',
            'state' => $this->faker->stateAbbr(),
            'zip_code' => $this->faker->postcode(),
            'status' => $this->faker->randomElement(['active', 'sold', 'closed', 'pending']),
            'workflow_stage' => $this->faker->randomElement(['research', 'acquisition', 'closing', 'rehab', 'marketing']),
            'purchase_price' => $this->faker->randomFloat(2, 50000, 500000),
            'current_value' => $this->faker->randomFloat(2, 60000, 600000),
            'roi' => $this->faker->randomFloat(2, 0, 20),
            'total_shares' => 100,
            'available_shares' => $this->faker->numberBetween(0, 100),
            'price_per_share' => $this->faker->randomFloat(2, 500, 5000),
            'purchase_date' => $this->faker->date(),
        ];
    }
}
