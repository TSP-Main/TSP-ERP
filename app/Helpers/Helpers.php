<?php

use App\Models\Company\CompanyModel;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Generate a unique slug for a given company name.
 *
 * @param string $companyName
 * @return string
 */
function generateCompanySlug($companyName)
{
    $slug = Str::slug($companyName);
    $originalSlug = $slug;
    $counter = 1;

    // Ensure slug is unique
    while (CompanyModel::where('slug', $slug)->exists()) {
        $slug = $originalSlug . '-' . $counter;
        $counter++;
    }

    return $slug;
}

function getUserTimezone(Request $request)
{
    try {
        $token = env('IPINFO_SECRET');

        // Use a test IP for local or the actual client IP for production.
        $ipAddress = app()->environment('local')
            ? '119.73.100.67' // Test IP for local
            : $request->header('X-Forwarded-For') ?? $request->ip(); // Client IP for production

        $response = Http::get("https://ipinfo.io/{$ipAddress}?token={$token}");

        if ($response->successful()) {
            $data = $response->json();
            return $data['timezone'] ?? 'UTC';
        }

        return 'UTC';
    } catch (Exception $e) {
        Log::error("Failed to get timezone: " . $e->getMessage());
        return 'UTC';
    }
}

function getStripePriceId($package, $plan)
{
    $prices = [
        'basic' => ['monthly' => 'price_1QJvoWRwCYjkbSmYSvf0oJjd', 'yearly' => 'price_1QJxPhRwCYjkbSmYyrTG68El'],
        'standard' => ['monthly' => 'price_1QSesuAmVXIJcfr6Vcc2tLSN', 'yearly' => 'price_1QJxKcRwCYjkbSmYhuzkDU3D'],
        'premium' => ['monthly' => 'price_1QJxMCRwCYjkbSmYGEn2dfkc', 'yearly' => 'price_1QJxOkRwCYjkbSmYjvvihtyO'],
    ];

    return $prices[$package][$plan] ?? null;
}
