<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Salon;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition()
    {
        $startTime = $this->faker->dateTimeBetween('now', '+30 days');
        $service = Service::factory()->create();
        
        return [
            'salon_id' => Salon::factory(),
            'customer_id' => User::factory()->state(['role' => 'customer']),
            'stylist_id' => User::factory()->state(['role' => 'stylist']),
            'service_id' => $service->id,
            'start_time' => $startTime,
            'end_time' => Carbon::parse($startTime)->addMinutes($service->duration),
            'duration' => $service->duration,
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'notes' => $this->faker->optional()->sentence(),
            'price' => $service->price,
            'payment_status' => $this->faker->randomElement(['pending', 'paid', 'failed']),
            'payment_method' => $this->faker->randomElement(['stripe', 'paypal', 'cash', 'sepa']),
            'reminder_sent' => $this->faker->boolean(20),
            'is_recurring' => $this->faker->boolean(10),
            'recurring_pattern' => $this->faker->optional()->randomElement(['daily', 'weekly', 'monthly']),
            'parent_appointment_id' => null,
            'cancellation_reason' => null,
            'cancelled_at' => null,
            'cancelled_by' => null,
        ];
    }

    public function confirmed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'confirmed',
                'payment_status' => 'paid',
            ];
        });
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'payment_status' => 'pending',
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'payment_status' => 'paid',
            ];
        });
    }

    public function cancelled()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $this->faker->sentence(),
            ];
        });
    }

    public function recurring()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_recurring' => true,
                'recurring_pattern' => $this->faker->randomElement(['daily', 'weekly', 'monthly']),
            ];
        });
    }

    public function today()
    {
        return $this->state(function (array $attributes) {
            $today = Carbon::today();
            $startTime = $today->copy()->setHour(rand(9, 17))->setMinute(rand(0, 3) * 15);
            
            return [
                'start_time' => $startTime,
                'end_time' => $startTime->copy()->addMinutes($attributes['duration'] ?? 60),
            ];
        });
    }

    public function tomorrow()
    {
        return $this->state(function (array $attributes) {
            $tomorrow = Carbon::tomorrow();
            $startTime = $tomorrow->copy()->setHour(rand(9, 17))->setMinute(rand(0, 3) * 15);
            
            return [
                'start_time' => $startTime,
                'end_time' => $startTime->copy()->addMinutes($attributes['duration'] ?? 60),
            ];
        });
    }

    public function thisWeek()
    {
        return $this->state(function (array $attributes) {
            $startOfWeek = Carbon::now()->startOfWeek();
            $randomDay = $startOfWeek->copy()->addDays(rand(0, 6));
            $startTime = $randomDay->copy()->setHour(rand(9, 17))->setMinute(rand(0, 3) * 15);
            
            return [
                'start_time' => $startTime,
                'end_time' => $startTime->copy()->addMinutes($attributes['duration'] ?? 60),
            ];
        });
    }

    public function past()
    {
        return $this->state(function (array $attributes) {
            $pastDate = Carbon::now()->subDays(rand(1, 30));
            $startTime = $pastDate->copy()->setHour(rand(9, 17))->setMinute(rand(0, 3) * 15);
            
            return [
                'start_time' => $startTime,
                'end_time' => $startTime->copy()->addMinutes($attributes['duration'] ?? 60),
                'status' => 'completed',
            ];
        });
    }
} 