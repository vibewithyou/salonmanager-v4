<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Appointment;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $appointment;
    public $tries = 3;
    public $timeout = 60;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function handle()
    {
        try {
            $notificationController = new NotificationController();
            $notificationController->sendAppointmentReminder($this->appointment);
            
            Log::info('Appointment reminder sent successfully', [
                'appointment_id' => $this->appointment->id,
                'customer_id' => $this->appointment->customer_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send appointment reminder', [
                'appointment_id' => $this->appointment->id,
                'error' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error('Appointment reminder job failed', [
            'appointment_id' => $this->appointment->id,
            'error' => $exception->getMessage(),
        ]);
    }
} 