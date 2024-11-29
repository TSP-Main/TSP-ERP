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
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Jobs\Company\EmployeeApproveEmailJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;
use Stripe\Stripe;
use Stripe\SetupIntent;
use Illuminate\Support\Str;


class AuthController extends BaseController
{
    /** @intelephense-ignore */

    public function register(RegisterUserRequest $request)
    {
        try {
            DB::beginTransaction();

            if ($request->role === StatusEnum::COMPANY) {
                // Step 1: Create user with company role
                $user = User::create([
                    'name' => $request->company_name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);
                $user->assignRole(StatusEnum::COMPANY);

                // Step 2: Generate company details
                $companyCode = 'CPM-' . strtoupper(uniqid());
                $slug = generateCompanySlug($request->company_name);
                $logoPath = null;

                if ($request->hasFile('logo')) {
                    $logoPath = $request->file('logo')->store('logos', 'public');
                }

                $company = $user->company()->create([
                    'name' => $request->company_name,
                    'slug' => $slug,
                    'code' => $companyCode,
                    'logo' => $logoPath,
                    'package' => $request->package,
                    'plan' => $request->plan,
                ]);

                try {
                    // Step 3: Create Stripe customer
                    Stripe::setApiKey(env('STRIPE_SECRET'));
                    $stripeCustomer = \Stripe\Customer::create([
                        'email' => $request->email,
                        'name' => $request->company_name,
                    ]);
                    $user->update(['stripe_id' => $stripeCustomer->id]);

                    // Step 4: Retrieve and attach payment method to customer
                    $paymentMethod = \Stripe\PaymentMethod::retrieve($request->payment_method_id);

                    // Check if the payment method is already attached
                    if (!$paymentMethod->customer) {
                        $paymentMethod->attach(['customer' => $stripeCustomer->id]);
                    }

                    // Step 5: Set the payment method as default
                    $user->updateDefaultPaymentMethod($request->payment_method_id);

                    DB::commit();
                    return $this->sendResponse($user->refresh()->load('company'), 'Company registered successfully.');
                } catch (\Stripe\Exception\InvalidRequestException $e) {
                    DB::rollBack();
                    return $this->sendError($e->getMessage(), 400);
                }
            } elseif ($request->role === StatusEnum::EMPLOYEE) {
                // Step 1: Fetch company details
                $company = CompanyModel::where('code', $request->company_code)->firstOrFail();

                // Step 2: Create employee user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'status' => StatusEnum::NOT_APPROVED,
                ]);
                $user->assignRole(StatusEnum::EMPLOYEE);

                // Step 3: Create employee record
                Employee::create([
                    'user_id' => $user->id,
                    'company_code' => $company->code,
                    'status' => StatusEnum::NOT_APPROVED,
                ]);

                DB::commit();
                return $this->sendResponse($user, 'Employee registered successfully.');
            }

            return $this->sendError('Invalid role.', 400);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Registration Error: ' . $e->getMessage());
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

                    if (!$user->hasStripeId()) {
                        $user->createAsStripeCustomer();
                    }

                    // Retrieve package and plan from the user's company details
                    $company = $user->company;
                    $package = $company->package;
                    $plan = $company->plan;

                    // Get Stripe price ID based on the package and plan
                    $priceId = getStripePriceId($package, $plan);

                    if (!$priceId) {
                        DB::rollBack();
                        return $this->sendError('Invalid subscription plan or package', 400);
                    }

                    // Create a new subscription with the default payment method
                    $user->newSubscription('default', $priceId)->create($user->defaultPaymentMethod()->id);

                    CompanyApprovedEmailJob::dispatch($user, $companyCode);
                    $user->update(['is_active' => StatusEnum::ACTIVE, 'status' => StatusEnum::APPROVED]);
                    break;

                case StatusEnum::EMPLOYEE:
                    // if ($authUser->cannot('approve-employee')) {
                    //     return $this->sendError('Unauthorized access', 403);
                    // }

                    EmployeeApproveEmailJob::dispatch($user->email);
                    $user->update([
                        'is_active' => StatusEnum::ACTIVE,
                        'otp_verified' => StatusEnum::OTP_VERIFIED,
                        'status' => StatusEnum::APPROVED
                    ]);
                    $user->employee()->update(['is_active' => StatusEnum::ACTIVE, 'status' => StatusEnum::APPROVED]);
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

            if (($user->hasRole([StatusEnum::COMPANY, StatusEnum::EMPLOYEE])) && $user->is_active != StatusEnum::ACTIVE) {
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

        $user->load(['employee', 'company', 'roles']);

        if ($user) {
            return $this->sendResponse($user, 'User details retrieved successfully.');
        } else {
            return $this->sendResponse('User is not authenticated.');
        }
    }

    public function getAllUsers(GetAllUserRequest $request)
    {
        $paginate = $request->per_page ?? 20;
        $this->authorize('get-all-users');
        $users = User::paginate($paginate);
        if (!$users) {
            return $this->sendResponse('No user found');
        }
        return $this->sendResponse($users, 'All users displayed');
    }

    public function updateIsActiveStatus($id)
    {
        try {
            $user = User::where('id', $id)
                ->where('is_active', StatusEnum::ACTIVE)
                ->whereHas('roles', function ($query) {
                    $query->where('name', StatusEnum::EMPLOYEE);
                })
                ->firstOrFail();

            // Update the user's active status
            $user->update(['is_active' => StatusEnum::INACTIVE]);

            $employee = Employee::where('user_id', $id)
                ->where('is_active', StatusEnum::ACTIVE)
                ->first();

            if ($employee) {
                $employee->update(['is_active' => StatusEnum::INACTIVE]);
            }

            return $this->sendResponse([], 'User and employee status updated successfully');
        } catch (ModelNotFoundException $e) {
            return $this->sendError('User not found, not active, or does not have the employee role', 404);
        } catch (Exception $e) {
            Log::error('Error updating user and employee status: ' . $e->getMessage());
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

    public function useInviteCancel(User $user)
    {
        if (!$user) {
            return $this->sendResponse([], 'User not found');
        }

        $role = $user->roles->first();
        if (!$role) {
            return $this->sendResponse([], 'User role not found');
        }

        if ($role->name === StatusEnum::EMPLOYEE) {
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
            $user->employee->update($updateData);
        }

        return $this->sendResponse(ucfirst($role->name) . ' invite cancelled', 200);
    }

    public function rejectedUser(Request $request)
    {
        try {
            $paginate = $request->per_page ?? 20;
            $user = User::where('status', StatusEnum::REJECTED)->paginate($paginate);
            return $this->sendResponse($user, 'Rejected user successfully displayed');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
