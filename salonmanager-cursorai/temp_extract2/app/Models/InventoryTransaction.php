<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class InventoryTransaction extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'reason',
        'performed_by',
        'notes',
        'reference_id',
        'reference_type',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'quantity', 'reason', 'performed_by', 'notes'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function reference()
    {
        return $this->morphTo();
    }

    public function scopeIn($query)
    {
        return $query->where('type', 'in');
    }

    public function scopeOut($query)
    {
        return $query->where('type', 'out');
    }

    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('performed_by', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getTypeTextAttribute()
    {
        return match($this->type) {
            'in' => 'Eingang',
            'out' => 'Ausgang',
            default => 'Unbekannt',
        };
    }

    public function getTypeColorAttribute()
    {
        return match($this->type) {
            'in' => 'green',
            'out' => 'red',
            default => 'gray',
        };
    }

    public function getReasonTextAttribute()
    {
        return match($this->reason) {
            'initial_stock' => 'Anfangsbestand',
            'stock_added' => 'Bestand hinzugefügt',
            'stock_reduced' => 'Bestand reduziert',
            'stock_adjusted' => 'Bestand angepasst',
            'audit_adjustment' => 'Audit-Anpassung',
            'bulk_update' => 'Bulk-Update',
            'appointment_usage' => 'Termin-Verbrauch',
            'damaged' => 'Beschädigt',
            'expired' => 'Abgelaufen',
            'manual' => 'Manuell',
            default => ucfirst(str_replace('_', ' ', $this->reason)),
        };
    }

    public function getFormattedQuantityAttribute()
    {
        $sign = $this->type === 'in' ? '+' : '-';
        return $sign . $this->quantity;
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('d.m.Y H:i');
    }

    public function getFormattedDateAttribute()
    {
        return $this->created_at->format('d.m.Y');
    }

    public function getFormattedTimeAttribute()
    {
        return $this->created_at->format('H:i');
    }

    public function getIsRecentAttribute()
    {
        return $this->created_at->isAfter(now()->subDays(7));
    }

    public function getIsTodayAttribute()
    {
        return $this->created_at->isToday();
    }

    public function getIsThisWeekAttribute()
    {
        return $this->created_at->isAfter(now()->startOfWeek());
    }

    public function getIsThisMonthAttribute()
    {
        return $this->created_at->isAfter(now()->startOfMonth());
    }

    public function getPerformerNameAttribute()
    {
        return $this->user ? $this->user->name : 'Unbekannt';
    }

    public function getProductNameAttribute()
    {
        return $this->inventoryItem->product->name ?? 'Unbekanntes Produkt';
    }

    public function getLocationAttribute()
    {
        return $this->inventoryItem->location ?? 'Kein Standort';
    }

    public function getTotalValueAttribute()
    {
        $productPrice = $this->inventoryItem->product->price ?? 0;
        return $this->quantity * $productPrice;
    }

    public function getFormattedTotalValueAttribute()
    {
        return '€' . number_format($this->total_value, 2);
    }

    public function getReferenceTextAttribute()
    {
        if (!$this->reference) {
            return null;
        }

        return match($this->reference_type) {
            'App\Models\Appointment' => 'Termin #' . $this->reference_id,
            'App\Models\Order' => 'Bestellung #' . $this->reference_id,
            default => $this->reference_type . ' #' . $this->reference_id,
        };
    }

    public function getReferenceUrlAttribute()
    {
        if (!$this->reference) {
            return null;
        }

        return match($this->reference_type) {
            'App\Models\Appointment' => route('appointments.show', $this->reference_id),
            'App\Models\Order' => route('orders.show', $this->reference_id),
            default => null,
        };
    }

    public function getIsAdjustmentAttribute()
    {
        return in_array($this->reason, ['audit_adjustment', 'stock_adjusted']);
    }

    public function getIsAutomaticAttribute()
    {
        return in_array($this->reason, ['appointment_usage', 'bulk_update']);
    }

    public function getIsManualAttribute()
    {
        return in_array($this->reason, ['manual', 'stock_added', 'stock_reduced']);
    }

    public function getImpactOnStockAttribute()
    {
        $beforeQuantity = $this->getBeforeQuantity();
        $afterQuantity = $this->getAfterQuantity();
        
        return [
            'before' => $beforeQuantity,
            'after' => $afterQuantity,
            'change' => $afterQuantity - $beforeQuantity,
            'percentage_change' => $beforeQuantity > 0 ? 
                round((($afterQuantity - $beforeQuantity) / $beforeQuantity) * 100, 2) : 0,
        ];
    }

    private function getBeforeQuantity()
    {
        // Get the quantity before this transaction
        $previousTransaction = $this->inventoryItem->transactions()
            ->where('created_at', '<', $this->created_at)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$previousTransaction) {
            // This is the first transaction, so before quantity is 0
            return 0;
        }

        // Calculate the quantity before this transaction
        $currentQuantity = $this->inventoryItem->quantity;
        $currentTransactionQuantity = $this->type === 'in' ? $this->quantity : -$this->quantity;
        
        return $currentQuantity - $currentTransactionQuantity;
    }

    private function getAfterQuantity()
    {
        return $this->inventoryItem->quantity;
    }

    public function getIsSignificantAttribute()
    {
        $impact = $this->impact_on_stock;
        return abs($impact['percentage_change']) > 10; // More than 10% change
    }

    public function getIsCriticalAttribute()
    {
        $impact = $this->impact_on_stock;
        return $impact['after'] <= 5; // Stock is 5 or less after transaction
    }

    public function getRequiresAttentionAttribute()
    {
        return $this->is_critical || $this->is_significant;
    }

    public function getAttentionLevelAttribute()
    {
        if ($this->is_critical) {
            return 'critical';
        }
        if ($this->is_significant) {
            return 'warning';
        }
        return 'normal';
    }

    public function getAttentionColorAttribute()
    {
        return match($this->attention_level) {
            'critical' => 'red',
            'warning' => 'orange',
            default => 'green',
        };
    }
} 