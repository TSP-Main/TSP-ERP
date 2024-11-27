<?php

namespace App\Console\Commands;

use App\Classes\StatusEnum;
use App\Models\Company\EmployeeSchedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Console\Command;
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
        Log::info('Mark absent employees cron start');

        DB::beginTransaction();
        try {
            $today = Carbon::today('UTC');
            $employee = EmployeeSchedule::whereDate('start_date', '<=', $today)
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })->with('schedule')->get();

            foreach ($employee as $employeeSchedule) {
                $shiftEnd = Carbon::parse($employeeSchedule->schedule->end_time)->setTimezone('UTC');

                // If shift has ended and no check-in is recorded
                $attendance = Attendance::where('employee_id', $employeeSchedule->employee_id)
                    ->whereDate('date', $today->toDateString())
                    ->first();

                if (!$attendance && $today->gt($shiftEnd)) {
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
            Log::info('Mark absent employees successfully.');
            $this->info('Absent employees marked successfully!');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error in inactivating schedules: ' . $e->getMessage());
        }
    }
}