<?php

namespace App\Http\Controllers\Api\Companies;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Company\CompanyEmployeesRequest;
use App\Http\Requests\Company\ShowCompanyRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\User;
use Exception;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\DB;
use NunoMaduro\Collision\Adapters\Phpunit\State;

class CompanyController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $companies = User::whereHas('roles', function ($query) {
                $query->where('name', StatusEnum::COMPANY);
            })
                ->with('company')
                ->get();

            return $this->sendResponse($companies, 'Companies fetched successfully');
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

            return $this->sendResponse($company, 'Companies fetched successfully');
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

    public function notApprovedCompanies()
    {
        try {
            if (auth()->user()->cannot('show-companies')) {
                return $this->sendError('Unauthorized access', 403);
            }
            $companies = User::whereHas('roles', function ($query) {
                $query->where('name', StatusEnum::COMPANY);
            })
                ->where('is_active', StatusEnum::INACTIVE)
                ->with('company')
                ->get();

            if ($companies->isEmpty()) {
                return $this->sendError('No inactive company not found', 404);
            }

            return $this->sendResponse($companies, 'Not approved companies fetched successfully');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function approvedCompanies()
    {
        try {
            auth()->user()->cannot('show-companies');

            $companies = User::whereHas('roles', function ($query) {
                $query->where('name', StatusEnum::COMPANY);
            })
                ->where('is_active', StatusEnum::ACTIVE)
                ->with('company')
                ->get();

            return $this->sendResponse($companies, 'Approved companies successfully fetched');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
