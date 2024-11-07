<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\Company\CompanyModel;
use App\Models\Employee\Employee;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, Billable;

    const AUTH_TOKEN = 'RotaAuthToken';
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // protected $guard_name = 'api';
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'status',
        'otp_verified',
        'message',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function company()
    {
        return $this->hasOne(CompanyModel::class);
    }

    public function otp()
    {
        return $this->hasOne(Otp::class);
    }

    public function employee()
    {
        return $this->hasOne(Employee::class);
    }
}
