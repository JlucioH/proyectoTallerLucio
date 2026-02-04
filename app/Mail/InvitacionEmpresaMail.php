<?php

namespace App\Mail;

use App\Models\InvitacionEmpresa;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitacionEmpresaMail extends Mailable
{
    use Queueable, SerializesModels;

    // Definimos la propiedad pública para que esté disponible en la vista
    public function __construct(
        public InvitacionEmpresa $invitacion
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invitación para unirte a ' . $this->invitacion->empresa->nombreEmpresa,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.invitaciones.invitado', // Ruta de la vista
        );
    }
}