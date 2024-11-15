<?php

use App\Models\Company\CompanyModel;
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

function getUserTimezone($ipAddress)
{
    try {
        // geolocation service API key.
        $token = env('IPINFO_SECRET');
        $response = Http::get("https://ipinfo.io/{$ipAddress}?token={$token}");

        if ($response->successful()) {
            $data = $response->json();
            return $data['timezone'] ?? 'UTC'; // Default to UTC if timezone is not found
        }

        return 'UTC'; // Fallback in case of error
    } catch (Exception $e) {
        Log::error("Failed to get timezone: " . $e->getMessage());
        return 'UTC';
    }
}


function getStripePriceId($package, $plan)
{
    $prices = [
        'basic' => ['monthly' => 'price_1QJvoWRwCYjkbSmYSvf0oJjd', 'yearly' => 'price_1QJxPhRwCYjkbSmYyrTG68El'],
        'standard' => ['monthly' => 'price_1QJxKcRwCYjkbSmYU3mDyUKI', 'yearly' => 'price_1QJxKcRwCYjkbSmYhuzkDU3D'],
        'premium' => ['monthly' => 'price_1QJxMCRwCYjkbSmYGEn2dfkc', 'yearly' => 'price_1QJxOkRwCYjkbSmYjvvihtyO'],
    ];

    return $prices[$package][$plan] ?? null;
}
