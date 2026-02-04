<?php

namespace App\Observers;

use App\Models\Item;
use App\Notifications\CantidadMinItemNotification;
use Illuminate\Support\Facades\Notification;

class CantidadItemObserver
{
    public function updated(Item $item): void
    {
        // Solo si la cantidad bajó del mínimo y antes no estaba bajo el mínimo
        if ($item->cantidadItem < $item->cantidadMinItem && $item->getOriginal('cantidadItem') >= $item->cantidadMinItem) {
            
            // Obtenemos al usuario actual para notificarle
            $user = auth()->user();
            
            if ($user) {
                $user->notify(new CantidadMinItemNotification($item));
            }
        }
    }
}