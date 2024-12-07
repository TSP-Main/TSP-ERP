<?php

namespace App\Services;

use App\Classes\StatusEnum;
use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use Exception;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\PaymentIntent;

class StripeService
{
    public function createCustomer($email, $name)
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $stripeCustomer = Customer::create([
            'email' => $email,
            'name' => $name,
        ]);

        $stripeId = $stripeCustomer->id;
        return $stripeId; // Return stripe_id
    }

    public function handleAdditionalUserPayment(string $companyCode): void
    {
        $company = CompanyModel::where('code', $companyCode)->firstOrFail();

        // Count total employees and managers
        $currentUserCount = Employee::where('company_code', $companyCode)
            ->where('status', StatusEnum::APPROVED)->count()
            + Manager::where('company_code', $companyCode)
            ->where('status', StatusEnum::APPROVED)->count();

        // Check if the user count exceeds the standard limit
        if ($currentUserCount >= StatusEnum::COMPANY_FREE_EMPLOYEES) {
            $amount = StatusEnum::PER_EMPLOYEE_CHARGE; // Charge per employee
            $currency = StatusEnum::CURRENCY; // Define currency in StatusEnum

            if (!$company->payment_method_id) {
                throw new Exception('Payment method is required for adding additional employees.');
            }

            try {
                Stripe::setApiKey(env('STRIPE_SECRET'));

                // Create a payment intent
                PaymentIntent::create([
                    'amount' => $amount,
                    'currency' => $currency,
                    'customer' => $company->user->stripe_id,
                    'payment_method' => $company->payment_method_id,
                    'off_session' => true,
                    'confirm' => true,
                ]);
            } catch (Exception $e) {
                throw new Exception('Payment failed: ' . $e->getMessage());
            }
        }
    }
}
