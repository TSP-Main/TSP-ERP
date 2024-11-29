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

class StripePaymentController extends BaseController

{
    // public function createPaymentIntent(Request $request)
    // {
    //     try {
    //         // Set Stripe secret key
    //         Stripe::setApiKey(env('STRIPE_SECRET'));

    //         //send price id to stripe and get amount of that price is and send that amount below

    //         // Create a PaymentIntent with the specified amount and currency
    //         $paymentIntent = PaymentIntent::create([
    //             'amount' => $request->amount * 100, // Amount in cents
    //             'currency' => 'usd',
    //             // 'automatic_payment_methods' => ['enabled' => true],
    //             'payment_method_types' => ['card'],
    //         ]);

    //         return response()->json([
    //             'client_secret' => $paymentIntent->client_secret,
    //             'message' => 'Payment intent created successfully'
    //         ], 200);
    //     } catch (Exception $e) {
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }


    public function createSubscriptionPaymentIntent(GetStripePriceIdRequest $request)
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

            // Create a Stripe Customer
            // $stripeCustomer = \Stripe\Customer::create([
            //     'email' => $request->email,
            //     'name' => $request->name,
            // ]);
            // $stripe_id = $stripeCustomer->id;

            // Create a PaymentIntent with the price's amount, currency, and customer
            $paymentIntent = PaymentIntent::create([
                'amount' => $price->unit_amount, // Amount in cents
                'currency' => $price->currency,
                'payment_method_types' => ['card'],
                // 'customer' => $stripe_id, // Associate with Stripe customer
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

                    // Call createSubscriptionPaymentIntent to get priceId
                    $subscriptionData = $this->createSubscriptionPaymentIntent($package, $plan);
                    $priceId = $subscriptionData['priceId'] ?? null;

                    if (!$priceId) {
                        DB::rollBack();
                        return $this->sendError('Invalid subscription plan or package', 400);
                    }

                    // Create a new subscription with the default payment method
                    $user->newSubscription('default', $priceId)->create($user->defaultPaymentMethod()->id);

                    CompanyApprovedEmailJob::dispatch($user, $companyCode);
                    $user->company()->update(['is_active' => StatusEnum::ACTIVE]);
                    break;

                case StatusEnum::EMPLOYEE:
                    // if ($authUser->cannot('approve-employee')) {
                    //     return $this->sendError('Unauthorized access', 403);
                    // }

                    EmployeeApproveEmailJob::dispatch($user->email);
                    $user->update([
                        'is_active' => StatusEnum::ACTIVE,
                    ]);
                    $user->employee()->update([
                        'is_active' => StatusEnum::ACTIVE,
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

    public function handlePayment(Request $request)
    {
        try {
            // Set Stripe secret key
            Stripe::setApiKey(config('services.stripe.secret'));

            // Retrieve payment details from request if needed
            // For example, use $request->payment_id if required

            // You can retrieve the payment status from the Stripe API if needed

            return response()->json([
                'message' => 'Payment processed successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
