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
            'company_id' => 'required|exists:companies,id',
            'name' => 'nullable|string|max:255',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'week_day' => 'nullable|string', // E.g., 'Monday' or 'Weekend'
        ];
    }


    public function messages(): array
    {
        return [
            'company_id.required' => 'The company is required.',
            'company_id.exists' => 'The selected company does not exist.',
            'start_time.required' => 'The start time is required.',
            'start_time.date_format' => 'The start time must be in H:i:s format.',
            'end_time.required' => 'The end time is required.',
            'end_time.date_format' => 'The end time must be in H:i:s format.',
            'end_time.after' => 'The end time must be after the start time.',
        ];
    }
}
