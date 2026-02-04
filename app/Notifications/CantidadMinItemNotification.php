<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CantidadMinItemNotification extends Notification
{
    use Queueable;

    protected $item;

    public function __construct($item)
    {
        // Recibimos el objeto del item con stock bajo
        $this->item = $item;
    }

    public function via($notifiable): array
    {
        // Usamos 'database' para que se guarde en la tabla que creamos en el Paso 1
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'idItem'      => $this->item->idItem,
            'nombreItem'  => $this->item->nombreItem,
            'cantidad'    => $this->item->cantidadItem,
            'cantidadMin' => $this->item->cantidadMinItem,
            'idEmpresa'   => $this->item->idEmpresa,
            'mensaje'     => "El item {$this->item->nombreItem} tiene stock bajo ({$this->item->cantidadItem})",
        ];
    }
}