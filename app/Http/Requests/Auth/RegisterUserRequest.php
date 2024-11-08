<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $this->id],
            // Role (optional)
            'role' => ['sometimes', 'string', 'exists:roles,name'], // Check if the role exists in Spatie's roles table
        ];

        // Company-specific validation
        if ($this->role === 'company') {
            $rules = array_merge($rules, [
                'company_name' => ['required', 'string', 'max:255'],
                'slug' => ['unique:companies,slug'], // Optional if user can provide a slug
                'package' => ['required', 'string', 'in:basic,standard,premium'],
                'plan' => ['required', 'string', 'in:monthly,yearly'],
                'card_number' => ['nullable', 'regex:/^(\d{4}-?){3}\d{4}$/'], // 16-20 digit card number
                'card_owner_name' => ['nullable', 'string', 'max:255'],
                'expiry_date' => ['nullable', 'regex:/^(0[1-9]|1[0-2])\/([0-9]{2})$/'], // MM/YY format
                'cvv' => ['nullable', 'digits_between:3,4'],
                'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed', // Check password confirmation
                ],
            ]);
        } // Employee-specific validation
        elseif ($this->role === 'employee') {
            $rules = array_merge($rules, [
                'company_code' => ['required', 'exists:companies,code'], // Verify code exists
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed', // Check password confirmation
                ],
            ]);
        }

        return $rules;
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            // 'role.in' => 'The role must be either "company" or "employee".',
            'role.in' => 'Invalid Role.',
            'company_code.exists' => 'The provided company code is invalid.',
            'slug.unique' => 'The slug is already taken. Please choose a different name.',
            'card_number.digits_between' => 'The card number must be between 16 and 20 digits.',
            'expiry_date.regex' => 'The expiry date format must be MM/YY.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
