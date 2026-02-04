<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model {
    use HasFactory;

    protected $table = 'items';
    protected $primaryKey = 'idItem';

    protected $fillable = [
        'codigoItem',
        'nombreItem',
        'descripcionItem', 
        'cantidadItem', 
        'costoItem', 
        'importeItem', 
        'precioVentaItem',
        'cantidadMinItem', 
        'cantidadMaxItem', 
        'estadoItem', 
        'idCategoria', 
        'idEmpresa'
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'estadoItem' => 'boolean',
        'cantidadItem' => 'decimal:2',
        'precioVentaItem' => 'float',
        'costoItem' => 'decimal:2',
        'importeItem' => 'decimal:2',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'idCategoria', 'idCategoria');
    }

    public function imagenes() {
        return $this->hasMany(ImagenItem::class, 'idItem', 'idItem');
    }

    // Obtener empresa del item
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'idEmpresa', 'idEmpresa');
    }

    /**
     * Relación con los movimientos de inventario (Ventas, Compras, etc.)
     */
    public function movimientos(): HasMany
    {
        return $this->hasMany(DetalleMovimiento::class, 'idItem', 'idItem');
    }
    public function imagenPrincipal()
    {
        return $this->hasOne(ImagenItem::class, 'idItem', 'idItem')
                    ->where('ordenImagenItem', 1);
    }
}