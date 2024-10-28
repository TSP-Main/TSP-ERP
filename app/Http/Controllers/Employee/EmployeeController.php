<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Employee\CreateEmployeeRequest;
use App\Jobs\Employee\AddEmployeeInvitationJob;
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
            // if (auth()->user()->cannot('create-employee')) {
            //     return $this->sendError('Unauthorized access', 403);
            // }
            $companyCode = $request->company_code;
            $employee = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt(Str::random(8)), // Auto-generated 8-character password
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
}
