<?php

namespace App\Http\Controllers\Api\Employee;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
use App\Models\Employee\Manager;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ManagerController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(CreateEmployeeRequest $request)
    {
        DB::beginTransaction();
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
            Manager::create([
                'user_id' => $user->id,
                'company_code' => $companyCode,
                'is_active' => StatusEnum::ACTIVE,
                'status' => StatusEnum::INVITED
            ]);
            $user->assignRole($request->role);

            AddEmployeeInvitationJob::dispatch($companyCode, $user, $plainPassword);
            $user->load('employee');
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
}
