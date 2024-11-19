<?php

namespace App\Jobs\Employee;

use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AddEmployeeInvitationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    private $companyCode, $employee;
    public function __construct($companyCode, $employee)
    {
        $this->companyCode = $companyCode;
        $this->employee = $employee;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $data = [
                'companyCode' => $this->companyCode,
                'employee' => $this->employee,
            ];

            // Send the email using the data array
            Mail::send('emails.employee.AddEmployeeEmail', $data, function ($m) {
                $m->from(config('mail.from.address'), config('app.name', 'APP Name'));
                $m->to($this->employee->email)->subject('Add Employee');
            });
        } catch (Exception $e) {
            // Log the error if the email fails
            Log::error('Failed to send add employee email: ' . $e->getMessage());
        }
    }

}
