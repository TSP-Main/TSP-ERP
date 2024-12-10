<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\AssignManagerRequest;
use App\Http\Requests\Employee\CompanyEmployeeRequest;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use App\Models\User;
use App\Services\StripeService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class EmployeeController extends BaseController
{
    // public function create(CreateEmployeeRequest $request)
    // {
    //     DB::beginTransaction();
    //     $roleName = $request->role;
    //     try {
    //         $this->authorize('create-employee');
    //         $plainPassword = Str::random(8);
    //         $companyCode = $request->company_code;
    //         $user = User::create([
    //             'name' => $request->name,
    //             'email' => $request->email,
    //             'password' => bcrypt($plainPassword), // Auto-generated 8-character password
    //             'is_active' => StatusEnum::ACTIVE,
    //             'status' => StatusEnum::INVITED
    //         ]);
    //         if ($roleName == StatusEnum::EMPLOYEE) {
    //             Employee::create([
    //                 'user_id' => $user->id,
    //                 'manager_id' => $request->manager_id,
    //                 'company_code' => $companyCode,
    //                 'is_active' => StatusEnum::ACTIVE,
    //                 'status' => StatusEnum::INVITED
    //             ]);
    //             $user->assignRole($roleName);
    //         } elseif ($roleName == StatusEnum::MANAGER) {
    //             Manager::create([
    //                 'user_id' => $user->id,
    //                 'company_code' => $companyCode,
    //                 'is_active' => StatusEnum::ACTIVE,
    //                 'status' => StatusEnum::INVITED
    //             ]);
    //             $user->assignRole($roleName);
    //         }

    //         AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);
    //         $user->load(['employee', 'manager']);
    //         DB::commit();
    //         return $this->sendResponse($user, 'Employee successfully added, Mail has been dispatched');
    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
    //     }
    // }

    public function create(CreateEmployeeRequest $request, StripeService $stripeService)
    {
        DB::beginTransaction();
        try {
            $this->authorize('create-employee');
            $roleName = $request->role;
            $companyCode = $request->company_code;

            $stripeService->handleAdditionalUserPayment($companyCode);

            // Create the user and assign roles
            $plainPassword = Str::random(8);
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($plainPassword), // Auto-generated password
                'is_active' => StatusEnum::ACTIVE,
                'status' => StatusEnum::INVITED,
            ]);

            if ($roleName == StatusEnum::EMPLOYEE) {
                Employee::create([
                    'user_id' => $user->id,
                    'manager_id' => $request->manager_id,
                    'company_code' => $companyCode,
                    'is_active' => StatusEnum::ACTIVE,
                    'status' => StatusEnum::INVITED,
                ]);
            } elseif ($roleName == StatusEnum::MANAGER) {
                Manager::create([
                    'user_id' => $user->id,
                    'company_code' => $companyCode,
                    'is_active' => StatusEnum::ACTIVE,
                    'status' => StatusEnum::INVITED,
                ]);
            }

            $user->assignRole($roleName);

            // Dispatch invitation email
            AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);

            $user->load(['employee', 'manager']);
            DB::commit();
            return $this->sendResponse($user, 'Employee successfully added. Mail has been dispatched.');
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
            $paginate = $request->input('paginate', 20);
            $managerId = $request->input('manager_id');

            $query = Employee::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::APPROVED])
                ->with(['manager.user', 'user']);

            // Apply manager_id filter if provided
            if ($managerId) {
                $query->where('manager_id', $managerId);
            }

            $employees = $query->paginate($paginate);

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
            $paginate = $request->input('paginate', 20);
            $managerId = $request->input('manager_id');

            $query = Employee::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::ACTIVE, 'status' => StatusEnum::APPROVED])
                ->with(['manager.user', 'user']);

            // Apply manager_id filter if provided
            if ($managerId) {
                $query->where('manager_id', $managerId);
            }

            $employees = $query->paginate($paginate);
            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No active employees found for this company code', 200);
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
            $this->authorize('delete-employee');
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

    public function invitedEmployees(Request $request, $companyCode)
    {
        try {
            $paginate = $request->input('per_page', 20);
            $managerId = $request->input('manager_id');

            $query = Employee::where('company_code', $companyCode)
                ->where('status', StatusEnum::INVITED)
                ->when($managerId, function ($query) use ($managerId) {
                    $query->where('manager_id', $managerId); // Apply manager filter if provided
                })
                ->with(['manager.user', 'user']);

            $employees = $query->paginate($paginate);
            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No invited users found');
            }

            return $this->sendResponse($employees, 'Invited users successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    public function employeeInvitationCancel(User $user)
    {
        if (!$user) {
            return $this->sendResponse([], 'User not found');
        }

        $role = $user->roles->first();
        if (!$role) {
            return $this->sendResponse([], 'User role not found');
        }

        if (in_array($role->name, [StatusEnum::EMPLOYEE, StatusEnum::MANAGER])) {
            // Check if the user is invited
            if ($user->status !== StatusEnum::INVITED) {
                return $this->sendResponse([], 'Action not allowed. User is not in invited status.');
            }

            $this->authorize('reject-employee');

            // Collect attributes to update
            $updateData = [
                'is_active' => StatusEnum::INACTIVE,
                'status' => StatusEnum::CANCELLED
            ];

            $user->update($updateData);
            if ($user->employee) {
                $user->employee->update($updateData);
            }

            if ($user->manager) {
                $user->manager->update($updateData);
            }
        }

        return $this->sendResponse(ucfirst($role->name) . ' invite cancelled', 200);
    }

    public function inviteCancelledEmployee(Request $request, $companyCode)
    {
        try {
            $paginate = $request->per_page ?? 20;
            $managerId = $request->input('manager_id');

            $user = Employee::where('company_code', $companyCode)
                ->where('status', StatusEnum::CANCELLED)
                ->when($managerId, function ($user) use ($managerId) {
                    $user->where('manager_id', $managerId); // Apply manager filter if provided
                })
                ->with(['manager.user', 'user'])->paginate($paginate);
            if ($user->isEmpty()) {
                return $this->sendResponse([], 'No cancelled invitation employee found');
            }
            return $this->sendResponse($user, 'Cancelled invitation employees successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function newSignUpEmployees(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Employee::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::NOT_APPROVED])
                ->with(['manager.user', 'user'])
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No new employees found for this company code', 200);
            }

            return $this->sendResponse($employees, 'New registered employees displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function subscribedEmployee($companyCode)
    {
        try {
            // Count approved employees
            $employeeCount = Employee::where('company_code', $companyCode)
                ->where('status', StatusEnum::APPROVED)
                ->count();

            // Count approved managers
            $managerCount = Employee::where('company_code', $companyCode)
                ->where('status', StatusEnum::APPROVED)
                ->count();

            $data = [
                'total_user' => $employeeCount + $managerCount,
                'total_employees' => $employeeCount,
                'total_managers' => $managerCount,
            ];

            return $this->sendResponse($data, 'Employee and Manager counts retrieved successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
