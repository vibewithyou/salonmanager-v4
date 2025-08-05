<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Salon auswählen</title>
    <style>
        body {
            background: #000;
            color: #d4af37;
            font-family: 'Arial', sans-serif;
            padding: 40px;
            text-align: center;
        }
        h1 {
            margin-bottom: 30px;
        }
        form {
            display: inline-block;
        }
        select, button {
            font-size: 18px;
            padding: 10px;
            margin-top: 10px;
            border-radius: 8px;
        }
        select {
            width: 250px;
        }
        button {
            background-color: #d4af37;
            border: none;
            color: black;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Salon auswählen</h1>
    <form action="/salon/auswahl" method="POST">
        @csrf
        <select name="salon_id" required>
            <option value="">-- Bitte auswählen --</option>
            @foreach ($salons as $salon)
                <option value="{{ $salon['id'] }}">{{ $salon['name'] }}</option>
            @endforeach
        </select>
        <br>
        <button type="submit">Auswählen</button>
    </form>
</body>
</html>
