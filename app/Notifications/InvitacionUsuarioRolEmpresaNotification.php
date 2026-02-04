<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitacionUsuarioRolEmpresaNotification extends Notification
{
    use Queueable;

    public $empresa;
    public $token;

    public function __construct($empresa, $token)
    {
        $this->empresa = $empresa;
        $this->token = $token;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        // Usamos el nombre de la ruta definido en web.php
        $url = route('invitaciones.empresa.aceptar', ['token' => $this->token]);

        return (new MailMessage)
            ->subject('Invitación a unirse a ' . $this->empresa->nombreEmpresa)
            ->greeting('¡Hola!')
            ->line('Has sido invitado a colaborar en la empresa **' . $this->empresa->nombreEmpresa . '**.')
            ->action('Aceptar Invitación', $url)
            ->line('Si ya tienes una cuenta en el sistema, solo deberás confirmar la unión. Si eres nuevo, podrás crear tu cuenta ahora.')
            ->salutation('Saludos, el equipo de ' . config('app.name'));
    }
}