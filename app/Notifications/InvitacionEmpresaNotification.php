<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitacionEmpresaNotification extends Notification
{
    use Queueable;

    // 1. Declaramos las variables como públicas para que estén disponibles
    public $empresa;
    public $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($empresa, $token)
    {
        // 2. Asignamos los valores que vienen del controlador
        $this->empresa = $empresa;
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Invitación a unirse a ' . $this->empresa->nombreEmpresa)
            ->greeting('¡Hola!')
            ->line('Has sido invitado a gestionar la empresa **' . $this->empresa->nombreEmpresa . '**.')
            ->action('Aceptar Invitación', url('/registro-invitado/' . $this->token))
            ->line('Esta invitación es necesaria para completar tu registro.')
            ->salutation('Saludos, el equipo de ' . config('app.name'));
    }
    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'idEmpresa' => $this->empresa->idEmpresa,
            'token' => $this->token
        ];
    }
}