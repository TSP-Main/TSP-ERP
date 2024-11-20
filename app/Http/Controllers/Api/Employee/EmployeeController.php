<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\CompanyEmployeeRequest;
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
            $plainPassword = Str::random(8);
            $companyCode = $request->company_code;
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($plainPassword), // Auto-generated 8-character password
                'is_active' => StatusEnum::ACTIVE
            ]);
            Employee::create([
                'user_id' => $user->id,
                'company_code' => $companyCode,
                'is_active' => StatusEnum::ACTIVE
            ]);
            $user->assignRole($request->role);

            AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);
            $user->load('employee');
            DB::commit();
            return $this->sendResponse($user, 'Employee successfully added, Mail has been dispatched');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function allCompanyEmployees(CompanyEmployeeRequest $request, $companyCode)
    {
        try {
            $paginate = $request->pagination ?? 20;

            // Check if the user has the required permission
            if (auth()->user()->cannot('show-employees')) {
                return $this->sendError('Unauthorized access', 403);
            }

            $query = User::whereHas('employee', function ($query) use ($companyCode) {
                $query->where('company_code', $companyCode);
            });

            // Apply role filter if provided
            if ($request->has('role') && $request->role === StatusEnum::MANAGER) {
                $query->whereHas('roles', function ($query) {
                    $query->where('name', StatusEnum::MANAGER);
                });
            }

            // Include employee and role relationships and paginate the result
            $employees = $query->with(['employee', 'roles'])->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No employees found for this company.');
            }

            return $this->sendResponse($employees, 'Employees displayed successfully.');
        } catch (Exception $e) {
            // Handle exceptions and send an error response
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
