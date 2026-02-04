<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanSuscripcionEmpresa extends Model
{
    protected $table = 'planSuscripcionEmpresa';
    protected $primaryKey = 'idPlanSuscripcionEmpresa';
    protected $fillable = [
        'fechaIniPlanSuscripcionEmpresa',
        'fechaFinPlanSuscripcionEmpresa',
        'estadoPlanEmpresa',
        'idEmpresa',
        'idPlanSuscripcion'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa');
    }

    public function plan()
    {
        return $this->belongsTo(PlanSuscripcion::class, 'idPlanSuscripcion');
    }
}