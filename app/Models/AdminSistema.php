<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminSistema extends Model
{
    protected $table = 'adminSistema';
    protected $primaryKey = 'idAdminSistema';
    protected $fillable = ['id', 'idRol'];
}