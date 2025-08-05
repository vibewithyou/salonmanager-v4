<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalonSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('salons')->insert([
            [
                'name' => 'Barbershop Berlin',
                'address' => 'Alexanderplatz 1',
                'city' => 'Berlin',
                'price_range_min' => 15.00,
                'price_range_max' => 50.00,
                'latitude' => 52.521918,
                'longitude' => 13.413215,
                'has_free_appointments' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Salon Elegance',
                'address' => 'Marktstraße 5',
                'city' => 'Leipzig',
                'price_range_min' => 25.00,
                'price_range_max' => 70.00,
                'latitude' => 51.339695,
                'longitude' => 12.373075,
                'has_free_appointments' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
