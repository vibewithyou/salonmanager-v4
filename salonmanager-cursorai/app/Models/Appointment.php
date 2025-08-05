<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Appointment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'salon_id',
        'customer_id',
        'stylist_id',
        'service_id',
        'start_time',
        'end_time',
        'duration',
        'status',
        'notes',
        'price',
        'payment_status',
        'payment_method',
        'reminder_sent',
        'is_recurring',
        'recurring_pattern',
        'parent_appointment_id',
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'reminder_sent' => 'boolean',
        'is_recurring' => 'boolean',
        'recurring_pattern' => 'array',
        'cancelled_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['start_time', 'end_time', 'status', 'price'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function salon()
    {
        return $this->belongsTo(Salon::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function stylist()
    {
        return $this->belongsTo(User::class, 'stylist_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function parentAppointment()
    {
        return $this->belongsTo(Appointment::class, 'parent_appointment_id');
    }

    public function recurringAppointments()
    {
        return $this->hasMany(Appointment::class, 'parent_appointment_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>=', now());
    }

    public function scopePast($query)
    {
        return $query->where('start_time', '<', now());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('start_time', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('start_time', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForStylist($query, $stylistId)
    {
        return $query->where('stylist_id', $stylistId);
    }

    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeForSalon($query, $salonId)
    {
        return $query->where('salon_id', $salonId);
    }

    // Methods
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            'no_show' => 'gray',
            default => 'gray',
        };
    }

    public function getStatusTextAttribute()
    {
        return match($this->status) {
            'pending' => 'Ausstehend',
            'confirmed' => 'Bestätigt',
            'completed' => 'Abgeschlossen',
            'cancelled' => 'Storniert',
            'no_show' => 'Nicht erschienen',
            default => 'Unbekannt',
        };
    }

    public function getPaymentStatusColorAttribute()
    {
        return match($this->payment_status) {
            'pending' => 'yellow',
            'paid' => 'green',
            'failed' => 'red',
            'refunded' => 'gray',
            default => 'gray',
        };
    }

    public function getPaymentStatusTextAttribute()
    {
        return match($this->payment_status) {
            'pending' => 'Ausstehend',
            'paid' => 'Bezahlt',
            'failed' => 'Fehlgeschlagen',
            'refunded' => 'Erstattet',
            default => 'Unbekannt',
        };
    }

    public function getDurationInMinutesAttribute()
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    public function getFormattedTimeAttribute()
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    public function getFormattedDateAttribute()
    {
        return $this->start_time->format('d.m.Y');
    }

    public function getFormattedDateTimeAttribute()
    {
        return $this->start_time->format('d.m.Y H:i');
    }

    public function isUpcoming()
    {
        return $this->start_time->isFuture();
    }

    public function isPast()
    {
        return $this->start_time->isPast();
    }

    public function isToday()
    {
        return $this->start_time->isToday();
    }

    public function isThisWeek()
    {
        return $this->start_time->isBetween(now()->startOfWeek(), now()->endOfWeek());
    }

    public function canBeCancelled()
    {
        return $this->status === 'confirmed' && $this->start_time->isFuture();
    }

    public function canBeRescheduled()
    {
        return in_array($this->status, ['confirmed', 'pending']) && $this->start_time->isFuture();
    }

    public function isRecurring()
    {
        return $this->is_recurring && $this->recurring_pattern;
    }

    public function getRecurringPatternTextAttribute()
    {
        if (!$this->is_recurring) return null;
        
        $pattern = $this->recurring_pattern;
        return match($pattern['type']) {
            'weekly' => 'Wöchentlich',
            'biweekly' => 'Alle 2 Wochen',
            'monthly' => 'Monatlich',
            default => 'Benutzerdefiniert',
        };
    }

    public function cancel($reason = null, $cancelledBy = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
            'cancelled_by' => $cancelledBy,
        ]);

        // Cancel recurring appointments
        if ($this->is_recurring) {
            $this->recurringAppointments()->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_at' => now(),
                'cancelled_by' => $cancelledBy,
            ]);
        }
    }

    public function complete()
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsNoShow()
    {
        $this->update(['status' => 'no_show']);
    }

    public function sendReminder()
    {
        // Send reminder logic here
        $this->update(['reminder_sent' => true]);
    }

    public function getConflicts()
    {
        return static::where('stylist_id', $this->stylist_id)
            ->where('id', '!=', $this->id)
            ->where(function ($query) {
                $query->whereBetween('start_time', [$this->start_time, $this->end_time])
                    ->orWhereBetween('end_time', [$this->start_time, $this->end_time])
                    ->orWhere(function ($q) {
                        $q->where('start_time', '<=', $this->start_time)
                            ->where('end_time', '>=', $this->end_time);
                    });
            })
            ->get();
    }

    public function hasConflicts()
    {
        return $this->getConflicts()->count() > 0;
    }
} 