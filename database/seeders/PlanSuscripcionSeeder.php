<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlanSuscripcion;

class PlanSuscripcionSeeder extends Seeder
{
    public function run(): void
    {
        $planes = [
            [
                'nombrePlanSuscripcion' => 'Plan Básico',
                'tiempoPlanSuscripcion' => 12, // 1 mes
                'limiteMensualMontoPlanSuscripcion' => 5000.00,
            ],
            [
                'nombrePlanSuscripcion' => 'Plan Profesional',
                'tiempoPlanSuscripcion' => 12, // 6 meses
                'limiteMensualMontoPlanSuscripcion' => 25000.00,
            ],
            [
                'nombrePlanSuscripcion' => 'Plan Empresarial',
                'tiempoPlanSuscripcion' => 12, // 12 meses
                'limiteMensualMontoPlanSuscripcion' => 999999.99,
            ],
        ];

        foreach ($planes as $plan) {
            PlanSuscripcion::create($plan);
        }
    }
}