<?php

namespace App\Models\Employee;

use App\Models\Company\CompanyModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'company_code', 'joining_date', 'employment_type', 'is_active', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(CompanyModel::class, 'company_code', 'code');
    }
}
