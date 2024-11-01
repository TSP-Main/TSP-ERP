<?php

namespace App\Http\Controllers\Api\Schedule;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignSchedueRequest;
use App\Http\Requests\Employee\AttendanceRequest;
use App\Http\Requests\Schedule\CreateScheduleRequest;
use App\Models\Company\Schedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class ScheduleController extends BaseController
{
    public function create(CreateScheduleRequest $request)
    {
        DB::beginTransaction();
        try {
            // Check for user permissions
            if (auth()->user()->cannot('create-schedule')) {
                return $this->sendError('Unauthorized access', 403);
            }

            // Parse dates and times separately
            $startDate = Carbon::parse($request->start_date);
            $endDate = $request->end_date ? Carbon::parse($request->end_date) : $startDate;

            $startTime = Carbon::parse($request->start_time);
            $endTime = Carbon::parse($request->end_time);

            // Ensure the end date is either the same or one day after the start date
            if ($startDate->diffInDays($endDate) > 1) {
                return $this->sendError(
                    'The schedule cannot span more than one day.',
                    400
                );
            }

            // Adjust if end time is on the next day
            if ($endDate->equalTo($startDate) && $endTime <= $startTime) {
                $endDate = $endDate->addDay(); // Shift to the next day
            }

            // Calculate total working hours
            $startDateTime = $startDate->setTimeFrom($startTime);
            $endDateTime = $endDate->setTimeFrom($endTime);

            $totalHours = $startDateTime->diffInMinutes($endDateTime) / 60;

            // Create the schedule
            $schedule = Schedule::create([
                // 'user_id' => $request->user_id,
                'company_id' => $request->company_id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'start_time' => $startTime->format('H:i'),
                'end_time' => $endTime->format('H:i'),
                'total_hours' => $totalHours,
                // 'schedule_active' => StatusEnum::SCHEDULE_INACTIVE,
            ]);

            DB::commit();
            return $this->sendResponse($schedule, 'Schedule created successfully');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function assignSchedule(AssignSchedueRequest $request)
    {
        try {
            if (auth()->user()->cannot('assign-schedule')) {
                return $this->sendError('Unauthorized access', 403);
            }
            $schedule = Attendance::create([
                'employee_id' => $request->employee_id,
                'schedule_id' => $request->schedule_id,
                'date' => $request->date,
            ]);

            return $this->sendResponse($schedule, 'Schedule assigned to employee');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function attendance(AttendanceRequest $request)
    {
        try {
            if (auth()->user()->cannot('add-attendance')) {
                return $this->sendError('Unauthorized access', 403);
            }
            $schedule = Attendance::create([
                'employee_id' => $request->time_in,
                'schedule_id' => $request->time_out,
            ]);

            return $this->sendResponse($schedule, 'Schedule assigned to employee');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
