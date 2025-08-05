<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'birth_date',
        'gender',
        'preferences',
        'salon_id',
        'is_active',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birth_date' => 'date',
        'preferences' => 'array',
        'last_login_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function salon()
    {
        return $this->belongsTo(Salon::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'customer_id');
    }

    public function stylistAppointments()
    {
        return $this->hasMany(Appointment::class, 'stylist_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function giftCards()
    {
        return $this->hasMany(GiftCard::class, 'purchased_by');
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
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeStylists($query)
    {
        return $query->role('stylist');
    }

    public function scopeCustomers($query)
    {
        return $query->role('customer');
    }

    public function scopeAdmins($query)
    {
        return $query->role('admin');
    }

    // Methods
    public function isStylist()
    {
        return $this->hasRole('stylist');
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isCustomer()
    {
        return $this->hasRole('customer');
    }

    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7C3AED&background=EBF4FF';
    }

    public function getPreferredLanguageAttribute()
    {
        return $this->preferences['language'] ?? 'de';
    }

    public function getPreferredThemeAttribute()
    {
        return $this->preferences['theme'] ?? 'light';
    }

    public function updateLastLogin()
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);
    }

    public function hasUnreadNotifications()
    {
        return $this->notifications()->where('read_at', null)->exists();
    }

    public function getUnreadNotificationsCount()
    {
        return $this->notifications()->where('read_at', null)->count();
    }
} 