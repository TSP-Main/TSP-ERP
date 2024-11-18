import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(
    "pk_test_51QI3wzRwCYjkbSmY4LeDertVkRSOUCBhyMilBNm7TfKk0wDZn0PDFgmjPTaJmoVI6QX0bpw9rqmpmox7ngRmZiX200W6NgWdKs"
);
