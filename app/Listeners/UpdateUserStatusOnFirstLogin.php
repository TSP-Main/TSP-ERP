<?php

namespace App\Listeners;

use App\Classes\StatusEnum;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class UpdateUserStatusOnFirstLogin
{
    /**
     * Create the event listener.
     */
    // public function __construct()
    // {
    //     //
    // }

    /**
     * Handle the event.
     */
    public function handle(Authenticated $event): void
    {
        dd('here1');
        logger('Authenticated event triggered');
        Log::info('Authenticated event triggereds');
        $user = $event->user;
        // dd($user);

        // Check if the user's status is 'invited' and update it to 'approved'
        if ($user->status === StatusEnum::INVITED) {
            dd('here');
            $user->update(['status' => StatusEnum::APPROVED]);
            $user->employee()->update(['status' => StatusEnum::APPROVED]);
        }
    }
}
