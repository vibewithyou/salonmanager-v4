<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckSalonAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has a selected salon
        if (!$user->salon_id) {
            return redirect()->route('salon.select')->with('error', 'Bitte wählen Sie einen Salon aus.');
        }

        // Check if user's salon is active
        if (!$user->salon || !$user->salon->is_active) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Ihr Salon ist nicht mehr aktiv.');
        }

        // For admin users, allow access to all salons
        if ($user->isAdmin()) {
            return $next($request);
        }

        // For other users, check if they belong to the salon
        if ($user->salon_id != $user->salon->id) {
            return redirect()->route('salon.select')->with('error', 'Sie haben keinen Zugriff auf diesen Salon.');
        }

        return $next($request);
    }
} 