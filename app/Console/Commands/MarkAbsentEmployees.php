<?php

namespace App\Console\Commands;

use App\Classes\StatusEnum;
use App\Models\Company\EmployeeSchedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MarkAbsentEmployees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:mark-absent';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function handle(HttpRequest $request)
    {
        $ipAddress = request()->ip(); // Use request helper to fetch the IP address
        $timezone = getUserTimezone($request);

        DB::beginTransaction();
        try {
            $today = Carbon::now($timezone);
            $employeeSchedules = EmployeeSchedule::whereDate('start_date', '<=', $today)
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })->with('schedule')->get();

            // foreach ($employeeSchedules as $employeeSchedule) {
            //     $shiftEnd = Carbon::parse($employeeSchedule->schedule->end_time, $timezone);

            //     // If shift has ended and no check-in is recorded
            //     $attendance = Attendance::where('employee_id', $employeeSchedule->employee_id)
            //         ->whereDate('date', $today->toDateString())
            //         ->first();
            //     if (!$attendance && $today->gt($shiftEnd)) {
            //         // Mark as absent if no attendance exists for the day
            //         Attendance::create([
            //             'employee_id' => $employeeSchedule->employee_id,
            //             'employee_schedule_id' => $employeeSchedule->id,
            //             'date' => $today->toDateString(),
            //             'status' => StatusEnum::ABSENT,
            //         ]);
            //     }
            // }

            foreach ($employeeSchedules as $employeeSchedule) {
                if (!$employeeSchedule->schedule) {
                    // Skip if no schedule exists for this employee schedule
                    continue;
                }

                $schedule = $employeeSchedule->schedule;

                if (!$schedule->start_time || !$schedule->end_time) {
                    // Skip if start_time or end_time is missing
                    continue;
                }

                $shiftStart = Carbon::parse($schedule->start_time, $timezone);
                $shiftEnd = Carbon::parse($schedule->end_time, $timezone);

                // If current time is past the shift end time
                if ($today->gt($shiftEnd)) {
                    // Check for attendance for this specific schedule
                    $attendance = Attendance::where('employee_id', $employeeSchedule->employee_id)
                        ->where('employee_schedule_id', $employeeSchedule->id)
                        // ->where('schedule_id', $schedule->id) // Ensure it's for this specific schedule
                        ->whereDate('date', $today->toDateString())
                        ->first();

                    if (!$attendance) {
                        // Mark as absent if no attendance exists for this schedule
                        Attendance::create([
                            'employee_id' => $employeeSchedule->employee_id,
                            'employee_schedule_id' => $employeeSchedule->id,
                            'date' => $today->toDateString(),
                            'status' => StatusEnum::ABSENT,
                        ]);
                    }
                }
            }

            DB::commit();
            $this->info('Absent employees marked successfully!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error in inactivating schedules: ' . $e->getMessage());
        }
    }
}
