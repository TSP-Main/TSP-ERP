<?php

namespace App\Http\Controllers\Api\Payment;

use App\Classes\StatusEnum;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\GetStripePriceIdRequest;
use App\Jobs\Company\CompanyApprovedEmailJob;
use App\Jobs\Company\EmployeeApproveEmailJob;
use App\Models\Company\CompanyModel;
use App\Models\User;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Exception;
use Illuminate\Support\Facades\DB;
use Stripe\Price;
use App\Services\StripeService;
use Stripe\PaymentMethod;

class StripePaymentController extends BaseController

{
    public function approveUser(User $user, StripeService $stripeService)
    {
        try {
            DB::beginTransaction();

            $authUser = auth()->user();
            $roleName = $user->roles->first()->name;

            switch ($roleName) {
                case StatusEnum::COMPANY:
                    $this->authorize('approve-company');
                    $this->handleCompanyApproval($user);
                    break;

                case StatusEnum::EMPLOYEE:
                    $this->authorize('approve-employee');
                    $this->handleEmployeeApproval($user);
                    break;

                default:
                    DB::rollBack();
                    return $this->sendError('Invalid user role.', 400);
            }

            DB::commit();
            return $this->sendResponse(ucfirst($roleName) . ' approved successfully, email dispatched.', 200);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->sendError($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Handle company approval.
     */
    private function handleCompanyApproval(User $user)
    {
        $company = $user->company;

        // Validate package and plan
        $package = $company->package;
        $plan = $company->plan;
        $priceId = $this->getStripePriceId($package, $plan);

        if (!$priceId) {
            throw new Exception('Invalid package or plan.', 400);
        }

        // Ensure Stripe customer exists
        if (!$user->hasStripeId()) {
            $user->createAsStripeCustomer();
        }

        // Validate and attach payment method
        $paymentMethodId = $company->payment_method_id;
        if (!$paymentMethodId) {
            throw new Exception('Payment method is required.', 400);
        }

        $this->attachPaymentMethod($user, $paymentMethodId);

        // Create subscription and handle Stripe status
        $this->createCompanySubscription($user, $priceId, $paymentMethodId);

        // Update company status and notify
        $this->updateCompanyStatus($user, $company);
    }

    /**
     * Handle employee approval.
     */
    private function handleEmployeeApproval(User $user)
    {
        EmployeeApproveEmailJob::dispatch($user->email);

        $user->update([
            'is_active' => StatusEnum::ACTIVE,
            'status' => StatusEnum::APPROVED,
        ]);

        $user->employee()->update([
            'is_active' => StatusEnum::ACTIVE,
            'status' => StatusEnum::APPROVED,
        ]);
    }

    /**
     * Attach payment method to Stripe customer.
     */
    private function attachPaymentMethod(User $user, string $paymentMethodId)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            $paymentMethod->attach(['customer' => $user->stripe_id]);

            // Set as default payment method
            $user->updateDefaultPaymentMethod($paymentMethodId);
        } catch (Exception $e) {
            throw new Exception('Failed to attach payment method: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Create a subscription for a company.
     */
    private function createCompanySubscription(User $user, string $priceId, string $paymentMethodId)
    {
        try {
            $user->newSubscription('default', $priceId)
                ->create($paymentMethodId);
        } catch (Exception $e) {
            throw new Exception('Failed to create subscription: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Update company status and dispatch email.
     */
    private function updateCompanyStatus(User $user, CompanyModel $company)
    {
        CompanyApprovedEmailJob::dispatch($user, optional($company)->code);

        $user->update([
            'is_active' => StatusEnum::ACTIVE,
            'status' => StatusEnum::APPROVED,
        ]);

        $company->update(['is_active' => StatusEnum::ACTIVE]);
    }

    /**
     * Mocked method to get Stripe price ID.
     */
    private function getStripePriceId(string $package, string $plan): ?string
    {
        // Mocked logic for retrieving price ID
        return "price_id_for_{$package}_{$plan}";
    }


    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $event = null;

        try {
            $event = \Stripe\Event::constructFrom(json_decode($payload, true));
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            return response('Invalid payload', 400);
        }

        switch ($event->type) {
            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                // Handle successful payment
                break;

            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                // Handle failed payment
                break;

            case 'customer.subscription.updated':
                $subscription = $event->data->object;
                // Handle subscription update
                break;

            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                // Handle subscription cancellation
                break;

            default:
                return response('Event type not handled', 200);
        }

        return response('Webhook handled', 200);
    }
}
