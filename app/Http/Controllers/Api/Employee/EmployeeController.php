<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignManagerRequest;
use App\Http\Requests\Employee\CompanyEmployeeRequest;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;


class EmployeeController extends BaseController
{
    public function create(CreateEmployeeRequest $request)
    {
        DB::beginTransaction();
        $roleName = $request->role;
        try {
            $this->authorize('create-employee');
            $plainPassword = Str::random(8);
            $companyCode = $request->company_code;
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($plainPassword), // Auto-generated 8-character password
                'is_active' => StatusEnum::ACTIVE,
                'status' => StatusEnum::INVITED
            ]);
            if ($roleName == StatusEnum::EMPLOYEE) {
                Employee::create([
                    'user_id' => $user->id,
                    'manager_id' => $request->manager_id,
                    'company_code' => $companyCode,
                    'is_active' => StatusEnum::ACTIVE,
                    'status' => StatusEnum::INVITED
                ]);
                $user->assignRole($roleName);
            } elseif ($roleName == StatusEnum::MANAGER) {
                Manager::create([
                    'user_id' => $user->id,
                    'company_code' => $companyCode,
                    'is_active' => StatusEnum::ACTIVE,
                    'status' => StatusEnum::INVITED
                ]);
                $user->assignRole($roleName);
            }

            AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);
            $user->load(['employee', 'manager']);
            DB::commit();
            return $this->sendResponse($user, 'Employee successfully added, Mail has been dispatched');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function update($id, UpdateEmployeeRequest $request)
    {
        DB::beginTransaction();
        try {
            $this->authorize('update-employee');
            $employee = User::where('id', $id)
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', [StatusEnum::EMPLOYEE, StatusEnum::MANAGER]);
                })
                ->with('employee', 'roles')
                ->firstOrFail(); // Throws exception if not found

            $employee->update($request->all());
            DB::commit();
            return $this->sendResponse($employee, 'Employee successfully updated');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function allCompanyEmployees(CompanyEmployeeRequest $request, $companyCode)
    {
        try {
            $paginate = $request->pagination ?? 20;

            // Check if the user has the required permission
            $this->authorize('show-employees');

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
                ->where(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::APPROVED])
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

    public function activeEmployees(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Employee::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::ACTIVE, 'status' => StatusEnum::APPROVED])
                ->with('user')
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'no Active employees found for this company code', 200);
            }

            return $this->sendResponse($employees, 'Active employees displayed successfully');
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

    public function delete(User $user)
    {
        try {
            $this->authorize('create-employee');
            $user->delete();
            return $this->sendResponse([], 'Employee successfully deleted');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function assignManager(AssignManagerRequest $request)
    {
        try {
            $this->authorize('create-employee');
            // Fetch the employee
            $employee = Employee::findOrFail($request->employee_id);

            // Update the manager_id field
            $employee->manager_id = $request->manager_id;
            $employee->save();

            // Load related data for response
            $employee->load(['manager', 'user']);

            return $this->sendResponse($employee, 'Manager assigned successfully');
        } catch (ModelNotFoundException $e) {
            return $this->sendError('Employee not found', 404);
        } catch (Exception $e) {
            return $this->sendError('An error occurred: ' . $e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
