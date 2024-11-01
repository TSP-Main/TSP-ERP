<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
            'time_in' => 'required|date_format:Y-m-d H:i:s',
            'time_out' => 'nullable|date_format:Y-m-d H:i:s|after_or_equal:time_in',
        ];
    }

    public function messages(): array
    {
        return [
            'time_out.after_or_equal' => 'The time out must be after or equal to the time in.',
            'time_in.date_format' => 'The time in must follow the format: Y-m-d H:i:s.',
            'time_out.date_format' => 'The time out must follow the format: Y-m-d H:i:s.',
        ];
    }
}
