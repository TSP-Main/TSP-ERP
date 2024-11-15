<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
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

    public function allCompanyEmployees(Request $request, $companyCode)
    {
        try {
            $paginate = $request->pagination ?? 20;
            if (auth()->user()->cannot('show-employees')) {
                return $this->sendError('Unauthorized access', 403);
            }

            // Retrieve employees based on the company_code in the Employee model
            $employees = User::whereHas('employee', function ($query) use ($companyCode) {
                $query->where('company_code', $companyCode);
            })->with(['employee', 'roles'])->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse('No employees found for this company code');
            }

            return $this->sendResponse($employees, 'Employees displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function inActiveEmployees(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Employee::where('company_code', $companyCode)
                ->where('is_active', StatusEnum::INACTIVE)
                ->with('user')
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No inactive employees found for this company code', 200);
            }

            return $this->sendResponse($employees, 'Inactive employees displayed successfully');
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
