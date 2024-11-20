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
use App\Http\Requests\Auth\verifyForgetPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Jobs\Company\EmployeeApproveEmailJob;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
                    'logo' => $logoPath
                ]);

                Stripe::setApiKey(env('STRIPE_SECRET'));

                // Save payment method ID to the user for future subscription use
                $user->createOrGetStripeCustomer();
                // dd($user->stripe_id, $user->payment_method_id, $user->paymentMethod);

                // Ensure the user has a Stripe customer
                // if (!$user->stripe_id) {
                //     $stripeCustomer = \Stripe\Customer::create([
                //         'email' => $user->email,
                //         'name' => $user->name,
                //     ]);
                //     $user->stripe_id = $stripeCustomer->id;
                //     $user->save();
                // }
                // Attach the payment method to the Stripe customer
                try {
                    $paymentMethod = \Stripe\PaymentMethod::retrieve($request->payment_method_id);
                    // $paymentMethod->attach(['customer' => $user->stripe_id]);
                } catch (Exception $e) {
                    return $this->sendError('Invalid or already used payment method ID.', 400);
                }

                $user->updateDefaultPaymentMethod($request->payment_method_id);

                // Store package and plan details for reference after admin approval
                $company->update([
                    'package' => $request->package,
                    'plan' => $request->plan,
                ]);
                DB::commit();
                // Reload user with related company and card details
                $user->refresh()->load('company');
                return $this->sendResponse($user, 'User register successfully');
            } elseif ($request->role === StatusEnum::EMPLOYEE) {
                $company = CompanyModel::where('code', $request->company_code)->firstOrFail();
                // Register employee user
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);
                $user->assignRole(StatusEnum::EMPLOYEE);
                Employee::create([
                    'user_id' => $user->id,
                    'company_code' => $company->code,
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

            if ($user->hasRole(StatusEnum::COMPANY) && $user->is_active != StatusEnum::ACTIVE) {
                return $this->sendError(['error' => 'Account is not active. Please contact support.'], 403);
            }

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
}
