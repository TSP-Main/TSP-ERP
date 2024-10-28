<?php

namespace App\Jobs\Company;

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
    private $email;
    public function __construct($email)
    {
        $this->email = $email;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $data = [
                'email' => $this->email,
            ];

            Mail::send('emails.company.ApproveEmployeeEmail', $data, function ($m) {
                $m->from(config('mail.from.address'), config('app.name', 'APP Name'));
                $m->to($this->email)->subject('Employee Approved.');
            });
        } catch (Exception $e) {
            Log::error('Failed to send employee approval email: ' . $e->getMessage());
        }
    }
}
