<?php

namespace Database\Factories;

use App\Models\Rack;
use Illuminate\Database\Eloquent\Factories\Factory;

class BinFactory extends Factory
{
    public function definition(): array
    {
        return [
            'rack_id' => Rack::factory(),
            'code' => $this->faker->unique()->bothify('BIN-###'),
        ];
    }
}