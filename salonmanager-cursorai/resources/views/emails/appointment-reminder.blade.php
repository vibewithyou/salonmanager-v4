<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termin-Erinnerung</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .appointment-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .salon-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Termin-Erinnerung</h1>
        <p>Ihr Termin steht bevor!</p>
    </div>

    <div class="content">
        <h2>Hallo {{ $customer->name }},</h2>
        
        <p>Dies ist eine freundliche Erinnerung an Ihren bevorstehenden Termin bei uns.</p>

        <div class="appointment-details">
            <h3>Termin-Details:</h3>
            <ul>
                <li><strong>Datum:</strong> {{ $appointment->start_time->format('d.m.Y') }}</li>
                <li><strong>Uhrzeit:</strong> {{ $appointment->start_time->format('H:i') }} Uhr</li>
                <li><strong>Stylist:</strong> {{ $stylist->name }}</li>
                <li><strong>Service:</strong> {{ $service->name }}</li>
                <li><strong>Dauer:</strong> {{ $service->duration }} Minuten</li>
                <li><strong>Preis:</strong> €{{ number_format($service->price, 2) }}</li>
            </ul>
        </div>

        <div class="salon-info">
            <h4>Salon-Informationen:</h4>
            <p><strong>{{ $salon->name }}</strong></p>
            <p>{{ $salon->address }}</p>
            <p>📞 {{ $salon->phone }}</p>
            <p>📧 {{ $salon->email }}</p>
        </div>

        <h3>Wichtige Hinweise:</h3>
        <ul>
            <li>Bitte kommen Sie 10 Minuten vor Ihrem Termin an</li>
            <li>Bei Verspätung können wir Ihren Termin möglicherweise nicht vollständig durchführen</li>
            <li>Bei Fragen oder Änderungswünschen kontaktieren Sie uns bitte rechtzeitig</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('appointments.show', $appointment) }}" class="button">
                Termin anzeigen
            </a>
        </div>

        <p>Wir freuen uns auf Ihren Besuch!</p>
        
        <p>Mit freundlichen Grüßen,<br>
        <strong>{{ $salon->name }}</strong></p>
    </div>

    <div class="footer">
        <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
        <p>Für Fragen kontaktieren Sie uns unter: {{ $salon->email }}</p>
        <p>&copy; {{ date('Y') }} {{ $salon->name }}. Alle Rechte vorbehalten.</p>
    </div>
</body>
</html> 