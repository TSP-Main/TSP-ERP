<?php

namespace App\Http\Controllers\Api\Payment;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\GetStripePriceIdRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Jobs\Company\EmployeeApproveEmailJob;
use App\Models\User;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Exception;
use Illuminate\Support\Facades\DB;
use Stripe\Price;
use App\Services\StripeService;

class StripePaymentController extends BaseController

{
    public function createSubscriptionPaymentIntent(GetStripePriceIdRequest $request, StripeService $stripeService)
    {
        try {
            // Retrieve package and plan from request
            $package = $request->package;
            $plan = $request->plan;

            // Get Stripe price ID using helper function
            $priceId = getStripePriceId($package, $plan);

            // Check if the price ID exists
            if (!$priceId) {
                return $this->sendResponse('Invalid package or plan', 400);
            }

            // Set Stripe secret key
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Retrieve price details from Stripe using the price_id
            $price = Price::retrieve($priceId);

            // Validate the response to ensure price exists
            if (!$price || !isset($price->unit_amount) || !isset($price->currency)) {
                return $this->sendResponse('Invalid price ID or price not found.', 400);
            }

            $stripeId = $stripeService->createCustomer($request->email, $request->name);
            session(['stripe_id' => $stripeId]);

            // Create a PaymentIntent with the price's amount, currency, and customer
            $paymentIntent = PaymentIntent::create([
                'amount' => $price->unit_amount, // Amount in cents
                'currency' => $price->currency,
                'payment_method_types' => ['card'],
                // 'customer' => $stripeId,
                'capture_method' => 'manual',
            ]);

            return $this->sendResponse([
                'priceId' => $priceId,
                'client_secret' => $paymentIntent->client_secret,
                // 'customer_id' => $stripe_id, // Return customer ID to frontend
            ], 'Payment intent created successfully', 200);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function approveUser(User $user, StripeService $stripeService)
    {
        try {
            DB::beginTransaction();

            $authUser = auth()->user();
            $roleName = $user->roles->first()->name;
            $companyCode = optional($user->company)->code; // Safely access company code

            switch ($roleName) {
                case StatusEnum::COMPANY:
                    $this->authorize('approve-company');

                    // Ensure Stripe customer exists for the user
                    if (!$user->hasStripeId()) {
                        $user->createAsStripeCustomer();
                    }

                    // Retrieve company and package details
                    $company = $user->company;
                    $package = $company->package;
                    $plan = $company->plan;

                    // Get Stripe price ID for the package and plan
                    $priceId = getStripePriceId($package, $plan);
                    if (!$priceId) {
                        return $this->sendResponse('Invalid package or plan', 400);
                    }

                    // Set Stripe secret key
                    Stripe::setApiKey(env('STRIPE_SECRET'));

                    // Retrieve price details from Stripe
                    $price = Price::retrieve($priceId);

                    // Validate Stripe price response
                    if (!$price || !isset($price->unit_amount) || !isset($price->currency)) {
                        return $this->sendResponse('Invalid price ID or price not found.', 400);
                    }

                    // Create a subscription for the user
                    $user->newSubscription('default', $priceId)->create();

                    // Add company transaction data
                    // CompanyTransaction::create([
                    //     'company_id' => $company->id,
                    //     'package' => $package,
                    //     'plan' => $plan,
                    //     'amount' => $price->unit_amount / 100, // Convert cents to dollars
                    //     'currency' => $price->currency,
                    //     'stripe_payment_intent_id' => null, // No manual intent needed for subscription
                    // ]);

                    // Dispatch email and activate the company
                    CompanyApprovedEmailJob::dispatch($user, $companyCode);
                    $user->update([
                        'is_active' => StatusEnum::ACTIVE,
                        'status' => StatusEnum::APPROVED,
                    ]);
                    break;

                case StatusEnum::EMPLOYEE:
                    $this->authorize('approve-employee');

                    EmployeeApproveEmailJob::dispatch($user->email);
                    $user->update([
                        'is_active' => StatusEnum::ACTIVE,
                        'status' => StatusEnum::APPROVED,
                    ]);
                    $user->employee()->update([
                        'is_active' => StatusEnum::ACTIVE,
                        'status' => StatusEnum::APPROVED,
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
}
