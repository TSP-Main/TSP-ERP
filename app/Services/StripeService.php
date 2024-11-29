<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Customer;

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
}
