<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Salon;
use App\Models\Service;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $salon;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->salon = Salon::factory()->create();
        $this->user = User::factory()->create([
            'role' => 'customer',
            'salon_id' => $this->salon->id,
        ]);
        $this->service = Service::factory()->create([
            'salon_id' => $this->salon->id,
        ]);
    }

    public function test_user_can_view_appointments()
    {
        $response = $this->actingAs($this->user)
            ->get(route('appointments.index'));

        $response->assertStatus(200);
        $response->assertViewIs('appointments.index');
    }

    public function test_user_can_create_appointment()
    {
        $appointmentData = [
            'service_id' => $this->service->id,
            'start_time' => Carbon::tomorrow()->setHour(10)->setMinute(0),
            'notes' => 'Test appointment',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertRedirect(route('appointments.index'));
        $this->assertDatabaseHas('appointments', [
            'customer_id' => $this->user->id,
            'service_id' => $this->service->id,
            'notes' => 'Test appointment',
        ]);
    }

    public function test_user_cannot_create_appointment_in_past()
    {
        $appointmentData = [
            'service_id' => $this->service->id,
            'start_time' => Carbon::yesterday(),
            'notes' => 'Test appointment',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertSessionHasErrors(['start_time']);
    }

    public function test_user_can_update_appointment()
    {
        $appointment = Appointment::factory()->create([
            'customer_id' => $this->user->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
        ]);

        $updateData = [
            'notes' => 'Updated notes',
        ];

        $response = $this->actingAs($this->user)
            ->put(route('appointments.update', $appointment), $updateData);

        $response->assertRedirect(route('appointments.show', $appointment));
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'notes' => 'Updated notes',
        ]);
    }

    public function test_user_can_cancel_appointment()
    {
        $appointment = Appointment::factory()->create([
            'customer_id' => $this->user->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect(route('appointments.index'));
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_stylist_can_confirm_appointment()
    {
        $stylist = User::factory()->create([
            'role' => 'stylist',
            'salon_id' => $this->salon->id,
        ]);

        $appointment = Appointment::factory()->create([
            'stylist_id' => $stylist->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($stylist)
            ->patch(route('appointments.confirm', $appointment));

        $response->assertRedirect(route('appointments.show', $appointment));
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_stylist_can_complete_appointment()
    {
        $stylist = User::factory()->create([
            'role' => 'stylist',
            'salon_id' => $this->salon->id,
        ]);

        $appointment = Appointment::factory()->create([
            'stylist_id' => $stylist->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($stylist)
            ->patch(route('appointments.complete', $appointment));

        $response->assertRedirect(route('appointments.show', $appointment));
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    public function test_appointment_conflict_detection()
    {
        $stylist = User::factory()->create([
            'role' => 'stylist',
            'salon_id' => $this->salon->id,
        ]);

        // Create existing appointment
        $existingAppointment = Appointment::factory()->create([
            'stylist_id' => $stylist->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
            'start_time' => Carbon::tomorrow()->setHour(10)->setMinute(0),
            'end_time' => Carbon::tomorrow()->setHour(11)->setMinute(0),
            'status' => 'confirmed',
        ]);

        // Try to create conflicting appointment
        $conflictingData = [
            'stylist_id' => $stylist->id,
            'service_id' => $this->service->id,
            'start_time' => Carbon::tomorrow()->setHour(10)->setMinute(30),
            'notes' => 'Conflicting appointment',
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $conflictingData);

        $response->assertSessionHasErrors();
    }

    public function test_available_slots_endpoint()
    {
        $stylist = User::factory()->create([
            'role' => 'stylist',
            'salon_id' => $this->salon->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('appointments.available-slots', [
                'stylist_id' => $stylist->id,
                'service_id' => $this->service->id,
                'date' => Carbon::tomorrow()->format('Y-m-d'),
            ]));

        $response->assertStatus(200);
        $response->assertJsonStructure(['slots']);
    }

    public function test_recurring_appointment_creation()
    {
        $appointmentData = [
            'service_id' => $this->service->id,
            'start_time' => Carbon::tomorrow()->setHour(10)->setMinute(0),
            'is_recurring' => true,
            'recurring_pattern' => 'weekly',
            'recurring_count' => 4,
        ];

        $response = $this->actingAs($this->user)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertRedirect(route('appointments.index'));
        
        // Check that multiple appointments were created
        $appointments = Appointment::where('customer_id', $this->user->id)
            ->where('is_recurring', true)
            ->get();
        
        $this->assertCount(4, $appointments);
    }

    public function test_appointment_reminder_sending()
    {
        $appointment = Appointment::factory()->create([
            'customer_id' => $this->user->id,
            'salon_id' => $this->salon->id,
            'service_id' => $this->service->id,
            'start_time' => Carbon::tomorrow(),
            'status' => 'confirmed',
            'reminder_sent' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('appointments.send-reminder', $appointment));

        $response->assertStatus(200);
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'reminder_sent' => true,
        ]);
    }
} 