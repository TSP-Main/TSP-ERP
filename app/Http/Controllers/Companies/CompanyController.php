<?php

namespace App\Http\Controllers\Companies;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Company\ShowCompanyRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class CompanyController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $companies = User::whereHas('roles', function ($query) {
                $query->where('name', 'company');
            })
                ->with('company')
                ->get();

            return $this->sendResponse(['companies' => $companies], 'Companies fetched successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ShowCompanyRequest $request)
    {
        try {
            $company = User::whereHas('roles', function ($query) {
                $query->where('name', 'company');
            })->where('id', $request->id)->get();

            if ($company->isEmpty()) {
                return $this->sendError('Company not found', 404);
            }

            return $this->sendResponse(['company' => $company], 'Companies fetched successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            // Ensure the user being deleted has the 'company' role
            if ($user->hasRole('company')) {
                $user->delete();
                return $this->sendResponse([], 'Company successfully deleted');
            } else {
                return $this->sendError('User is not a company', 404);
            }
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

}
