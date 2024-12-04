<?php

namespace App\Models\Employee;

use App\Models\Company\CompanyModel;
use App\Models\Company\EmployeeSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['user_id', 'manager_id', 'company_code', 'joining_date', 'employment_type', 'is_active', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(CompanyModel::class, 'company_code', 'code');
    }

    public function employeeSchedules()
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function Manager()
    {
        return $this->belongsTo(Manager::class);
    }
}
