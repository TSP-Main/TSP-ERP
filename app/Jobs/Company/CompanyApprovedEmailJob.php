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
use Illuminate\Support\Facades\URL;

class CompanyApprovedEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    private $email, $companyCode;
    public function __construct($user, $companyCode)
    {
        $this->email = $user->email;
        $this->companyCode = $companyCode;
        // $this->otp = $otp;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {

            $data = [
                'companyCode' => $this->companyCode,
                // 'otp' => $this->otp,
                'email' => $this->email,
            ];

            Mail::send('emails.company.ApproveCompanyEmail', $data, function ($m) {
                $m->from(config('mail.from.address'), config('app.name', 'APP Name'));
                $m->to($this->email)->subject('Company Approved.');
            });
        } catch (Exception $e) {
            Log::error('Failed to send company approval email: ' . $e->getMessage());
        }
    }
}
