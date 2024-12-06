<?php

namespace App\Models\Employee;

use App\Models\Company\CompanyModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Manager extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function employee()
    {
        return $this->hasMany(Employee::class);
    }
    public function company()
    {
        return $this->belongsTo(CompanyModel::class, 'company_code', 'code');
    }
}
