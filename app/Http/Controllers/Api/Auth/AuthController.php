<?php

namespace App\Http\Controllers\Api\Auth;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Auth\CreatePasswordRequest;
use Exception;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Requests\Auth\ForgetPasswordRequest;
use App\Http\Requests\Auth\GetAllUserRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\verifyForgetPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;


class AuthController extends BaseController
{
    /** @intelephense-ignore */

    public function register(RegisterUserRequest $request)
    {
        try {
            DB::beginTransaction();
            if ($request->role === StatusEnum::COMPANY) {
                $user = User::create([
                    'name' => $request->company_name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);
                $user->assignRole(StatusEnum::COMPANY);
                // Generate unique company code
                $companyCode = 'CPM-' . strtoupper(uniqid());
                $slug = generateCompanySlug($request->company_name); // Use the helper function to generate a unique slug
                $logoPath = null;
                if ($request->hasFile('logo')) {
                    $logoPath = $request->file('logo')->store('logos', 'public'); // Store in the 'logos' directory
                }
                $company = $user->company()->create([
                    'user_id' => $user->id,
                    'name' => $request->company_name,
                    'slug' => $slug,
                    'code' => $companyCode,
                    'logo' => $logoPath,
                    'package' => $request->package,
                    'plan' => $request->plan,
                    'payment_method_id' => $request->payment_method_id
                ]);
                DB::commit();
                return $this->sendResponse(['user' => $user], 'User register successfully');
            } elseif ($request->role === StatusEnum::EMPLOYEE) {
                $company = CompanyModel::where('code', $request->company_code)->firstOrFail();
                // Register employee user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'status' => StatusEnum::NOT_APPROVED
                ]);
                $user->assignRole(StatusEnum::EMPLOYEE);
                Employee::create([
                    'user_id' => $user->id,
                    'company_code' => $company->code,
                    'status' => StatusEnum::NOT_APPROVED
                ]);
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
            $user = User::where('email', $request->email)->first();
            // Check if user exists and verify password
            if (!$user || !Hash::check($request->password, $user->password)) {
                return $this->sendError('Invalid credentials');
            }

            // Check for active tokens
            // if ($user->tokens()->where('revoked', false)->exists()) {
            //     return $this->sendError(['error' => 'User already logged in.'], 403);
            // }

            if (($user->hasRole([StatusEnum::COMPANY, StatusEnum::EMPLOYEE, StatusEnum::MANAGER])) && $user->is_active != StatusEnum::ACTIVE) {
                return $this->sendError(['error' => 'Account is not active. Please contact support.'], 403);
            }

            // Fire the Authenticated event manually
            if ($user->status === StatusEnum::INVITED) {
                event(new Authenticated('api', $user));
            }

            // Create a new token
            $token = $user->createToken(User::AUTH_TOKEN)->accessToken;

            return $this->sendResponse([
                'access_token' => $token,
                'user' => $user->name,
                'email' => $user->email,
            ], 'Successfully logged in');
        } catch (Exception $e) {
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
            // Password::sendResetLink(['email' => $request->email]);
            $otp = rand(1000, 9999);

            // Store OTP in the cache for 30 minutes (adjust as needed)
            $email = $request->email;
            Cache::put('password_reset_otp_' . $email, $otp, now()->addMinutes(30));

            //send otp via email
            Mail::send('emails.otp.PasswordResetOtp', ['otp' => $otp], function ($message) use ($email) {
                $message->to($email)
                    ->subject('Your Password Reset OTP');
            });

            return $this->sendResponse([], 'OTP sent to your email.');
        } catch (Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            return $this->sendError('Something went wrong, error in processing email', 406, 406);
        }
    }

    public function verifyForgetPasswordOtp(verifyForgetPasswordOtpRequest $request)
    {
        $email = $request->email;
        $otp = $request->otp;

        // Check if the OTP matches
        $cachedOtp = Cache::get('password_reset_otp_' . $email);
        if ($cachedOtp && $cachedOtp == $otp) {
            // OTP is valid; proceed to allow password reset
            Cache::forget('password_reset_otp_' . $email);

            // Generate a temporary token for password reset
            $token = Str::random(64);

            // Store the token in the database or cache (optional)
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                ['token' => $token, 'created_at' => now()]
            );

            return $this->sendResponse(['token' => $token], 'OTP verified successfully.');
        }

        return $this->sendError('Invalid or expired OTP.', 400, 400);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        DB::beginTransaction();
        try {
            // Validate token and reset the password
            $record = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $request->token)
                ->first();

            if ($record && now()->subMinutes(30)->lt($record->created_at)) {
                // Update the user's password
                $user = User::where('email', $request->email)->firstOrFail();
                $user->update(['password' => bcrypt($request->password)]);

                // Clean up the token
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();

                return $this->sendResponse([], 'Password reset successfully.');
            }
            DB::commit();
            return $this->sendError('Invalid or expired token.', 400, 400);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Password reset error: ' . $e->getMessage());
            return $this->sendError('Something went wrong', 406, 406);
        }
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

    public function updateProfile(UpdateProfileRequest $request)
    {
        try {
            DB::beginTransaction();
            $data = $request->except('email');
            $user = Auth::user();

            if (isset($data['password'])) {
                $data['password'] = bcrypt($data['password']); //password is needed
            }

            $user->update($data);
            DB::commit();
            return $this->sendResponse([], 'Profile Updated Successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function loggedInUserDetail()
    {
        $user = auth()->user();

        if (!$user) {
            return $this->sendResponse(null, 'User is not authenticated.');
        }

        $user->load(['roles']);

        if ($user->hasRole(StatusEnum::MANAGER) && $user->manager) {
            $user->load(['manager.company']);
        } elseif ($user->hasRole(StatusEnum::EMPLOYEE) && $user->employee) {
            $user->load(['employee.company']);
        } elseif ($user->hasRole(StatusEnum::COMPANY) && $user->company) {
            $user->load(['company']);
        }

        return $this->sendResponse($user, 'User details retrieved successfully');
    }

    public function getAllUsers(GetAllUserRequest $request)
    {
        $paginate = $request->per_page ?? 20;
        $this->authorize('get-all-users');
        $users = User::with(['employee', 'manager', 'company'])->paginate($paginate);
        if (!$users) {
            return $this->sendResponse('No user found');
        }
        return $this->sendResponse($users, 'All users displayed');
    }

    public function updateIsActiveStatus($id)
    {
        try {
            // Fetch the user with active status and roles (employee or manager)
            $user = User::where('id', $id)
                ->where('is_active', StatusEnum::ACTIVE)
                ->whereHas('roles', function ($query) {
                    $query->whereIn('name', [StatusEnum::EMPLOYEE, StatusEnum::MANAGER]);
                })
                ->firstOrFail();

            // Update the user's active status
            $user->update(['is_active' => StatusEnum::INACTIVE]);

            // Update related models if applicable
            if ($user->hasRole(StatusEnum::EMPLOYEE)) {
                $employee = Employee::where('user_id', $id)
                    ->where('is_active', StatusEnum::ACTIVE)
                    ->first();

                if ($employee) {
                    $employee->update(['is_active' => StatusEnum::INACTIVE]);
                }
            }

            if ($user->hasRole(StatusEnum::MANAGER)) {
                $manager = Manager::where('user_id', $id)
                    ->where('is_active', StatusEnum::ACTIVE)
                    ->first();

                if ($manager) {
                    $manager->update(['is_active' => StatusEnum::INACTIVE]);
                }
            }

            return $this->sendResponse([], 'User and related status updated successfully');
        } catch (ModelNotFoundException $e) {
            return $this->sendError('User not found, not active, or does not have the required role', 404);
        } catch (Exception $e) {
            Log::error('Error updating user and related statuses: ' . $e->getMessage());
            return $this->sendError('Something went wrong while updating status', 500);
        }
    }

    public function userReject(User $user)
    {
        if (!$user) {
            return $this->sendResponse([], 'User not found');
        }
        $roleName = $user->roles->first()->name;

        switch ($roleName) {
            case StatusEnum::COMPANY;
                $this->authorize('reject-company');
                $user->update(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::REJECTED]);
                break;

            case StatusEnum::EMPLOYEE;
                $this->authorize('reject-employee');
                $user->update(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::REJECTED]);
                $user->employee->update(['is_active' => StatusEnum::INACTIVE, 'status' => StatusEnum::REJECTED]);
                break;
        }
        return $this->sendResponse(ucfirst($roleName) . 'rejected', 200);
    }

    public function userInviteCancel(User $user)
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

    public function rejectedUser(Request $request, $companyCode)
    {
        try {
            $paginate = $request->per_page ?? 20;
            $managerId = $request->manager_id;

            $query = Employee::where('company_code', $companyCode)
                ->where('status', StatusEnum::REJECTED)
                ->when($managerId, function ($query) use ($managerId) {
                    $query->where('manager_id', $managerId);
                })
                ->with('user');

            $users = $query->paginate($paginate);

            if ($users->isEmpty()) {
                return $this->sendResponse([], 'No rejected users found');
            }

            return $this->sendResponse($users, 'Rejected users successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
