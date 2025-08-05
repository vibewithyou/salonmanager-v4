<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Notification extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'type', 'title', 'read_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function markAsUnread()
    {
        $this->update(['read_at' => null]);
    }

    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    public function getIsUnreadAttribute()
    {
        return is_null($this->read_at);
    }

    public function getTypeIconAttribute()
    {
        return match($this->type) {
            'appointment_reminder' => 'clock',
            'appointment_confirmation' => 'check-circle',
            'appointment_cancellation' => 'x-circle',
            'promotion' => 'gift',
            'general' => 'bell',
            'update' => 'arrow-up-circle',
            default => 'bell',
        };
    }

    public function getTypeColorAttribute()
    {
        return match($this->type) {
            'appointment_reminder' => 'blue',
            'appointment_confirmation' => 'green',
            'appointment_cancellation' => 'red',
            'promotion' => 'purple',
            'general' => 'gray',
            'update' => 'yellow',
            default => 'gray',
        };
    }

    public function getFormattedCreatedAtAttribute()
    {
        $now = now();
        $diff = $now->diffInSeconds($this->created_at);

        if ($diff < 60) {
            return 'Gerade eben';
        } elseif ($diff < 3600) {
            $minutes = floor($diff / 60);
            return "vor {$minutes} " . ($minutes === 1 ? 'Minute' : 'Minuten');
        } elseif ($diff < 86400) {
            $hours = floor($diff / 3600);
            return "vor {$hours} " . ($hours === 1 ? 'Stunde' : 'Stunden');
        } elseif ($diff < 604800) {
            $days = floor($diff / 86400);
            return "vor {$days} " . ($days === 1 ? 'Tag' : 'Tagen');
        } else {
            return $this->created_at->format('d.m.Y H:i');
        }
    }

    public function getShortMessageAttribute()
    {
        $maxLength = 100;
        $message = strip_tags($this->message);
        
        if (strlen($message) <= $maxLength) {
            return $message;
        }
        
        return substr($message, 0, $maxLength) . '...';
    }

    public function getActionUrlAttribute()
    {
        if (isset($this->data['appointment_id'])) {
            return route('appointments.show', $this->data['appointment_id']);
        }
        
        if (isset($this->data['salon_id'])) {
            return route('salon.show', $this->data['salon_id']);
        }
        
        return null;
    }

    public function getActionTextAttribute()
    {
        if (isset($this->data['appointment_id'])) {
            return 'Termin anzeigen';
        }
        
        if (isset($this->data['salon_id'])) {
            return 'Salon anzeigen';
        }
        
        return null;
    }
} 