<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Carbon\Carbon;

class InventoryItem extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'salon_id',
        'product_id',
        'quantity',
        'location',
        'expiry_date',
        'batch_number',
        'qr_code',
        'notes',
        'minimum_stock',
        'maximum_stock',
        'reorder_point',
        'last_restocked_at',
        'last_audit_at',
    ];

    protected $casts = [
        'expiry_date' => 'datetime',
        'last_restocked_at' => 'datetime',
        'last_audit_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['quantity', 'location', 'expiry_date', 'batch_number', 'notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function scopeLowStock($query)
    {
        return $query->where('quantity', '<=', 5);
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays($days))
            ->where('expiry_date', '>', Carbon::now());
    }

    public function scopeForSalon($query, $salonId)
    {
        return $query->where('salon_id', $salonId);
    }

    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }

    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function getIsLowStockAttribute()
    {
        return $this->quantity <= ($this->minimum_stock ?? 5);
    }

    public function getIsExpiringSoonAttribute()
    {
        if (!$this->expiry_date) {
            return false;
        }
        return $this->expiry_date->isBefore(Carbon::now()->addDays(30));
    }

    public function getIsExpiredAttribute()
    {
        if (!$this->expiry_date) {
            return false;
        }
        return $this->expiry_date->isBefore(Carbon::now());
    }

    public function getStockStatusAttribute()
    {
        if ($this->is_expired) {
            return 'expired';
        }
        if ($this->is_low_stock) {
            return 'low_stock';
        }
        if ($this->is_expiring_soon) {
            return 'expiring_soon';
        }
        return 'normal';
    }

    public function getStockStatusColorAttribute()
    {
        return match($this->stock_status) {
            'expired' => 'red',
            'low_stock' => 'orange',
            'expiring_soon' => 'yellow',
            default => 'green',
        };
    }

    public function getStockStatusTextAttribute()
    {
        return match($this->stock_status) {
            'expired' => 'Abgelaufen',
            'low_stock' => 'Niedriger Bestand',
            'expiring_soon' => 'Läuft bald ab',
            default => 'Normal',
        };
    }

    public function getTotalValueAttribute()
    {
        return $this->quantity * ($this->product->price ?? 0);
    }

    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) {
            return null;
        }
        return Carbon::now()->diffInDays($this->expiry_date, false);
    }

    public function getFormattedExpiryDateAttribute()
    {
        if (!$this->expiry_date) {
            return 'Kein Verfallsdatum';
        }
        return $this->expiry_date->format('d.m.Y');
    }

    public function getFormattedLocationAttribute()
    {
        return $this->location ?: 'Kein Standort angegeben';
    }

    public function getQRCodeUrlAttribute()
    {
        if (!$this->qr_code) {
            return null;
        }
        return route('inventory.generate-qr', $this);
    }

    public function getLastTransactionAttribute()
    {
        return $this->transactions()->latest()->first();
    }

    public function getRecentTransactionsAttribute()
    {
        return $this->transactions()->with('user')->latest()->take(5)->get();
    }

    public function getStockMovementAttribute()
    {
        $recentTransactions = $this->transactions()
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->get();

        $inQuantity = $recentTransactions->where('type', 'in')->sum('quantity');
        $outQuantity = $recentTransactions->where('type', 'out')->sum('quantity');

        return [
            'in' => $inQuantity,
            'out' => $outQuantity,
            'net' => $inQuantity - $outQuantity,
        ];
    }

    public function getAverageMonthlyUsageAttribute()
    {
        $monthlyTransactions = $this->transactions()
            ->where('type', 'out')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->created_at->format('Y-m');
            });

        if ($monthlyTransactions->isEmpty()) {
            return 0;
        }

        $totalUsage = $monthlyTransactions->sum(function($transactions) {
            return $transactions->sum('quantity');
        });

        return round($totalUsage / $monthlyTransactions->count(), 2);
    }

    public function getReorderRecommendationAttribute()
    {
        $averageUsage = $this->average_monthly_usage;
        $currentStock = $this->quantity;
        $reorderPoint = $this->reorder_point ?? ($averageUsage * 0.5);

        if ($currentStock <= $reorderPoint) {
            $recommendedOrder = max($averageUsage * 2, 10);
            return [
                'should_reorder' => true,
                'recommended_quantity' => $recommendedOrder,
                'reason' => 'Bestand unter Nachbestellpunkt',
            ];
        }

        return [
            'should_reorder' => false,
            'recommended_quantity' => 0,
            'reason' => 'Ausreichender Bestand',
        ];
    }

    public function addStock($quantity, $reason = 'manual', $notes = null, $userId = null)
    {
        $this->update([
            'quantity' => $this->quantity + $quantity,
            'last_restocked_at' => now(),
        ]);

        InventoryTransaction::create([
            'inventory_item_id' => $this->id,
            'type' => 'in',
            'quantity' => $quantity,
            'reason' => $reason,
            'performed_by' => $userId ?? auth()->id(),
            'notes' => $notes,
        ]);
    }

    public function removeStock($quantity, $reason = 'manual', $notes = null, $userId = null)
    {
        $actualQuantity = min($quantity, $this->quantity);
        
        $this->update([
            'quantity' => $this->quantity - $actualQuantity,
        ]);

        InventoryTransaction::create([
            'inventory_item_id' => $this->id,
            'type' => 'out',
            'quantity' => $actualQuantity,
            'reason' => $reason,
            'performed_by' => $userId ?? auth()->id(),
            'notes' => $notes,
        ]);

        return $actualQuantity;
    }

    public function audit($actualQuantity, $notes = null, $userId = null)
    {
        $difference = $actualQuantity - $this->quantity;
        
        $this->update([
            'quantity' => $actualQuantity,
            'last_audit_at' => now(),
        ]);

        if ($difference != 0) {
            InventoryTransaction::create([
                'inventory_item_id' => $this->id,
                'type' => $difference > 0 ? 'in' : 'out',
                'quantity' => abs($difference),
                'reason' => 'audit_adjustment',
                'performed_by' => $userId ?? auth()->id(),
                'notes' => $notes ?: "Audit-Anpassung: {$difference}",
            ]);
        }
    }
} 