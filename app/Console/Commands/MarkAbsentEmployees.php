<?php

namespace App\Console\Commands;

use App\Classes\StatusEnum;
use App\Models\Company\EmployeeSchedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Request;
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

    public function handle()
    {
        $ipAddress = request()->ip(); // Use request helper to fetch the IP address
        $timezone = getUserTimezone($ipAddress);

        DB::beginTransaction();
        try {
            $today = Carbon::now($timezone);
            $employeeSchedules = EmployeeSchedule::whereDate('start_date', '<=', $today)
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })->with('schedule')->get();

            foreach ($employeeSchedules as $employeeSchedule) {
                $shiftEnd = Carbon::parse($employeeSchedule->schedule->end_time, $timezone);

                // If shift has ended and no check-in is recorded
                $attendance = Attendance::where('employee_id', $employeeSchedule->employee_id)
                    ->whereDate('date', $today->toDateString())
                    ->first();
                    // dd($shiftEnd,$today->gt($shiftEnd), $today);
                if (!$attendance && $today->gt($shiftEnd)) {
                    dd('here');
                    // Mark as absent if no attendance exists for the day
                    Attendance::create([
                        'employee_id' => $employeeSchedule->employee_id,
                        'employee_schedule_id' => $employeeSchedule->id,
                        'date' => $today->toDateString(),
                        'status' => StatusEnum::ABSENT,
                    ]);
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
