<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RackFactory extends Factory
{
    public function definition(): array
    {
        return ['code' => $this->faker->unique()->bothify('RACK-##-??')];
    }
}