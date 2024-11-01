<?php

namespace App\Console\Commands;

use App\Classes\StatusEnum;
use App\Models\Company\Schedule;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActivateSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activate-schedules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('activate-schedules cron start');

        DB::beginTransaction();
        try {
            // Get the current date
            $today = Carbon::today();

            // Find schedules where the start_date is today and they are inactive
            $schedulesToActivate = Schedule::where('start_date', $today)
                ->where('schedule_active', StatusEnum::SCHEDULE_INACTIVE)
                ->get();

            foreach ($schedulesToActivate as $schedule) {
                // Activate the schedule
                $schedule->update([
                    'schedule_active' => StatusEnum::SCHEDULE_ACTIVE,
                ]);
            }

            DB::commit();
            Log::info('Schedules activated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error in activating schedules: ' . $e->getMessage());
        }

        Log::info('activate-schedules cron end');
        return 0; // Return 0 for success
    }
}
