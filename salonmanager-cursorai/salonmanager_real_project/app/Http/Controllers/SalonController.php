
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SalonController extends Controller {
    public function show($slug) {
        return view('salon', ['slug' => $slug]);
    }
}
