<?php

namespace App\Http\Controllers\Api\Schedule;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignSchedueRequest;
use App\Http\Requests\Employee\AttendanceRequest;
use App\Http\Requests\Schedule\CreateScheduleRequest;
use App\Models\Company\EmployeeSchedule;
use App\Models\Company\Schedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class ScheduleController extends BaseController
{
    // public function create(CreateScheduleRequest $request)
    // {
    //     DB::beginTransaction();
    //     try {
    //         // Check for user permissions
    //         if (auth()->user()->cannot('create-schedule')) {
    //             return $this->sendError('Unauthorized access', 403);
    //         }

    //         // Parse dates and times separately
    //         $startDate = Carbon::parse($request->start_date);
    //         $endDate = $request->end_date ? Carbon::parse($request->end_date) : $startDate;

    //         $startTime = Carbon::parse($request->start_time);
    //         $endTime = Carbon::parse($request->end_time);

    //         // Ensure the end date is either the same or one day after the start date
    //         if ($startDate->diffInDays($endDate) > 1) {
    //             return $this->sendError(
    //                 'The schedule cannot span more than one day.',
    //                 400
    //             );
    //         }

    //         // Adjust if end time is on the next day
    //         if ($endDate->equalTo($startDate) && $endTime <= $startTime) {
    //             $endDate = $endDate->addDay(); // Shift to the next day
    //         }

    //         // Calculate total working hours
    //         $startDateTime = $startDate->setTimeFrom($startTime);
    //         $endDateTime = $endDate->setTimeFrom($endTime);

    //         $totalHours = $startDateTime->diffInMinutes($endDateTime) / 60;

    //         // Create the schedule
    //         $schedule = Schedule::create([
    //             // 'user_id' => $request->user_id,
    //             'company_id' => $request->company_id,
    //             'start_date' => $startDate,
    //             'end_date' => $endDate,
    //             'start_time' => $startTime->format('H:i'),
    //             'end_time' => $endTime->format('H:i'),
    //             'total_hours' => $totalHours,
    //             // 'schedule_active' => StatusEnum::SCHEDULE_INACTIVE,
    //         ]);

    //         DB::commit();
    //         return $this->sendResponse($schedule, 'Schedule created successfully');
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
    //     }
    // }

    // public function assignSchedule(AssignSchedueRequest $request)
    // {
    //     try {
    //         if (auth()->user()->cannot('assign-schedule')) {
    //             return $this->sendError('Unauthorized access', 403);
    //         }
    //         $schedule = Attendance::create([
    //             'employee_id' => $request->employee_id,
    //             'schedule_id' => $request->schedule_id,
    //             'date' => $request->date,
    //         ]);

    //         return $this->sendResponse($schedule, 'Schedule assigned to employee');
    //     } catch (Exception $e) {
    //         return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
    //     }
    // }

    // public function attendance(AttendanceRequest $request)
    // {
    //     try {
    //         if (auth()->user()->cannot('add-attendance')) {
    //             return $this->sendError('Unauthorized access', 403);
    //         }
    //         $schedule = Attendance::create([
    //             'time_in' => $request->time_in,
    //             'time_out' => $request->time_out,
    //         ]);

    //         return $this->sendResponse($schedule, 'Schedule assigned to employee');
    //     } catch (Exception $e) {
    //         return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
    //     }
    // }


    public function create(CreateScheduleRequest $request)
    {
        try {
            $schedule = Schedule::create([
                'company_id' => $request->company_id,
                'name' => $request->name,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'week_day' => $request->week_day,
            ]);

            return $this->sendResponse([$schedule], 'Schedule created successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    public function assignSchedule(AssignSchedueRequest $request)
    {
        try {
            $employeeSchedule = EmployeeSchedule::create([
                'employee_id' => $request->employee_id,
                'schedule_id' => $request->schedule_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ]);

            return $this->sendResponse([$employeeSchedule], 'Schedule assigned successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    public function checkIn($employeeId)
    {
        try {
            $today = Carbon::today();
            $employeeSchedule = EmployeeSchedule::where('employee_id', $employeeId)
                ->whereDate('start_date', '<=', $today)
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })
                ->with('schedule')
                ->first();

            if (!$employeeSchedule) {
                return response()->json(['message' => 'No active schedule found for today'], 404);
            }

            // Check if employee is already checked in for this schedule
            $existingAttendance = Attendance::where('employee_id', $employeeId)
                ->whereDate('date', $today->toDateString())
                ->first();

            if ($existingAttendance) {
                return response()->json(['message' => 'Employee is already checked in'], 400);
            }

            $attendance = Attendance::create([
                'employee_id' => $employeeId,
                'employee_schedule_id' => $employeeSchedule->id,
                'date' => $today->toDateString(),
                'time_in' => Carbon::now()->toTimeString(),
                'status' => 'Present',
            ]);

            return response()->json(['message' => 'Checked in successfully', 'attendance' => $attendance]);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    public function checkOut($employeeId)
    {
        try {
            $attendance = Attendance::where('employee_id', $employeeId)
                ->whereDate('date', Carbon::today()->toDateString())
                ->first();

            if (!$attendance) {
                return response()->json(['message' => 'Attendance record not found'], 404);
            }

            // Update check-out time
            $attendance->update(['time_out' => Carbon::now()->toTimeString()]);

            // Retrieve shift details from the schedule to detect cross-date
            $schedule = $attendance->employeeSchedule->schedule;
            $shiftStart = Carbon::parse($schedule->shift_start);
            $shiftEnd = Carbon::parse($schedule->shift_end);

            // If shift goes past midnight, add a day to the shift end for correct calculation
            if ($shiftEnd->lt($shiftStart)) {
                $shiftEnd->addDay();
            }

            // Calculate hours worked, considering possible cross-date shift
            $checkIn = Carbon::parse($attendance->check_in_time);
            $checkOut = Carbon::parse($attendance->check_out_time);

            if ($checkOut->lt($checkIn)) {
                $checkOut->addDay();
            }

            $hoursWorked = $checkOut->diffInMinutes($checkIn) / 60; // Converts minutes to hours
            $attendance->update(['hours_worked' => round($hoursWorked, 2)]);

            return response()->json([
                'message' => 'Checked out successfully',
                'hours_worked' => $attendance->hours_worked,
                'attendance' => $attendance,
            ]);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }
}
