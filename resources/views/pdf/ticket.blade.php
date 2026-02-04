<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; }
        body { 
            font-family: Arial, sans-serif; 
            width: 78mm; 
            font-size: 9px; 
            margin: 0; 
            padding: 5px; 
            color: #000; 
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .divider { 
            border-bottom: 1px solid #000; 
            margin: 2px 0; 
            width: 100%;
        }
        .bold { font-weight: bold; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            table-layout: fixed; /* Obligatorio para que los anchos se respeten */
            margin-top: 5px;
        }
        .col-descripcion { 
            width: 50%; 
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            padding-right: 5px;
        }
        
        /* Aseguramos que las otras columnas tengan un ancho fijo para que no se muevan */
        .col-cantidad { width: 8%; }
        .col-precio   { width: 8%; }
        .col-subtotal { width: 8%; }

        thead th { 
            border-bottom: 1px solid #000; 
            padding-bottom: 2px;
            font-size: 9px;
        }

        tbody td { 
            padding-top: 3px; 
            vertical-align: top; /* Alinea los números arriba si el nombre tiene varias líneas */
            font-size: 9px;
        }
        .mt-10 { margin-top: 10px; }
    </style>
</head>
<body>
    <div class="text-center">
        <div class="bold" style="font-size: 13px;">
            {{ $cabecera->empresa->nombreEmpresa ?? 'MI EMPRESA' }}
        </div>
        <div>Telefono: {{ $cabecera->empresa->telefonoEmpresa ?? '' }}</div>
        <div>{{ $cabecera->empresa->direccionEmpresa ?? '' }}</div>
    </div>

    <div class="divider"></div>
    <div class="bold text-center">
        COMPROBANTE DE VENTA #{{ $venta->idVenta }}
    </div>
    <div class="divider"></div>

    <div>
        FECHA: {{ \Carbon\Carbon::parse($cabecera->fechaCabeceraMovimiento)
                    ->timezone('America/La_Paz')
                    ->format('d/m/Y h:i:s A') }}
    </div>
    <div>CLIENTE: {{ $venta->razonSocialVenta ?? 'CONSUMIDOR FINAL' }}</div>
    <div>NIT/CI: {{ $venta->nitVenta ?? '0' }}</div>
    
    <div class="divider"></div>

    <table>
        <thead>
            <tr>
                <th align="left" class="col-descripcion">Descripción</th>
                <th align="center" valign="top" class="col-cantidad">Cant.</th>
                <th align="right" valign="top" class="col-precio">P.U.</th>
                <th align="right" valign="top" class="col-subtotal">Sub. T</th>
            </tr>
        </thead>
        <tbody>
            @foreach($detalles as $detalle)
            <tr>
                <td align="left" class="col-descripcion">
                    {{ $detalle->item->nombreItem }} </td>
                <td align="center" valign="top" class="col-cantidad">
                    {{ $detalle->cantidadDetalleMovimiento }}
                </td>
                <td align="right" valign="top" class="col-precio">
                    {{ number_format($detalle->precioDetalleMovimiento, 2) }}
                </td>
                <td align="right" valign="top" class="col-subtotal">
                    {{ number_format($detalle->precioTotalDetalleMovimiento, 2) }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="divider"></div>

    <div class="text-right bold">
        TOTAL: {{ number_format($cabecera->totalCabeceraMovimiento, 2) }} BS
    </div>
    <div class="text-right">
        RECIBIDO: {{ number_format($venta->totalRecibidoVenta ?? 0, 2) }} BS
    </div>
    <div class="text-right">
        CAMBIO: {{ number_format($venta->totalCambioVenta ?? 0, 2) }} BS
    </div>

    <div class="divider"></div>
    
    <div class="text-center">RECOPIA DE DOCUMENTO</div>
    <div class="text-center mt-10">¡GRACIAS POR SU PREFERENCIA!</div>
</body>
</html>