<?php

namespace App\Console\Commands;

use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserLogOut extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logout-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically logs out employees who have not checked out by the end of their shift.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('user-logout cron started');
        DB::beginTransaction();
        try {
            $today = Carbon::today('UTC');
            $attendances = Attendance::whereDate('date', $today->toDateString())
                ->whereNull('time_out') // Only select records without a check-out
                ->with('employeeSchedule.schedule')
                ->get();

            foreach ($attendances as $attendance) {
                $schedule = $attendance->employeeSchedule->schedule;

                if (!$schedule) {
                    Log::warning("Attendance ID {$attendance->id} has no associated schedule.");
                    continue;
                }

                $shiftStart = Carbon::parse($schedule->start_time)->setTimezone('UTC');
                $shiftEnd = Carbon::parse($schedule->end_time)->setTimezone('UTC');

                // Handle cross-date shifts
                if ($shiftEnd->lt($shiftStart)) {
                    $shiftEnd->addDay();
                }

                $currentTime = Carbon::now('UTC');

                if ($currentTime->greaterThanOrEqualTo($shiftEnd)) {
                    $checkIn = Carbon::parse($attendance->time_in)->setTimezone('UTC');
                    $attendance->time_out = $shiftEnd->toTimeString();

                    // Calculate total minutes worked
                    $totalMinutesWorked = $shiftEnd->diffInMinutes($checkIn);
                    $attendance->working_hours = round($totalMinutesWorked / 60, 2);
                    $attendance->save();

                    Log::info("Employee ID {$attendance->employee_id} auto-logged out for Attendance ID {$attendance->id}.");
                }
            }

            DB::commit();
            Log::info('User logout cron completed successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error during user auto-logout: ' . $e->getMessage());
        }

        Log::info('user-logout cron ended');
        return 0; // Return 0 for success
    }
}
