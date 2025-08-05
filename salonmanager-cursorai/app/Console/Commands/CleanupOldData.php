<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\ChatMessage;
use Carbon\Carbon;

class CleanupOldData extends Command
{
    protected $signature = 'data:cleanup {--days=90} {--force}';
    protected $description = 'Clean up old data from the database';

    public function handle()
    {
        $days = $this->option('days');
        $force = $this->option('force');
        
        $this->info("Cleaning up data older than {$days} days...");

        $cutoffDate = Carbon::now()->subDays($days);

        // Clean up old appointments
        $oldAppointments = Appointment::where('start_time', '<', $cutoffDate)
            ->where('status', 'completed')
            ->count();

        if ($oldAppointments > 0) {
            if ($force || $this->confirm("Delete {$oldAppointments} old completed appointments?")) {
                Appointment::where('start_time', '<', $cutoffDate)
                    ->where('status', 'completed')
                    ->delete();
                $this->info("Deleted {$oldAppointments} old appointments.");
            }
        }

        // Clean up old notifications
        $oldNotifications = Notification::where('created_at', '<', $cutoffDate)
            ->whereNotNull('read_at')
            ->count();

        if ($oldNotifications > 0) {
            if ($force || $this->confirm("Delete {$oldNotifications} old read notifications?")) {
                Notification::where('created_at', '<', $cutoffDate)
                    ->whereNotNull('read_at')
                    ->delete();
                $this->info("Deleted {$oldNotifications} old notifications.");
            }
        }

        // Clean up old chat messages
        $oldChatMessages = ChatMessage::where('created_at', '<', $cutoffDate)
            ->count();

        if ($oldChatMessages > 0) {
            if ($force || $this->confirm("Delete {$oldChatMessages} old chat messages?")) {
                ChatMessage::where('created_at', '<', $cutoffDate)->delete();
                $this->info("Deleted {$oldChatMessages} old chat messages.");
            }
        }

        // Clean up old activity logs (if using spatie/activitylog)
        if (class_exists('\Spatie\Activitylog\Models\Activity')) {
            $oldActivities = \Spatie\Activitylog\Models\Activity::where('created_at', '<', $cutoffDate)->count();
            
            if ($oldActivities > 0) {
                if ($force || $this->confirm("Delete {$oldActivities} old activity logs?")) {
                    \Spatie\Activitylog\Models\Activity::where('created_at', '<', $cutoffDate)->delete();
                    $this->info("Deleted {$oldActivities} old activity logs.");
                }
            }
        }

        $this->info('Cleanup completed successfully!');
    }
} 