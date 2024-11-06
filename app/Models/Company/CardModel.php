<?php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardModel extends Model
{
    use HasFactory;

    protected $table = 'cards';
    protected $guarded = ['id'];

    public function company()
    {
        return $this->belongsTo(CompanyModel::class, 'company_id', 'id');
    }
}
