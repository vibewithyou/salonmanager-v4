<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Appointment;

class AppointmentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Termin-Erinnerung: ' . $this->appointment->service->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-reminder',
            with: [
                'appointment' => $this->appointment,
                'customer' => $this->appointment->customer,
                'stylist' => $this->appointment->stylist,
                'service' => $this->appointment->service,
                'salon' => $this->appointment->salon,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
} 