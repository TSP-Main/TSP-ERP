<?php

namespace App\Console;

use App\Http\Controllers\Api\Schedule\ScheduleController;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\File;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();

        // Get today's date for the directory
        $date = Carbon::now()->format('Y-m-d');
        $directoryPath = storage_path('logs/cron/' . $date);
        // Ensure the directory exists
        if (!File::exists($directoryPath)) {
            File::makeDirectory($directoryPath, 0755, true);
        }

        // Define an array of commands and their scheduling methods
        $commands = [
            'inactivate-expired-schedules' => 'daily',
            'activate-schedules' => 'daily',
            'user-logout' => 'hourly'
        ];

        foreach ($commands as $command => $scheduleMethod) {
            // Generate a unique filename for each command
            $filename = $command . '-' . Carbon::now()->format('Y-m-d_H-i-s') . '.txt';
            $filePath = $directoryPath . '/' . $filename;

            // Schedule the command with a dynamically generated filename
            $schedule->command($command)->{$scheduleMethod}()->sendOutputTo($filePath);
        }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
