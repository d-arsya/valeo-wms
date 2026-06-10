<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['IN', 'OUT']);

        return [
            'sparepart_id' => Sparepart::factory(),
            'user_id' => User::factory(),
            'control_id' => $this->faker->unique()->bothify('CTL-####-####'),
            'type' => $type,
            'quantity' => $this->faker->numberBetween(1, 10),
            'remarks' => $this->faker->sentence(),
            'po_number' => $type === 'IN' ? $this->faker->bothify('PO-#####') : null,
            'gr_date' => $type === 'IN' ? $this->faker->date() : null,
            'price_per_unit' => $type === 'IN' ? $this->faker->randomFloat(2, 10, 1000) : null,
            'performed_at' => now(),
        ];
    }
}
