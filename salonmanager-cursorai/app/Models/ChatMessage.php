<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ChatMessage extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'message_type',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['conversation_id', 'sender_id', 'receiver_id', 'message_type', 'is_read'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
    }

    public function scopeForConversation($query, $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function getMessageTypeIconAttribute()
    {
        return match($this->message_type) {
            'text' => 'chat-bubble-left-right',
            'image' => 'photo',
            'file' => 'document',
            default => 'chat-bubble-left-right',
        };
    }

    public function getIsImageAttribute()
    {
        return $this->message_type === 'image';
    }

    public function getIsFileAttribute()
    {
        return $this->message_type === 'file';
    }

    public function getFileUrlAttribute()
    {
        if ($this->message_type === 'image' || $this->message_type === 'file') {
            return asset('storage/' . $this->message);
        }
        return null;
    }

    public function getFileExtensionAttribute()
    {
        if ($this->message_type === 'file') {
            return pathinfo($this->message, PATHINFO_EXTENSION);
        }
        return null;
    }

    public function getFileSizeAttribute()
    {
        if ($this->message_type === 'file' && file_exists(storage_path('app/public/' . $this->message))) {
            $size = filesize(storage_path('app/public/' . $this->message));
            return $this->formatFileSize($size);
        }
        return null;
    }

    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
} 