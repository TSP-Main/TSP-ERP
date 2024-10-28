<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    use HasFactory;

    // protected $guarded = ['id'];
    protected $fillable = ['user_id', 'code', 'tried', 'resend_code_limit'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
