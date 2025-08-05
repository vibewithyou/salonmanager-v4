
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SalonController;

Route::get('/', [HomeController::class, 'index']);
Route::get('/salon/{slug}', [SalonController::class, 'show']);
