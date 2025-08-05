<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Salon extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'address',
        'city',
        'postal_code',
        'country',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'opening_hours',
        'price_range_min',
        'price_range_max',
        'category',
        'logo',
        'banner',
        'gallery',
        'settings',
        'is_active',
        'is_featured',
        'rating',
        'review_count',
        'owner_id',
        'subscription_plan',
        'subscription_expires_at',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'gallery' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'rating' => 'decimal:1',
        'price_range_min' => 'decimal:2',
        'price_range_max' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'subscription_expires_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'address', 'is_active', 'is_featured'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function stylists()
    {
        return $this->hasMany(User::class)->role('stylist');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function news()
    {
        return $this->hasMany(News::class);
    }

    public function analytics()
    {
        return $this->hasMany(Analytics::class);
    }

    public function backups()
    {
        return $this->hasMany(Backup::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeNearby($query, $latitude, $longitude, $radius = 50)
    {
        return $query->selectRaw('*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance', [$latitude, $longitude, $latitude])
            ->having('distance', '<=', $radius)
            ->orderBy('distance');
    }

    public function scopeInPriceRange($query, $min, $max)
    {
        return $query->where('price_range_min', '>=', $min)
            ->where('price_range_max', '<=', $max);
    }

    public function scopeInCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Methods
    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : asset('images/default-salon-logo.png');
    }

    public function getBannerUrlAttribute()
    {
        return $this->banner ? asset('storage/' . $this->banner) : asset('images/default-salon-banner.jpg');
    }

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery) return [];
        return collect($this->gallery)->map(function ($image) {
            return asset('storage/' . $image);
        })->toArray();
    }

    public function getFullAddressAttribute()
    {
        return $this->address . ', ' . $this->postal_code . ' ' . $this->city . ', ' . $this->country;
    }

    public function getPriceRangeAttribute()
    {
        if ($this->price_range_min && $this->price_range_max) {
            return '€' . $this->price_range_min . ' - €' . $this->price_range_max;
        }
        return 'Preise auf Anfrage';
    }

    public function getOpeningHoursForDay($day)
    {
        return $this->opening_hours[$day] ?? null;
    }

    public function isOpenToday()
    {
        $today = strtolower(now()->format('l'));
        $hours = $this->getOpeningHoursForDay($today);
        return $hours && $hours['open'] && $hours['close'];
    }

    public function getAvailableStylists()
    {
        return $this->stylists()->where('is_active', true)->get();
    }

    public function getUpcomingAppointments()
    {
        return $this->appointments()
            ->where('start_time', '>=', now())
            ->orderBy('start_time')
            ->get();
    }

    public function getTodayAppointments()
    {
        return $this->appointments()
            ->whereDate('start_time', today())
            ->orderBy('start_time')
            ->get();
    }

    public function updateRating()
    {
        $reviews = $this->reviews();
        $avgRating = $reviews->avg('rating');
        $reviewCount = $reviews->count();
        
        $this->update([
            'rating' => $avgRating,
            'review_count' => $reviewCount,
        ]);
    }

    public function hasActiveSubscription()
    {
        return $this->subscription_expires_at && $this->subscription_expires_at->isFuture();
    }

    public function getSubscriptionStatusAttribute()
    {
        if (!$this->subscription_plan) return 'free';
        if ($this->hasActiveSubscription()) return 'active';
        return 'expired';
    }

    public function getSettings($key = null, $default = null)
    {
        if ($key === null) return $this->settings ?? [];
        return data_get($this->settings, $key, $default);
    }

    public function setSettings($key, $value)
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->update(['settings' => $settings]);
    }
} 