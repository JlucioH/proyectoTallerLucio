<?php
// app/Models/ImagenItem.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenItem extends Model {
    protected $table = 'imagenItem';
    protected $primaryKey = 'idImagenItem';
    protected $fillable = ['rutaImagenItem', 'ordenImagenItem', 'idItem'];

    public function item() {
        return $this->belongsTo(Item::class, 'idItem');
    }
}