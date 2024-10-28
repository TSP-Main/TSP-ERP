<?php

use App\Models\Company\CompanyModel;
use Illuminate\Support\Str;

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
