<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Service;
use App\Jobs\SendAppointmentReminder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentService
{
    public function createAppointment(array $data)
    {
        return DB::transaction(function () use ($data) {
            $service = Service::findOrFail($data['service_id']);
            $startTime = Carbon::parse($data['start_time']);
            $endTime = $startTime->copy()->addMinutes($service->duration);

            // Check for conflicts
            $conflicts = $this->checkConflicts(
                $data['stylist_id'] ?? null,
                $startTime,
                $endTime,
                $data['salon_id']
            );

            if (!empty($conflicts)) {
                throw new \Exception('Termin-Konflikt: Der gewählte Zeitraum ist bereits belegt.');
            }

            $appointment = Appointment::create([
                'salon_id' => $data['salon_id'],
                'customer_id' => $data['customer_id'],
                'stylist_id' => $data['stylist_id'] ?? $this->assignStylist($data['salon_id'], $startTime),
                'service_id' => $service->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $service->duration,
                'status' => $data['status'] ?? 'pending',
                'notes' => $data['notes'] ?? null,
                'price' => $service->price,
                'payment_status' => $data['payment_status'] ?? 'pending',
                'payment_method' => $data['payment_method'] ?? null,
                'is_recurring' => $data['is_recurring'] ?? false,
                'recurring_pattern' => $data['recurring_pattern'] ?? null,
            ]);

            // Create recurring appointments if needed
            if ($appointment->is_recurring && isset($data['recurring_count'])) {
                $this->createRecurringAppointments($appointment, $data['recurring_count']);
            }

            // Schedule reminder
            $this->scheduleReminder($appointment);

            return $appointment;
        });
    }

    public function updateAppointment(Appointment $appointment, array $data)
    {
        return DB::transaction(function () use ($appointment, $data) {
            $startTime = isset($data['start_time']) ? Carbon::parse($data['start_time']) : $appointment->start_time;
            $service = isset($data['service_id']) ? Service::findOrFail($data['service_id']) : $appointment->service;
            $endTime = $startTime->copy()->addMinutes($service->duration);

            // Check for conflicts (excluding current appointment)
            $conflicts = $this->checkConflicts(
                $data['stylist_id'] ?? $appointment->stylist_id,
                $startTime,
                $endTime,
                $appointment->salon_id,
                $appointment->id
            );

            if (!empty($conflicts)) {
                throw new \Exception('Termin-Konflikt: Der gewählte Zeitraum ist bereits belegt.');
            }

            $appointment->update([
                'stylist_id' => $data['stylist_id'] ?? $appointment->stylist_id,
                'service_id' => $service->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $service->duration,
                'notes' => $data['notes'] ?? $appointment->notes,
                'price' => $service->price,
            ]);

            return $appointment;
        });
    }

    public function cancelAppointment(Appointment $appointment, $reason = null, $cancelledBy = null)
    {
        return DB::transaction(function () use ($appointment, $reason, $cancelledBy) {
            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
                'cancelled_by' => $cancelledBy,
            ]);

            // Cancel recurring appointments
            if ($appointment->is_recurring) {
                Appointment::where('parent_appointment_id', $appointment->id)
                    ->where('status', '!=', 'cancelled')
                    ->update([
                        'status' => 'cancelled',
                        'cancellation_reason' => 'Storniert aufgrund der Stornierung des Haupttermins',
                        'cancelled_at' => now(),
                        'cancelled_by' => $cancelledBy,
                    ]);
            }

            return $appointment;
        });
    }

    public function confirmAppointment(Appointment $appointment)
    {
        $appointment->update(['status' => 'confirmed']);
        return $appointment;
    }

    public function completeAppointment(Appointment $appointment)
    {
        $appointment->update(['status' => 'completed']);
        return $appointment;
    }

    public function getAvailableSlots($stylistId, $serviceId, $date)
    {
        $service = Service::findOrFail($serviceId);
        $stylist = User::findOrFail($stylistId);
        $requestedDate = Carbon::parse($date);
        
        // Get salon opening hours
        $openingHours = $stylist->salon->opening_hours;
        $dayOfWeek = strtolower($requestedDate->format('l'));
        
        if (!isset($openingHours[$dayOfWeek]) || $openingHours[$dayOfWeek] === 'closed') {
            return [];
        }

        $openingTime = Carbon::parse($openingHours[$dayOfWeek][0]);
        $closingTime = Carbon::parse($openingHours[$dayOfWeek][1]);
        
        $slots = [];
        $currentTime = $requestedDate->copy()->setTimeFrom($openingTime);
        $endTime = $requestedDate->copy()->setTimeFrom($closingTime)->subMinutes($service->duration);

        while ($currentTime <= $endTime) {
            $slotEndTime = $currentTime->copy()->addMinutes($service->duration);
            
            // Check if slot is available
            $conflicts = $this->checkConflicts($stylistId, $currentTime, $slotEndTime, $stylist->salon_id);
            
            if (empty($conflicts)) {
                $slots[] = [
                    'time' => $currentTime->format('H:i'),
                    'available' => true,
                    'duration' => $service->duration,
                ];
            }

            $currentTime->addMinutes(15); // 15-minute intervals
        }

        return $slots;
    }

    private function checkConflicts($stylistId, $startTime, $endTime, $salonId, $excludeAppointmentId = null)
    {
        $query = Appointment::where('salon_id', $salonId)
            ->where('stylist_id', $stylistId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q) use ($startTime, $endTime) {
                      $q->where('start_time', '<', $startTime)
                        ->where('end_time', '>', $endTime);
                  });
            });

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        return $query->get();
    }

    private function assignStylist($salonId, $startTime)
    {
        // Find stylist with least appointments on that day
        $stylists = User::where('salon_id', $salonId)
            ->where('role', 'stylist')
            ->where('is_active', true)
            ->get();

        $stylistWorkload = [];
        foreach ($stylists as $stylist) {
            $appointmentCount = Appointment::where('stylist_id', $stylist->id)
                ->whereDate('start_time', $startTime->toDateString())
                ->where('status', '!=', 'cancelled')
                ->count();
            
            $stylistWorkload[$stylist->id] = $appointmentCount;
        }

        if (empty($stylistWorkload)) {
            throw new \Exception('Kein verfügbarer Stylist gefunden.');
        }

        return array_keys($stylistWorkload, min($stylistWorkload))[0];
    }

    private function createRecurringAppointments(Appointment $parentAppointment, $count)
    {
        $pattern = $parentAppointment->recurring_pattern;
        $currentDate = Carbon::parse($parentAppointment->start_time);
        
        for ($i = 1; $i < $count; $i++) {
            switch ($pattern) {
                case 'daily':
                    $nextDate = $currentDate->copy()->addDays($i);
                    break;
                case 'weekly':
                    $nextDate = $currentDate->copy()->addWeeks($i);
                    break;
                case 'monthly':
                    $nextDate = $currentDate->copy()->addMonths($i);
                    break;
                default:
                    continue 2;
            }

            // Check if the stylist is available
            $conflicts = $this->checkConflicts(
                $parentAppointment->stylist_id,
                $nextDate,
                $nextDate->copy()->addMinutes($parentAppointment->duration),
                $parentAppointment->salon_id
            );

            if (empty($conflicts)) {
                Appointment::create([
                    'salon_id' => $parentAppointment->salon_id,
                    'customer_id' => $parentAppointment->customer_id,
                    'stylist_id' => $parentAppointment->stylist_id,
                    'service_id' => $parentAppointment->service_id,
                    'start_time' => $nextDate,
                    'end_time' => $nextDate->copy()->addMinutes($parentAppointment->duration),
                    'duration' => $parentAppointment->duration,
                    'status' => 'pending',
                    'notes' => $parentAppointment->notes,
                    'price' => $parentAppointment->price,
                    'payment_status' => 'pending',
                    'is_recurring' => true,
                    'recurring_pattern' => $pattern,
                    'parent_appointment_id' => $parentAppointment->id,
                ]);
            }
        }
    }

    private function scheduleReminder(Appointment $appointment)
    {
        $reminderTime = $appointment->start_time->subHours(24);
        
        if ($reminderTime->isFuture()) {
            SendAppointmentReminder::dispatch($appointment)
                ->delay($reminderTime);
        }
    }

    public function getAppointmentStats($salonId, $dateRange = null)
    {
        $query = Appointment::where('salon_id', $salonId);
        
        if ($dateRange) {
            $query->whereBetween('start_time', $dateRange);
        }

        return [
            'total' => $query->count(),
            'confirmed' => $query->where('status', 'confirmed')->count(),
            'completed' => $query->where('status', 'completed')->count(),
            'cancelled' => $query->where('status', 'cancelled')->count(),
            'pending' => $query->where('status', 'pending')->count(),
        ];
    }

    public function getStylistSchedule($stylistId, $date)
    {
        return Appointment::where('stylist_id', $stylistId)
            ->whereDate('start_time', $date)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->with(['customer', 'service'])
            ->get();
    }
} 