<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>SalonManager</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            background-color: #000;
            color: #d4af37;
            font-family: 'Playfair Display', serif;
            text-align: center;
            padding: 40px 20px;
        }
        .logo {
            font-size: 30px;
            margin-bottom: 20px;
        }
        .headline {
            font-size: 28px;
            margin-bottom: 40px;
        }
        .button {
            display: block;
            background-color: #1a1a1a;
            color: white;
            border: 1px solid #d4af37;
            padding: 15px;
            margin: 10px auto;
            width: 80%;
            max-width: 300px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="logo">💈 <strong>SalonManager</strong></div>

    @if (session()->has('selected_salon'))
        <div class="headline">Willkommen bei:<br>{{ session('selected_salon.name') }}</div>
        <a href="/salon/wechseln" class="button">Salon wechseln</a>
        <a href="/salon/termin" class="button">TERMIN BUCHEN</a>
        <a href="/salon/galerie" class="button">GALERIE</a>
        <a href="/salon/preise" class="button">PREISE</a>
        <a href="/salon/treuekarte" class="button">TREUEKARTE</a>
        <a href="/salon/aktionen" class="button">AKTIONEN</a>
    @else
        <div class="headline">Willkommen im Salon!</div>
        <a href="/salon/wechseln" class="button">Salon auswählen</a>
    @endif
</body>
</html>
