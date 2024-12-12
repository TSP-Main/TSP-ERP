<?php

namespace App\Jobs\Employee;

use App\Classes\StatusEnum;
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
    private $companyCode, $user, $plainPassword;
    public function __construct($companyCode, $user, $plainPassword)
    {
        $this->companyCode = $companyCode;
        $this->user = $user;
        $this->plainPassword = $plainPassword;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $email = $this->user->email;

            // Determine the "from" email based on the user's role
            $fromEmail = null;

            if ($this->user->roles->first()->name == StatusEnum::MANAGER) {
                $fromEmail = optional($this->user->manager->company->user)->email;
            } elseif ($this->user->roles->first()->name == StatusEnum::EMPLOYEE) {
                $fromEmail = optional($this->user->employee->company->user)->email;
            }

            // Default "from" email fallback
            if (!$fromEmail) {
                $fromEmail = config('mail.from.address', 'no-reply@example.com');
            }

            $data = [
                'companyCode' => $this->companyCode,
                'employee' => $this->user,
                'plainPassword' => $this->plainPassword,
            ];

            // Send the email using the data array
            Mail::send('emails.employee.AddEmployeeEmail', $data, function ($m) use ($fromEmail, $email) {
                $m->from($fromEmail, config('app.name', 'APP Name'));
                $m->to($email)->subject('Add Employee');
            });
        } catch (Exception $e) {
            // Log the error if the email fails
            Log::error('Failed to send add employee email: ' . $e->getMessage());
        }
    }

}
