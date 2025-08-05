<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salon;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use Carbon\Carbon;

class SalonSeeder extends Seeder
{
    public function run()
    {
        // Create sample salons
        $salons = [
            [
                'name' => 'Barber Bros Leipzig',
                'description' => 'Moderner Barbershop im Herzen von Leipzig',
                'address' => 'Grimmaische Straße 1, 04109 Leipzig',
                'phone' => '+49 341 123456',
                'email' => 'info@barberbros-leipzig.de',
                'website' => 'https://barberbros-leipzig.de',
                'opening_hours' => [
                    'monday' => ['09:00', '18:00'],
                    'tuesday' => ['09:00', '18:00'],
                    'wednesday' => ['09:00', '18:00'],
                    'thursday' => ['09:00', '18:00'],
                    'friday' => ['09:00', '18:00'],
                    'saturday' => ['09:00', '16:00'],
                    'sunday' => ['closed'],
                ],
                'category' => 'barbershop',
                'is_active' => true,
                'is_featured' => true,
                'rating' => 4.8,
                'review_count' => 127,
            ],
            [
                'name' => 'Cut & Style Berlin',
                'description' => 'Stylish Hair Salon in Berlin Mitte',
                'address' => 'Friedrichstraße 123, 10117 Berlin',
                'phone' => '+49 30 987654',
                'email' => 'hello@cutandstyle-berlin.de',
                'website' => 'https://cutandstyle-berlin.de',
                'opening_hours' => [
                    'monday' => ['10:00', '19:00'],
                    'tuesday' => ['10:00', '19:00'],
                    'wednesday' => ['10:00', '19:00'],
                    'thursday' => ['10:00', '19:00'],
                    'friday' => ['10:00', '19:00'],
                    'saturday' => ['10:00', '17:00'],
                    'sunday' => ['closed'],
                ],
                'category' => 'hairsalon',
                'is_active' => true,
                'is_featured' => false,
                'rating' => 4.6,
                'review_count' => 89,
            ],
            [
                'name' => 'Haarwerk Hamburg',
                'description' => 'Kreative Frisuren und Styling in Hamburg',
                'address' => 'Mönckebergstraße 45, 20095 Hamburg',
                'phone' => '+49 40 555123',
                'email' => 'kontakt@haarwerk-hamburg.de',
                'website' => 'https://haarwerk-hamburg.de',
                'opening_hours' => [
                    'monday' => ['09:00', '18:00'],
                    'tuesday' => ['09:00', '18:00'],
                    'wednesday' => ['09:00', '18:00'],
                    'thursday' => ['09:00', '18:00'],
                    'friday' => ['09:00', '18:00'],
                    'saturday' => ['09:00', '15:00'],
                    'sunday' => ['closed'],
                ],
                'category' => 'hairsalon',
                'is_active' => true,
                'is_featured' => true,
                'rating' => 4.9,
                'review_count' => 203,
            ],
        ];

        foreach ($salons as $salonData) {
            $salon = Salon::create($salonData);

            // Create owner for each salon
            $owner = User::create([
                'name' => 'Salon Owner',
                'email' => 'owner@' . strtolower(str_replace(' ', '', $salon->name)) . '.de',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'salon_id' => $salon->id,
                'phone' => $salon->phone,
                'is_active' => true,
            ]);

            // Create stylists for each salon
            $stylists = [
                ['name' => 'Max Mustermann', 'email' => 'max@' . strtolower(str_replace(' ', '', $salon->name)) . '.de'],
                ['name' => 'Anna Schmidt', 'email' => 'anna@' . strtolower(str_replace(' ', '', $salon->name)) . '.de'],
                ['name' => 'Tom Weber', 'email' => 'tom@' . strtolower(str_replace(' ', '', $salon->name)) . '.de'],
            ];

            foreach ($stylists as $stylistData) {
                User::create([
                    'name' => $stylistData['name'],
                    'email' => $stylistData['email'],
                    'password' => bcrypt('password'),
                    'role' => 'stylist',
                    'salon_id' => $salon->id,
                    'phone' => '+49 123 456789',
                    'is_active' => true,
                ]);
            }

            // Create services for each salon
            $services = [
                [
                    'name' => 'Herrenhaarschnitt',
                    'description' => 'Professioneller Herrenhaarschnitt mit Waschen und Styling',
                    'price' => 25.00,
                    'duration' => 45,
                    'category' => 'herren',
                ],
                [
                    'name' => 'Damenhaarschnitt',
                    'description' => 'Stylish Damenhaarschnitt mit Beratung und Styling',
                    'price' => 35.00,
                    'duration' => 60,
                    'category' => 'damen',
                ],
                [
                    'name' => 'Färben',
                    'description' => 'Professionelle Haarfärbung mit hochwertigen Produkten',
                    'price' => 65.00,
                    'duration' => 120,
                    'category' => 'farben',
                ],
                [
                    'name' => 'Bartpflege',
                    'description' => 'Traditionelle Bartpflege mit heißem Handtuch',
                    'price' => 15.00,
                    'duration' => 30,
                    'category' => 'herren',
                ],
                [
                    'name' => 'Glätten',
                    'description' => 'Professionelles Haarglättung für glänzendes Haar',
                    'price' => 45.00,
                    'duration' => 90,
                    'category' => 'styling',
                ],
            ];

            foreach ($services as $serviceData) {
                Service::create(array_merge($serviceData, ['salon_id' => $salon->id]));
            }

            // Create sample customers
            $customers = [
                ['name' => 'Lisa Müller', 'email' => 'lisa.mueller@example.com'],
                ['name' => 'Peter Schulz', 'email' => 'peter.schulz@example.com'],
                ['name' => 'Maria Fischer', 'email' => 'maria.fischer@example.com'],
                ['name' => 'Hans Meyer', 'email' => 'hans.meyer@example.com'],
                ['name' => 'Sarah Wagner', 'email' => 'sarah.wagner@example.com'],
            ];

            foreach ($customers as $customerData) {
                User::create([
                    'name' => $customerData['name'],
                    'email' => $customerData['email'],
                    'password' => bcrypt('password'),
                    'role' => 'customer',
                    'salon_id' => $salon->id,
                    'phone' => '+49 123 456789',
                    'is_active' => true,
                ]);
            }

            // Create sample appointments
            $stylists = User::where('salon_id', $salon->id)->where('role', 'stylist')->get();
            $customers = User::where('salon_id', $salon->id)->where('role', 'customer')->get();
            $services = Service::where('salon_id', $salon->id)->get();

            for ($i = 0; $i < 20; $i++) {
                $startTime = Carbon::now()->addDays(rand(1, 30))->setHour(rand(9, 17))->setMinute(rand(0, 3) * 15);
                $service = $services->random();
                $endTime = $startTime->copy()->addMinutes($service->duration);

                Appointment::create([
                    'salon_id' => $salon->id,
                    'customer_id' => $customers->random()->id,
                    'stylist_id' => $stylists->random()->id,
                    'service_id' => $service->id,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'duration' => $service->duration,
                    'status' => ['confirmed', 'pending', 'completed'][rand(0, 2)],
                    'price' => $service->price,
                    'payment_status' => ['paid', 'pending'][rand(0, 1)],
                    'payment_method' => ['stripe', 'cash', 'paypal'][rand(0, 2)],
                ]);
            }
        }
    }
} 