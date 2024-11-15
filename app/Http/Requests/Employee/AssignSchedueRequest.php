<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class AssignSchedueRequest extends FormRequest
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
            '*.employee_id' => 'required|exists:employees,id',
            '*.schedule_id' => 'required|exists:schedules,id',
            '*.start_date' => 'required|date',
            '*.end_date' => 'nullable|date|after_or_equal:*.start_date',
        ];
    }
}
