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
    // public function __construct(string $guard, $user)
    // {
    //     //
    // }

    /**
     * Handle the event.
     */
    public function handle(Authenticated $event): void
    {
        // Access the user and guard from the event
        $user = $event->user;
        $guard = $event->guard;

        // Update the user's status if it's 'INVITED'
        if ($user->status === StatusEnum::INVITED) {
            $user->update(['status' => StatusEnum::APPROVED]);
            $user->employee()->update(['status' => StatusEnum::APPROVED]);
        }
    }
}
