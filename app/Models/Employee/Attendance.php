<?php

namespace App\Models\Employee;

use App\Models\Company\EmployeeSchedule;
use App\Models\Company\Schedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';
    protected $guarded = ['id'];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function employeeSchedule()
    {
        return $this->belongsTo(EmployeeSchedule::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
