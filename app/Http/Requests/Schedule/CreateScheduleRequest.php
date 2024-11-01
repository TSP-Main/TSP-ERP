<?php

namespace App\Http\Requests\Schedule;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
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
    return [
        // 'user_id' => 'required|exists:users,id',
        'company_id' => 'required|exists:companies,id',
        'start_date' => 'required|date_format:Y-m-d',
        'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        'start_time' => 'required|date_format:H:i',
        'end_time' => [
            'required',
            'date_format:H:i',
            function ($attribute, $value, $fail) {
                $startDateTime = Carbon::parse($this->start_date . ' ' . $this->start_time);
                $endDateTime = Carbon::parse(($this->end_date ?? $this->start_date) . ' ' . $value);

                if ($endDateTime->lessThanOrEqualTo($startDateTime)) {
                    $endDateTime->addDay(); // Handle overnight shifts
                }

                if ($endDateTime->diffInDays($startDateTime) > 1) {
                    $fail('The schedule cannot span more than one day.');
                }
            },
        ],
    ];
}


    public function messages(): array
    {
        return [
            // 'user_id.required' => 'The employee is required.',
            // 'user_id.exists' => 'The selected employee does not exist.',
            'company_id.required' => 'The company is required.',
            'company_id.exists' => 'The selected company does not exist.',
            // 'start_date.required' => 'The start date is required.',
            // 'start_date.date_format' => 'The start date must be in Y-m-d format.',
            // 'end_date.date_format' => 'The end date must be in Y-m-d format.',
            // 'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'start_time.required' => 'The start time is required.',
            'start_time.date_format' => 'The start time must be in H:i format.',
            'end_time.required' => 'The end time is required.',
            'end_time.date_format' => 'The end time must be in H:i format.',
            'end_time.after' => 'The end time must be after the start time.',
        ];
    }
}
