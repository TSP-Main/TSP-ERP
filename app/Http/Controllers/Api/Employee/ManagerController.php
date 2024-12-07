<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Http\Requests\Employee\ManagerAssignedEmployees;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use App\Models\User;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class ManagerController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index() {}

    /**
     * Show the form for creating a new resource.
     */
    public function create(CreateEmployeeRequest $request, StripeService $stripeService)
    {
        DB::beginTransaction();
        try {
            $this->authorize('create-employee');
            $plainPassword = Str::random(8);
            $companyCode = $request->company_code;

            $stripeService->handleAdditionalUserPayment($companyCode);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($plainPassword), // Auto-generated 8-character password
                'is_active' => StatusEnum::ACTIVE,
                'status' => StatusEnum::INVITED
            ]);
            $user->manager()->create([
                'user_id' => $user->id,
                'company_code' => $companyCode,
                'is_active' => StatusEnum::ACTIVE,
                'status' => StatusEnum::INVITED
            ]);
            $user->assignRole($request->role);

            AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);
            $user->load('manager');
            DB::commit();
            return $this->sendResponse($user, 'Manager successfully added, Mail has been dispatched');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function invitedManagers(Request $request, $companyCode)
    {
        try {
            $paginate = $request->per_page ?? 20;
            $employees = Manager::where('company_code', $companyCode)
                ->where('status', StatusEnum::INVITED)
                ->with('user')->paginate($paginate);
            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No invited manager found');
            }
            return $this->sendResponse($employees, 'Invited managers successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function inviteCancelledManager(Request $request, $companyCode)
    {
        try {
            $paginate = $request->per_page ?? 20;
            $manger = Manager::where('company_code', $companyCode)
                ->where('status', StatusEnum::CANCELLED)
                ->with('user')->paginate($paginate);
            if ($manger->isEmpty()) {
                return $this->sendResponse([], 'No cancelled invitation manager found');
            }
            return $this->sendResponse($manger, 'Cancelled invitation managers successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function newSignUpmanagers(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Manager::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::NOT_APPROVED])
                ->with('user')
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No new manager found for this company code', 200);
            }

            return $this->sendResponse($employees, 'New registered managers displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function activeManagers(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Manager::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::ACTIVE, 'status' => StatusEnum::APPROVED])
                ->with('user')
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'no Active manager found for this company code', 200);
            }

            return $this->sendResponse($employees, 'Active managers displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function inActiveManagers(Request $request, $companyCode)
    {
        try {
            $paginate = $request->paginate ?? 20;

            $employees = Manager::where('company_code', $companyCode)
                ->where(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::APPROVED])
                ->with('user')
                ->paginate($paginate);

            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No inactive manager found for this company code', 200);
            }

            return $this->sendResponse($employees, 'Inactive managers displayed successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function managerAssignedEmployees(ManagerAssignedEmployees $request)
    {
        try {
            $employees = Employee::where('manager_id', $request->manager_id)->get();
            if ($employees->isEmpty()) {
                return $this->sendResponse([], 'No employee found for this manager');
            }
            $employees->load('user');
            return $this->sendResponse($employees, 'All employees displayed for this manager');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
