<?php

namespace App\Http\Controllers\Api\Schedule;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignSchedueRequest;
use App\Http\Requests\Schedule\AttendanceReportRequest;
use App\Http\Requests\Schedule\CheckInCheckOutTimeRequest;
use App\Http\Requests\Schedule\CheckInStatusRequest;
use App\Http\Requests\Schedule\CreateScheduleRequest;
use App\Http\Requests\Schedule\EmployeeAvailabilityRequest;
use App\Http\Requests\Schedule\GetWorkingHoursRequest;
use App\Http\Requests\Schedule\MissedAndAttendedScheduleScheduleRequest;
use App\Http\Requests\Schedule\UpdateScheduleRequest;
use App\Models\Company\EmployeeSchedule;
use App\Models\Company\Schedule;
use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ScheduleController extends BaseController
{
    public function create(CreateScheduleRequest $request)
    {
        $ipAddress = $request->ip();
        $timezone = getUserTimezone($request);

        $startTime  = Carbon::parse($request->start_time, $timezone);
        $endTime  = Carbon::parse($request->end_time, $timezone);

        // if ($endTime->lessThan($startTime)) {
        //     $endTime->addDay(); // Add one day to the end time
        // }        //handeled in checkout api

        $schedule = Schedule::create([
            'company_id' => $request->company_id,
            'name' => $request->name,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'week_day' => $request->week_day,
        ]);

        return response()->json(['message' => 'Schedule created successfully', 'schedule' => $schedule]);
    }

    public function update(UpdateScheduleRequest $request, $id)
    {
        try {
            $schedule = Schedule::findOrFail($id);

            $ipAddress = $request->ip();
            $timezone = getUserTimezone($request);

            // Convert provided time into UTC based on the detected timezone
            $startTime = Carbon::parse($request->start_time, $timezone);
            $endTime = Carbon::parse($request->end_time, $timezone);

            $schedule->update([
                // 'company_id' => $request->company_id,
                'name' => $request->name,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'week_day' => $request->week_day,
            ]);

            return $this->sendResponse($schedule, 'Schedule updated successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function delete($id)
    {
        try {
            $schedule = Schedule::findOrFail($id);
            $schedule->delete();
            return $this->sendResponse([], 'Schedule successfully deleted');
        } catch (ModelNotFoundException $e) {
            return $this->sendResponse([], 'Schedule not found');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function assignSchedule(AssignSchedueRequest $request)
    {
        try {
            $ipAddress = $request->ip();
            $timezone = getUserTimezone($request);

            $schedules = [];

            // Extract only valid schedule data
            $data = array_filter($request->all(), function ($item) {
                return is_array($item) && isset($item['schedule_id'], $item['start_date'], $item['end_date']) &&
                    (isset($item['employee_id']) || isset($item['manager_id'])); // At least one must be set
            });

            foreach ($data as $scheduleData) {
                // Determine whether the schedule is for an employee or a manager
                $employeeId = $scheduleData['employee_id'] ?? null;
                $managerId = $scheduleData['manager_id'] ?? null;

                if ($employeeId && $managerId) {
                    return $this->sendError('A schedule cannot be assigned to both an employee and a manager.');
                }

                $schedules[] = EmployeeSchedule::create([
                    'employee_id' => $employeeId ? (int) $employeeId : null,
                    'manager_id' => $managerId ? (int) $managerId : null,
                    'schedule_id' => (int) $scheduleData['schedule_id'],
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


    public function checkIn($personId, Request $request)
    {
        $ipAddress = $request->ip();
        $timezone = getUserTimezone($request);

        try {
            $today = Carbon::today($timezone);

            // Determine if the person is an employee or a manager
            $personType = $request->get('type'); // Pass `type` as either `employee` or `manager`

            if ($personType === StatusEnum::EMPLOYEE) {
                $scheduleQuery = EmployeeSchedule::where('employee_id', $personId);
            } elseif ($personType === StatusEnum::MANAGER) {
                $scheduleQuery = EmployeeSchedule::where('manager_id', $personId);
            } else {
                return response()->json(['message' => 'Invalid person type'], 400);
            }

            // Check for active schedules
            $personSchedule = $scheduleQuery
                ->whereDate('start_date', '<=', $today)
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })
                ->with('schedule')
                ->first();

            if (!$personSchedule) {
                return response()->json(['message' => 'No active schedule found for today'], 404);
            }

            // Check if the person already has an active check-in (not checked out)
            $attendanceQuery = Attendance::whereDate('date', $today->toDateString())
                ->whereNull('time_out');

            if ($personType === 'employee') {
                $attendanceQuery->where('employee_id', $personId);
            } elseif ($personType === 'manager') {
                $attendanceQuery->where('manager_id', $personId);
            }

            $existingAttendance = $attendanceQuery->first();

            if ($existingAttendance) {
                return response()->json(['message' => 'Person must check out before checking in again'], 400);
            }

            // Record attendance
            $attendanceData = [
                'date' => $today->toDateString(),
                'time_in' => Carbon::now($timezone)->format('H:i:s'),
                'status' => StatusEnum::PRESENT,
            ];

            if ($personType === 'employee') {
                $attendanceData['employee_id'] = $personId;
                $attendanceData['employee_schedule_id'] = $personSchedule->id;
            } elseif ($personType === 'manager') {
                $attendanceData['manager_id'] = $personId;
                $attendanceData['employee_schedule_id'] = $personSchedule->id; // Relates to the shared schedule
            }

            $attendance = Attendance::create($attendanceData);

            return response()->json(['message' => 'Checked in successfully', 'attendance' => $attendance]);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }


    public function checkOut($personId, Request $request)
    {
        $ipAddress = $request->ip();
        $timezone = getUserTimezone($request);

        try {
            // Determine if the person is an employee or a manager
            $personType = $request->get('type'); // Pass `type` as either `employee` or `manager`

            $attendanceQuery = Attendance::whereDate('date', Carbon::today('UTC')->toDateString())
                ->whereNull('time_out');

            if ($personType === StatusEnum::EMPLOYEE) {
                $attendanceQuery->where('employee_id', $personId);
            } elseif ($personType === StatusEnum::MANAGER) {
                $attendanceQuery->where('manager_id', $personId);
            } else {
                return response()->json(['message' => 'Invalid person type'], 400);
            }

            $attendance = $attendanceQuery->first();

            if (!$attendance) {
                return response()->json(['message' => 'Attendance record not found or already checked out'], 404);
            }

            // Mark checkout time in UTC
            $attendance->update(['time_out' => Carbon::now($timezone)->format('H:i:s')]);

            $schedule = $attendance->employeeSchedule->schedule;
            $shiftStart = Carbon::parse($schedule->start_time)->setTimezone($timezone);
            $shiftEnd = Carbon::parse($schedule->end_time)->setTimezone($timezone);

            // Handle cross-date shifts
            if ($shiftEnd->lt($shiftStart)) {
                $shiftEnd->addDay();
            }

            // Calculate total worked time
            $checkIn = Carbon::parse($attendance->time_in)->setTimezone($timezone);
            $checkOut = Carbon::parse($attendance->time_out)->setTimezone($timezone);

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
        $ipAddress = $request->ip();
        $timezone = getUserTimezone($request);

        try {
            // Parse the provided date or use today's date
            $date = $request->date ? Carbon::parse($request->date) : Carbon::today($timezone);

            $role = $request->role;

            if ($role === StatusEnum::EMPLOYEE) {
                $attendances = Attendance::where('employee_id', $request->person_id)
                    ->whereDate('date', $date->toDateString())
                    ->get();
            } elseif ($role === StatusEnum::MANAGER) {
                $attendances = Attendance::where('manager_id', $request->person_id)
                    ->whereDate('date', $date->toDateString())
                    ->get();
            } else {
                return response()->json(['message' => 'Invalid role specified'], 400);
            }

            if ($attendances->isEmpty()) {
                return response()->json([
                    'message' => 'No attendance records found for this date.',
                    'total_working_hours' => 0,
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
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function getCompanyAssignedSchedule($companyId, Request $request)
    {
        try {
            $role = $request->role;
            if (!in_array($role, [StatusEnum::EMPLOYEE, StatusEnum::MANAGER])) {
                return $this->sendError('Invalid role specified. Use "employee" or "manager".', 400);
            }

            // Fetch schedules for the company based on the role
            $schedules = Schedule::where('company_id', $companyId)
                ->whereHas('employeeSchedules', function ($query) use ($role) {
                    $query->whereDate('end_date', '>=', now()->toDateString())
                        ->whereHas($role, function ($subQuery) {
                            $subQuery->whereNotNull('id'); // Ensure the role exists in the relationship
                        });
                })
                ->with([
                    'employeeSchedules' => function ($query) use ($role) {
                        $query->with([$role . '.user']);
                    }
                ])
                ->get();

            if ($schedules->isEmpty()) {
                return $this->sendResponse([], 'No schedules found for this company.');
            }

            $data = $schedules->map(function ($schedule) use ($role) {
                return [
                    'schedule_id' => $schedule->id,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    $role . 's' => $schedule->employeeSchedules->map(function ($employeeSchedule) use ($role) {
                        $person = $employeeSchedule->$role; // Dynamic relationship (employee or manager)
                        return [
                            $role . '_id' => $person->id ?? '',
                            $role . '_name' => $person->user->name ?? '',
                            $role . '_email' => $person->user->email ?? '',
                            'start_date' => $employeeSchedule->start_date ?? '',
                            'end_date' => $employeeSchedule->end_date ?? '',
                        ];
                    }),
                ];
            });

            return $this->sendResponse($data, ucfirst($role) . ' schedules successfully displayed.');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getCompanySchedule($companyId)
    {
        try {
            // Fetch schedules for the company
            $schedules = Schedule::where('company_id', $companyId)->get();

            if ($schedules->isEmpty()) {
                return $this->sendResponse([], 'No schedules found for this company.');
            }

            // Format the response
            $data = $schedules->map(function ($schedule) {
                return [
                    'schedule_id' => $schedule->id,
                    'name' => $schedule->name,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'week_day' => $schedule->week_day,
                ];
            });

            return $this->sendResponse($data, 'All schedules successfully displayed.');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    public function getEmployeeAssignedSchedule(Request $request, $employeeId)
    {
        try {
            $role = $request->role;
            $assignedSchedules = EmployeeSchedule::where($role . '_id', $employeeId)->with(['manager', 'employee.manager', 'schedule'])->get();

            if ($assignedSchedules->isEmpty()) {
                return $this->sendResponse('Schedule not found');
            }

            return $this->sendResponse($assignedSchedules, 'Employee schedules successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getCurrentlyCheckedInEmployees(Request $request)
    {
        $this->authorize('checkedin-employees');
        $companyId = $request->query('company_id'); // Optional company filter
        $managerId = $request->input('manager_id');


        // Fetch employees with necessary conditions
        $employees = Employee::whereHas('attendance', function ($query) {
            $query->whereNotNull('time_in')
                ->whereNull('time_out');
        })
            ->when($managerId, function ($query) use ($managerId) {
                $query->where('manager_id', $managerId); // Apply manager filter if provided
            })
            ->with([
                'attendance' => function ($query) {
                    $query->whereNotNull('time_in')
                        ->whereNull('time_out');
                },
                'employeeSchedules.schedule' => function ($query) use ($companyId) {
                    if ($companyId) {
                        $query->where('company_id', $companyId);
                    }
                },
                'user' // Include the user relationship
            ])
            ->get();

        // Check if no employees are found
        if ($employees->isEmpty()) {
            return response()->json(['message' => 'No employees are currently checked in.'], 200);
        }

        // Format the response data
        $data = $employees->map(function ($employee) {
            return [
                'employee_id' => $employee->id,
                'employee_name' => $employee->user->name ?? null, // Access the name from the user relationship
                'time_in' => $employee->attendance->first()?->time_in,
                'schedule_start_time' => $employee->employeeSchedules->first()?->schedule->start_time,
                'schedule_end_time' => $employee->employeeSchedules->first()?->schedule->end_time,
            ];
        });

        return response()->json(['data' => $data], 200);
    }

    //Employee avalibility schedule
    public function submitAvailability(EmployeeAvailabilityRequest $request)
    {
        try {
            $entityType = $request->manager_id ? StatusEnum::MANAGER : StatusEnum::EMPLOYEE;
            $entityId = $request->input($entityType . '_id');
            $modelClass = $entityType === StatusEnum::MANAGER ? Manager::class : Employee::class;

            $entity = $modelClass::where('id', $entityId)->first();
            if (!$entity) {
                return $this->sendError(ucfirst($entityType) . ' not found', 404);
            }

            // Retrieve existing data from the cache or initialize an empty array
            $availability = Cache::get($entityType . '_availability', []);
            $availability[] = [
                $entityType . '_id' => $entityId,
                'company_code' => $entity->company_code, // Fetch company code from the employee record
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ];

            // Store the updated availability back in the cache
            Cache::put($entityType . '_availability', $availability, now()->addWeeks(1));

            return $this->sendResponse(['message' => ucfirst($entityType) . ' availability submitted successfully'], 200);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getAvailabilityDashboard($companyCode)
    {
        try {
            $employeeAvailability = Cache::get('employee_availability', []);
            $managerAvailability = Cache::get('manager_availability', []);

            // Filter the availability by company code
            $filteredEmployeeAvailability = collect($employeeAvailability)->filter(function ($item) use ($companyCode) {
                return $item['company_code'] === $companyCode;
            });

            $filteredManagerAvailability = collect($managerAvailability)->filter(function ($item) use ($companyCode) {
                return $item['company_code'] === $companyCode;
            });

            if ($filteredEmployeeAvailability->isEmpty() && $filteredManagerAvailability->isEmpty()) {
                return response()->json(['message' => 'No availability schedules found for the specified company code'], 200);
            }

            // Enhance the data for dashboard display (e.g., include employee names)
            $employeeData = $filteredEmployeeAvailability->map(function ($item) {
                $employee = Employee::with('user')->find($item['employee_id']);

                return [
                    'type' => 'employee',
                    'id' => $item['employee_id'],
                    'company_code' => $item['company_code'],
                    'name' => $employee->user->name ?? '',
                    'email' => $employee->user->email ?? '',
                    'date' => $item['date'],
                    'start_time' => $item['start_time'],
                    'end_time' => $item['end_time'],
                ];
            });

            $managerData = $filteredManagerAvailability->map(function ($item) {
                $manager = Manager::with('user')->find($item['manager_id']);

                return [
                    'type' => 'manager',
                    'id' => $item['manager_id'],
                    'company_code' => $item['company_code'],
                    'name' => $manager->user->name ?? '',
                    'email' => $manager->user->email ?? '',
                    'date' => $item['date'],
                    'start_time' => $item['start_time'],
                    'end_time' => $item['end_time'],
                ];
            });

            $data = $employeeData->merge($managerData)->values();

            return $this->sendResponse($data, 'Employee Availability displayed', 200);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function checkInCheckOutTime(CheckInCheckOutTimeRequest $request, $id)
    {
        try {
            $query = Attendance::where('employee_id', $id);

            // Check if `start_date` and `end_date` are provided
            if ($request->filled(['start_date', 'end_date'])) {
                $query->whereBetween('date', [$request->start_date, $request->end_date]);
            } else {
                $weekStart = Carbon::now()->subDays(6); // Calculate week start (7 days ago)
                $weekEnd = Carbon::now(); // Include today
                $query->whereBetween('date', [$weekStart->toDateString(), $weekEnd->toDateString()]);
            }

            // Fetch the attendance records
            $schedules = $query->get();

            if ($schedules->isEmpty()) {
                return $this->sendError('No attendance records found for the given criteria', 404);
            }

            return $this->sendResponse($schedules, 'Attendance records successfully fetched');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    public function missedAndAttendedSchedule(MissedAndAttendedScheduleScheduleRequest $request, $id)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $role = $request->role;

            if ($startDate && $endDate) {
                // Validate dates are not in the future
                $today = Carbon::today('UTC');
                if (Carbon::parse($startDate)->greaterThan($today) || Carbon::parse($endDate)->greaterThan($today)) {
                    return $this->sendError('Start date and end date must not be in the future', 422);
                }
            } else {
                // Default to one week before today, including today
                $endDate = Carbon::today('UTC')->toDateString();
                $startDate = Carbon::today('UTC')->subWeek()->toDateString();
            }

            // Fetch attended schedules
            $attendedSchedules = Attendance::where($role . '_id', $id)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('status', StatusEnum::PRESENT)
                ->get();

            // Fetch missed schedules
            $missedSchedules = Attendance::where($role . '_id', $id)
                ->whereBetween('date', [$startDate, $endDate])
                ->where('status', StatusEnum::ABSENT)
                ->get();

            // Prepare response
            $data = [
                'attended_schedules' => $attendedSchedules,
                'missed_schedules' => $missedSchedules,
            ];

            return $this->sendResponse($data, 'Schedules successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function getCheckInStatus(CheckInStatusRequest $request)
    {
        try {
            $ipAddress = $request->ip();
            $timezone = getUserTimezone($request);

            $entity = $request->manager_id ? StatusEnum::MANAGER : StatusEnum::EMPLOYEE;
            $entityId = $request->input($entity . '_id');
            if (!$entityId) {
                return response()->json(['message' => 'Invalid request. Either employee_id or manager_id is required.'], 400);
            }

            $attendance = Attendance::where($entity . '_id', $entityId)
                ->whereNull('time_out')
                ->first();

            if (!$attendance) {
                return response()->json(['status' => 'absent'], 200);
            }

            $checkInTime = Carbon::parse($attendance->time_in, $timezone);

            $currentTime = Carbon::now($timezone);
            if ($checkInTime->isToday() && $currentTime->greaterThan($checkInTime)) {
                return response()->json(['status' => 'present'], 200);
            }

            return response()->json(['status' => 'absent'], 200);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function scheduleReport($companyCode, AttendanceReportRequest $request)
    {
        try {
            $paginate = $request->per_page ?? 2;

            $role = $request->role ?? StatusEnum::EMPLOYEE;
            if (!in_array($role, [StatusEnum::MANAGER, StatusEnum::EMPLOYEE])) {
                return $this->sendError('Invalid role specified. Use "employee" or "manager".', 400);
            }

            $query = Attendance::whereBetween('date', [$request->start_date, $request->end_date])
                ->whereHas($role, function ($query) use ($companyCode) {
                    $query->where('company_code', $companyCode);
                })
                ->with([$role . 'Schedule.schedule', $role . '.user']);

            if ($request->filled($role . '_id')) {
                $query->where($role . '_id', $request->input($role . '_id'));
            }

            $report = $query->paginate($paginate);

            // Convert items to a collection to use filter()
            $currentPageRecords = collect($report->items());

            $presentRecords = $currentPageRecords->filter(function ($item) {
                return $item->status === StatusEnum::PRESENT;
            });
            $absentRecords = $currentPageRecords->filter(function ($item) {
                return $item->status === StatusEnum::ABSENT;
            });

            $data = [
                'role' => $role,
                'current_page' => $report->currentPage(),
                'per_page' => $report->perPage(),
                'total_records' => $report->total(),
                'present' => $presentRecords->values(),
                'absent' => $absentRecords->values(),
            ];

            return $this->sendResponse($data, 'Report successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
