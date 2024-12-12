<?php

namespace App\Jobs\Company;

use App\Classes\StatusEnum;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmployeeApproveEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    // dd('here', $user->employee->company->user->email);
    private $user;
    public function __construct($user)
    {
        $this->user = $user;
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
                'email' => $email,
            ];

            // Send email
            Mail::send('emails.company.ApproveEmployeeEmail', $data, function ($m) use ($email, $fromEmail) {
                $m->from($fromEmail, config('app.name', 'APP Name'));
                $m->to($email)->subject('Employee Approved');
            });
        } catch (Exception $e) {
            Log::error('Failed to send employee approval email: ' . $e->getMessage());
        }
    }
}
