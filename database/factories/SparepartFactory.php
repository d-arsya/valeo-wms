<?php

namespace Database\Factories;

use App\Models\Sparepart;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sparepart>
 */
class SparepartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'material_number' => $this->faker->unique()->bothify('MAT-####-????'),
            'part_name' => $this->faker->words(3, true),
            'specification' => $this->faker->sentence(),
            'brand_id' => \App\Models\Brand::factory(),
            'category_id' => \App\Models\Category::factory(),
            'bin_id' => \App\Models\Bin::factory(),
            'safety_stock' => $this->faker->numberBetween(5, 20),
            'actual_stock' => $this->faker->numberBetween(0, 50),
            'last_po_number' => $this->faker->bothify('PO-#####'),
            'last_supplier' => $this->faker->company(),
            'last_gr_date' => $this->faker->date(),
            'price_per_unit' => $this->faker->randomFloat(2, 10, 1000),
            'status' => 'OK'
        ];
    }
}
