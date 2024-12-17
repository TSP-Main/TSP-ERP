<?php

namespace App\Models\Company;

use App\Models\Employee\Employee;
use App\Models\Employee\Manager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeSchedule extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function manager()
    {
        return $this->belongsTo(Manager::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}
