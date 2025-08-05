<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send appointment reminders daily at 9 AM
        $schedule->command('appointments:send-reminders')
            ->dailyAt('09:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Clean up old data weekly
        $schedule->command('data:cleanup')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Backup database daily
        $schedule->command('backup:run')
            ->daily()
            ->at('01:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Generate analytics reports weekly
        $schedule->command('analytics:generate-reports')
            ->weekly()
            ->mondays()
            ->at('06:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Send promotional notifications (if configured)
        $schedule->command('notifications:send-promotional')
            ->weekly()
            ->fridays()
            ->at('10:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Update salon ratings monthly
        $schedule->command('salons:update-ratings')
            ->monthly()
            ->at('03:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Clean up old notifications
        $schedule->command('notifications:cleanup')
            ->daily()
            ->at('04:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Process failed payments
        $schedule->command('payments:process-failed')
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground();

        // Sync with external calendars
        $schedule->command('calendar:sync')
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Generate invoice reminders
        $schedule->command('invoices:send-reminders')
            ->daily()
            ->at('08:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Update customer loyalty points
        $schedule->command('loyalty:update-points')
            ->daily()
            ->at('05:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Send weekly salon reports
        $schedule->command('reports:send-weekly')
            ->weekly()
            ->mondays()
            ->at('07:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Clean up old chat messages
        $schedule->command('chat:cleanup')
            ->weekly()
            ->sundays()
            ->at('03:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Update service availability
        $schedule->command('services:update-availability')
            ->everyTenMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Process AI suggestions
        $schedule->command('ai:process-suggestions')
            ->daily()
            ->at('11:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Sync with payment gateways
        $schedule->command('payments:sync-gateways')
            ->everyThirtyMinutes()
            ->withoutOverlapping()
            ->runInBackground();

        // Generate monthly reports
        $schedule->command('reports:generate-monthly')
            ->monthly()
            ->at('06:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Update PWA cache
        $schedule->command('pwa:update-cache')
            ->daily()
            ->at('02:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Process queue jobs
        $schedule->command('queue:work --stop-when-empty')
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground();

        // Monitor system health
        $schedule->command('system:health-check')
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 