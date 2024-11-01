<?php

namespace App\Classes;

use Illuminate\Support\Carbon;

class StatusEnum
{

    public const USER = "user";
    public const GUEST = "guest";

    public const currency = "USD";
    public const SUCCESS = "SUCCESS";
    public const PAYPALSUCCESSWITHWARNING = "SUCCESSWITHWARNING";
    public const SHIPPINGADDRESSCREATED = "Shipping address created successfully";
    public const SHIPPINGADDRESSUPDATED = "Shipping address updated successfully";

    // public const EXPIRY_DATE = Carbon::createFromFormat('m/y', $request->expiry_date)->endOfMonth();

    public const ACTIVE = 1;
    public const INACTIVE = 0;

    public const OTP_VERIFIED = 1;

    public const COMPANY = "company";
    public const EMPLOYEE = "employee";
    public const MANAGER = "manger";

    public const DATE_FORMAT = 'Y-m-d';
    public const TIME_FORMAT = 'H:i';

    public const SCHEDULE_ACTIVE = 1;
    public const SCHEDULE_INACTIVE = 0;
}
