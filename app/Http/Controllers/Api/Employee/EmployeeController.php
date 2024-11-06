<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Attendance;
use App\Models\Employee\Employee;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class EmployeeController extends BaseController
{
    public function create(CreateEmployeeRequest $request)
    {
        DB::beginTransaction();
        try {
            if (auth()->user()->cannot('create-employee')) {
                return $this->sendError('Unauthorized access', 403);
            }
            $companyCode = $request->company_code;
            $employee = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt(Str::random(8)), // Auto-generated 8-character password
            ]);
            Employee::create([
                'user_id' => $employee->id,
                'company_code' => $companyCode,
            ]);
            $employee->assignRole($request->role);
            AddEmployeeInvitationJob::dispatch($companyCode, $employee);
            DB::commit();
            return $this->sendResponse(['employee', $employee], 'Employee successfully added, Mail has been dispatched');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function allCompanyEmployees($companyCode)
    {
        try {
            if (auth()->user()->cannot('show-employees')) {
                return $this->sendError('Unauthorized access', 403);
            }

            // Retrieve employees based on the company_code in the Employee model
            $employees = User::whereHas('employee', function ($query) use ($companyCode) {
                $query->where('company_code', $companyCode);
            })->with('employee')->get();

            if ($employees->isEmpty()) {
                return $this->sendError('No employees found for this company code', 404);
            }

            return $this->sendResponse($employees, 'Employees displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    public function show($user)
    {
        try {
            $employee = User::with('employee')
                ->where('id', $user)
                ->whereHas('roles', function ($query) {
                    $query->where('name', StatusEnum::EMPLOYEE);
                })
                ->firstOrFail();

            return $this->sendResponse($employee, 'Employee successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
