<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('home');
});

// Dummy-Daten
$salons = [
    ['id' => 1, 'name' => 'Barber Bros Leipzig'],
    ['id' => 2, 'name' => 'Cut & Style Berlin'],
    ['id' => 3, 'name' => 'Haarwerk Hamburg'],
];

// Salonauswahl anzeigen
Route::get('/salon/wechseln', function () use ($salons) {
    return view('salon.auswahl', ['salons' => $salons]);
});

// Salon speichern
Route::post('/salon/auswahl', function (Request $request) use ($salons) {
    $salon = collect($salons)->firstWhere('id', $request->input('salon_id'));
    if ($salon) {
        session(['selected_salon' => $salon]);
    }
    return redirect('/');
});

