<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SalonManager</title>
    <style>
        body {
            margin: 0;
            background-color: #000;
            font-family: 'Segoe UI', sans-serif;
            color: #d4af37; /* Gold */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .welcome {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 2rem;
            text-align: center;
        }

        .btn {
            display: block;
            width: 200px;
            padding: 0.75rem;
            margin: 0.5rem 0;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            border: 2px solid white;
            border-radius: 8px;
            color: white;
            background-color: transparent;
            transition: 0.3s;
        }

        .btn:hover {
            background-color: #d4af37;
            color: black;
            border-color: #d4af37;
        }
    </style>
</head>
<body>
    <div class="logo">💈 SalonManager</div>
    <div class="welcome">Willkommen im Salon!</div>

    <a href="/termine" class="btn">Termin buchen</a>
    <a href="/galerie" class="btn">Galerie</a>
    <a href="/preise" class="btn">Preise</a>
    <a href="/treuekarte" class="btn">Treuekarte</a>
    <a href="/aktionen" class="btn">Aktionen</a>
</body>
</html>

