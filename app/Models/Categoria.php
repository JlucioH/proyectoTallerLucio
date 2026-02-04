<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model {
    protected $table = 'categorias';
    protected $primaryKey = 'idCategoria';
    protected $fillable = ['nombreCategoria', 'estadoCategoria', 'idEmpresa'];

    protected $casts = [
        'estadoCategoria' => 'boolean',
    ];

    public function items() {
        return $this->hasMany(Item::class, 'idCategoria');
    }
    
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }
}