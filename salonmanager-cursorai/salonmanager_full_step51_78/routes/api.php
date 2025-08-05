<?php

use Illuminate\Support\Facades\Route;
use App\Models\Salon;

// API-Route für alle Salons (z. B. für die Karte)
Route::get('/salons', function () {
    return Salon::all();
});
