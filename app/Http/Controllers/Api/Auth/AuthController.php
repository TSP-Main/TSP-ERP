<?php

namespace App\Http\Controllers\Api\Auth;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Auth\CreatePasswordRequest;
use Exception;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Requests\Auth\ForgetPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Jobs\Company\EmployeeApproveEmailJob;
use App\Models\Company\CardModel;
use App\Models\Company\CompanyModel;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;


class AuthController extends BaseController
{
    /** @intelephense-ignore */

    public function register(RegisterUserRequest $request)
    {
        try {
            DB::beginTransaction();
            if ($request->role === 'company') {
                $user = User::create([
                    'name' => $request->company_name,
                    'email' => $request->email,
                    'password' => ''
                ]);
                $user->assignRole('company');
                // Generate unique company code
                $companyCode = 'CPM-' . strtoupper(uniqid());
                $slug = generateCompanySlug($request->company_name); // Use the helper function to generate a unique slug
                $logoPath = null;
                if ($request->hasFile('logo')) {
                    $logoPath = $request->file('logo')->store('logos', 'public'); // Store in the 'logos' directory
                }
                $company = CompanyModel::create([
                    'user_id' => $user->id,
                    'name' => $request->company_name,
                    'slug' => $slug,
                    'code' => $companyCode,
                    'logo' => $logoPath
                ]);
                // Store card details
                CardModel::create([
                    'company_id' => $company->id,
                    'card_number' => $request->card_number,
                    'card_owner_name' => $request->card_owner_name,
                    'expiry_date' => $request->expiry_date,
                    'cvv' => $request->cvv,
                    'package' => $request->package,
                    'plan' => $request->plan,
                ]);
                DB::commit();
                return $this->sendResponse(['company_code' => $companyCode], 'User register successfully');
            } elseif ($request->role === 'employee') {
                $company = CompanyModel::where('code', $request->company_code)->firstOrFail();
                // Register employee user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);
                $user->assignRole('employee');
                DB::commit();
                return $this->sendResponse(['user' => $user], 'User register successfully');
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating employee user: ' . $e->getMessage());
            return $this->sendError($e->getMessage(), $e->getCode());
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Authenticate user
            if (!Auth::attempt($request->only(['email', 'password']))) {
                return $this->sendError(['credentials' => ['Invalid credentials.']], 401);
            }

            $user = Auth::user();

            // Check for active tokens
            // if ($user->tokens()->where('revoked', false)->exists()) {
            //     return $this->sendError(['error' => 'User already logged in.'], 403);
            // }

            // Create a new token
            $token = $user->createToken(User::AUTH_TOKEN)->accessToken;

            return $this->sendResponse([
                'access_token' => $token,
                'user' => $user->name,
                'email' => $user->email,
            ], 'Successfully logged in');
        } catch (Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return $this->sendError('Something went wrong, error in processing login', 500);
        }
    }

    public function logout()
    {
        if (Auth::user()) {
            $user = Auth::user()->token();
            $user->revoke();

            return $this->sendResponse([], 'User logged out successfully.');
        }
        return $this->sendError(['error' => ['Invalid operation.']]);
    }

    public function forgotPassword(ForgetPasswordRequest $request)
    {
        try {
            Password::sendResetLink($request->all());
            return $this->sendResponse([], 'Reset password link sent on your email id.');
        } catch (Exception $e) {
            return $this->sendError('Something went wrong, error in processing email', 406, 406);
        }
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $reset_password_status = Password::reset($request->all(), function ($user, $password) {
            $user->password = Hash::make($password);
            $user->save();
        });

        if ($reset_password_status == Password::INVALID_TOKEN) {
            return $this->sendError(['token' => ['Invalid token.']], 400);
        }

        return $this->sendResponse([], 'Password has been reset successfully.');
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        try {
            DB::beginTransaction();
            $otpRecord = Otp::where('user_id', $request->id)->first();
            if ($otpRecord->code == $request->otp) {
                $user = User::findOrFail($request->id);
                $user->update(['otp_verified' => StatusEnum::OTP_VERIFIED]);
                $otpRecord->delete();  // Optionally, delete the OTP record after successful verification.
                DB::commit();
                return $this->sendResponse('OTP verified successfully.', 200);
            } else {
                $otpRecord?->increment('tried');  // Increment the 'tried' column on invalid attempt.
                return $this->sendError('Invalid OTP', 400);
            }
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function createPassword(CreatePasswordRequest $request, User $user)
    {
        try {
            if ($user->hasRole('company')) {
                $user->update(
                    ['password' => $request->password]
                );
            }
            return $this->sendResponse('Password created successfully.', 200);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function approveUser(User $user)
    {
        try {
            DB::beginTransaction();
            $authUser = auth()->user();
            $roleName = $user->roles->first()->name;
            $companyCode = optional($user->company)->code; // Safely access company code

            switch ($roleName) {
                case StatusEnum::COMPANY:
                    // if ($authUser->cannot('approve-company')) {
                    //     return $this->sendError('Unauthorized access', 403);
                    // }

                    $otp = random_int(1000, 9999);
                    $user->otp()->updateOrCreate(['user_id' => $user->id], ['code' => $otp]);

                    CompanyApprovedEmailJob::dispatch($user->email, $companyCode, $otp);
                    $user->update(['is_active' => StatusEnum::ACTIVE]);
                    break;

                case StatusEnum::EMPLOYEE:
                    // if ($authUser->cannot('approve-employee')) {
                    //     return $this->sendError('Unauthorized access', 403);
                    // }

                    EmployeeApproveEmailJob::dispatch($user->email);
                    $user->update([
                        'is_active' => StatusEnum::ACTIVE,
                        'otp_verified' => StatusEnum::OTP_VERIFIED,
                    ]);
                    break;

                default:
                    DB::rollBack();
                    return $this->sendError('Invalid user role', 400);
            }

            DB::commit();
            return $this->sendResponse(ucfirst($roleName) . ' approved successfully, email dispatched.', 200);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        try {
            DB::beginTransaction();
            $data = $request->all();
            $user = Auth::user();

            if (isset($data['password'])) {
                $data['password'] = bcrypt($data['password']); //password in needed
            }

            $user->update($data);
            DB::commit();
            return $this->sendResponse([], 'Profile Updated Successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
