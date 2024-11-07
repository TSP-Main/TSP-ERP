<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Exception;

class StripePaymentController extends Controller

{
    public function createPaymentIntent(Request $request)
    {
        try {
            // Set Stripe secret key
            Stripe::setApiKey(env('STRIPE_SECRET'));

            // Create a PaymentIntent with the specified amount and currency
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount * 100, // Amount in cents
                'currency' => 'usd',
                'payment_method_types' => ['card'],
            ]);

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'message' => 'Payment intent created successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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
