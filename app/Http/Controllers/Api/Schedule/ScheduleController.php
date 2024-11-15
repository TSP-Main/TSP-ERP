<?php

namespace App\Http\Controllers\Api\Schedule;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignSchedueRequest;
use App\Http\Requests\Schedule\CreateScheduleRequest;
use App\Http\Requests\Schedule\GetWorkingHoursRequest;
use App\Models\Company\EmployeeSchedule;
use App\Models\Company\Schedule;
use App\Models\Employee\Attendance;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class ScheduleController extends BaseController
{
    public function create(CreateScheduleRequest $request)
    {
        $ipAddress = $request->ip();
        $timezone = getUserTimezone($ipAddress);

        // Convert provided time into UTC based on the detected timezone
        $startTime = Carbon::parse($request->start_time, $timezone);
        $endTime = Carbon::parse($request->end_time, $timezone);

        $schedule = Schedule::create([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'week_day' => $request->week_day,
        ]);

        return response()->json(['message' => 'Schedule created successfully', 'schedule' => $schedule]);
    }

    public function assignSchedule(AssignSchedueRequest $request)
    {
        try {
            // $ipAddress = $request->ip(); // UK-based server IP is 51.15.112.35 (if you want to use), pakistan 119.73.100.157
            // $timezone = getUserTimezone($ipAddress);

            $schedules = [];
            foreach ($request->all() as $scheduleData) {
                $schedules[] = EmployeeSchedule::create([
                    'employee_id' => (int) $scheduleData['employee_id'], // Cast to integer
                    'schedule_id' => (int) $scheduleData['schedule_id'], // Cast to integer
                    'start_date' => Carbon::parse($scheduleData['start_date'])->toDateTimeString(),
                    'end_date' => Carbon::parse($scheduleData['end_date'])->toDateTimeString(),
                ]);
            }
            Log::info('Schedules saved', $schedules);
            return $this->sendResponse($schedules, 'Schedules assigned successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    // public function assignSchedule(AssignSchedueRequest $request)
    // {
    //     try {
    //         $ipAddress = '119.73.100.157'; // UK-based server IP is 51.15.112.35 (if you want to use), pakistan 119.73.100.157
    //         $timezone = getUserTimezone($ipAddress);

    //         $schedules = [];
    //         foreach ($request->all() as $scheduleData) {
    //             // Check if $scheduleData is an object or an array
    //             if (is_object($scheduleData)) {
    //                 $employeeId = $scheduleData->employee_id;
    //                 $scheduleId = $scheduleData->schedule_id;
    //                 $startDate = $scheduleData->start_date;
    //                 $endDate = $scheduleData->end_date;
    //             } else {
    //                 // Fallback to array access if it's an array
    //                 $employeeId = $scheduleData['employee_id'];
    //                 $scheduleId = $scheduleData['schedule_id'];
    //                 $startDate = $scheduleData['start_date'];
    //                 $endDate = $scheduleData['end_date'];
    //             }

    //             // Create the schedule record
    //             $schedules[] = EmployeeSchedule::create([
    //                 // dd($employeeId, $scheduleId, $startDate, $endDate),
    //                 'employee_id' => $employeeId,
    //                 'schedule_id' => $scheduleId,
    //                 'start_date' => Carbon::parse($startDate)->toDateTimeString(),
    //                 'end_date' => Carbon::parse($endDate)->toDateTimeString(),
    //             ]);
    //         }

    //         return $this->sendResponse($schedules, 'Schedules assigned successfully');
    //     } catch (Exception $e) {
    //         return $this->sendError($e->getMessage(), $e->getCode());
    //     }
    // }


    public function checkIn($employeeId)
    {
        try {
            $today = Carbon::today('UTC');

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

            // Check if employee already has an active check-in (not checked out)
            $existingAttendance = Attendance::where('employee_id', $employeeId)
                ->whereDate('date', $today->toDateString())
                ->whereNull('time_out')
                ->first();

            if ($existingAttendance) {
                return response()->json(['message' => 'Employee must check out before checking in again'], 400);
            }

            $attendance = Attendance::create([
                'employee_id' => $employeeId,
                'employee_schedule_id' => $employeeSchedule->id,
                'date' => $today->toDateString(),
                'time_in' => Carbon::now('UTC')->format('H:i:s'), //->toTimeString()
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
                ->whereDate('date', Carbon::today('UTC')->toDateString())
                ->whereNull('time_out')
                ->first();

            if (!$attendance) {
                return response()->json(['message' => 'Attendance record not found or already checked out'], 404);
            }

            // Mark checkout time in UTC
            $attendance->update(['time_out' => Carbon::now('UTC')->format('H:i:s')]);

            $schedule = $attendance->employeeSchedule->schedule;
            $shiftStart = Carbon::parse($schedule->start_time)->setTimezone('UTC');
            $shiftEnd = Carbon::parse($schedule->end_time)->setTimezone('UTC');

            // Handle cross-date shifts
            if ($shiftEnd->lt($shiftStart)) {
                $shiftEnd->addDay();
            }

            // Calculate total worked time
            $checkIn = Carbon::parse($attendance->time_in)->setTimezone('UTC');
            $checkOut = Carbon::parse($attendance->time_out)->setTimezone('UTC');

            // Account for cross-date checkouts
            if ($checkOut->lt($checkIn)) {
                $checkOut->addDay();
            }

            $totalMinutesWorked = $checkOut->diffInMinutes($checkIn);

            // Calculate hours and remaining minutes
            $hours = floor($totalMinutesWorked / 60);
            $minutes = $totalMinutesWorked % 60;

            // Format working hours in the required format (e.g., 1.05 for 1 hour and 5 minutes)
            $workingHours = $hours + ($minutes / 100);

            $attendance->update(['working_hours' => $workingHours]);

            return response()->json([
                'message' => 'Checked out successfully',
                'working_hours' => $workingHours,
                'attendance' => $attendance,
            ]);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    public function getWorkingHours(GetWorkingHoursRequest $request)
    {
        try {
            $date = $request->date ? Carbon::parse($request->date) : Carbon::today('UTC');

            $attendances = Attendance::where('employee_id', $request->employee_id)
                ->whereDate('date', $date->toDateString())
                ->get();

            if ($attendances->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for this date.',
                    'total_working_hours' => 0
                ], 404);
            }

            // Calculate total minutes worked
            $totalMinutesWorked = 0;
            foreach ($attendances as $attendance) {
                if ($attendance->time_in && $attendance->time_out) {
                    $checkIn = Carbon::parse($attendance->time_in);
                    $checkOut = Carbon::parse($attendance->time_out);

                    // Handle cross-date shifts
                    if ($checkOut->lt($checkIn)) {
                        $checkOut->addDay();
                    }

                    $totalMinutesWorked += $checkOut->diffInMinutes($checkIn);
                }
            }

            // Convert total minutes into the required format (e.g., 1.05 for 1 hour and 5 minutes)
            $hours = floor($totalMinutesWorked / 60);
            $minutes = $totalMinutesWorked % 60;
            $totalWorkingHours = $hours + ($minutes / 100);

            return $this->sendResponse(
                ['total_working_hours' => $totalWorkingHours],
                'Total working hours calculated successfully'
            );
        } catch (Exception $e) {
            return $this->sendError([
                'message' => 'An error occurred while calculating working hours.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCompanySchedule($companyId)
    {
        try {
            $schedule = Schedule::where('company_id', $companyId)->get();

            if ($schedule->isEmpty()) {
                return $this->sendResponse('Company schedule not found');
            }

            return $this->sendResponse($schedule, 'All schedules successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getEmployeeAssignedSchedule($employeeId)
    {
        try {
            $assignedSchedules = EmployeeSchedule::where('employee_id', $employeeId)->with('employee', 'schedule')->get();

            if ($assignedSchedules->isEmpty()) {
                return $this->sendResponse('Schedule not found');
            }

            return $this->sendResponse($assignedSchedules, 'Employee schedules successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
