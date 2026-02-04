<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VentaRealizadaNotification extends Notification
{
    use Queueable;

    protected $venta;
    protected $pdfContent;

    public function __construct($venta, $pdfContent)
    {
        $this->venta = $venta;
        $this->pdfContent = $pdfContent;
    }

    public function via($notifiable): array
    {
        return ['mail']; // Puedes añadir 'database' después si quieres historial en la web
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tu comprobante de compra #' . $this->venta->idVenta)
            ->greeting('¡Gracias por tu compra, ' . $notifiable->razonSocialCliente . '!')
            ->line('Adjunto encontrarás el detalle de tu compra realizada el ' . now()->format('d/m/Y'))
            ->attachData($this->pdfContent, 'ticket-venta.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}