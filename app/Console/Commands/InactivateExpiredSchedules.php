<?php

namespace App\Console\Commands;

use App\Classes\StatusEnum;
use App\Models\Company\Schedule;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InactivateExpiredSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inactivate-expired-schedules';

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
        Log::info('inactivate-expired-schedules cron start');

        DB::beginTransaction();
        try {
            // Get the current date
            $today = Carbon::today();

            // Find schedules where the end_date is today or in the past, and they are still active
            $expiredSchedules = Schedule::where('end_date', '<=', $today)
                ->where('schedule_active', StatusEnum::SCHEDULE_ACTIVE)
                ->get();

            foreach ($expiredSchedules as $schedule) {
                // Inactivate the schedule
                $schedule->update([
                    'schedule_active' => StatusEnum::SCHEDULE_INACTIVE,
                ]);
            }

            DB::commit();
            Log::info('Expired schedules inactivated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error in inactivating schedules: ' . $e->getMessage());
        }

        Log::info('inactivate-expired-schedules cron end');
        // Return an integer status (0 = success)
        return 0;
    }
}
