<?php

namespace App\Models\Company;

use App\Models\Company\CardModel;
use App\Models\Employee\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyModel extends Model
{
    use HasFactory;

    protected $table = 'companies';
    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function card()
{
    return $this->hasOne(CardModel::class, 'company_id', 'id');
}

    public function employees()
    {
        return $this->hasMany(Employee::class, 'company_code', 'code');
    }
}
