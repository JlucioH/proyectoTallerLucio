<x-mail::message>
# Hola,

Has sido invitado a formar parte del equipo de **{{ $invitacion->empresa->nombreEmpresa }}**.

Para completar tu registro y configurar tu cuenta, por favor haz clic en el botón de abajo:

<x-mail::button :url="route('invitacion.aceptar', ['token' => $invitacion->tokenInvitacionEmpresa])">
Registrarse y Unirse
</x-mail::button>

Este enlace de invitación expirará el día **{{ $invitacion->fechaExpiracionEmpresa->format('d/m/Y') }}**.

Si no esperabas esta invitación, puedes ignorar este correo.

Gracias,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>