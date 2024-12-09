import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key from .env
export const stripePromise = loadStripe(process.env.STRIPE_KEY);
console.log("key: " + process.env.STRIPE_KEY);