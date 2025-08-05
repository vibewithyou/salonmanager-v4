<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $salon = session('selected_salon');
        
        if (!$salon) {
            return redirect()->route('salon.select');
        }

        $query = Appointment::with(['customer', 'stylist', 'service'])
            ->where('salon_id', $salon->id);

        // Filter by user role
        if ($user->isStylist()) {
            $query->where('stylist_id', $user->id);
        } elseif ($user->isCustomer()) {
            $query->where('customer_id', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('start_time', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('start_time', '<=', $request->date_to);
        }

        $appointments = $query->orderBy('start_time')->paginate(20);

        return view('appointments.index', compact('appointments'));
    }

    public function create()
    {
        $salon = session('selected_salon');
        if (!$salon) {
            return redirect()->route('salon.select');
        }

        $services = Service::where('salon_id', $salon->id)->active()->get();
        $stylists = User::stylists()->where('salon_id', $salon->id)->active()->get();
        $availableSlots = $this->getAvailableSlots($salon->id);

        return view('appointments.create', compact('services', 'stylists', 'availableSlots'));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'stylist_id' => 'required|exists:users,id',
            'start_time' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
            'is_recurring' => 'boolean',
            'recurring_pattern' => 'required_if:is_recurring,true|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $salon = session('selected_salon');
        $service = Service::findOrFail($request->service_id);
        
        // Calculate end time
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($service->duration);

        // Check for conflicts
        $conflicts = Appointment::where('stylist_id', $request->stylist_id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->where('status', '!=', 'cancelled')
            ->get();

        if ($conflicts->count() > 0) {
            return back()->withErrors(['start_time' => 'Der gewählte Termin ist bereits belegt.'])->withInput();
        }

        $appointment = Appointment::create([
            'salon_id' => $salon->id,
            'customer_id' => Auth::id(),
            'stylist_id' => $request->stylist_id,
            'service_id' => $request->service_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $service->duration,
            'status' => 'pending',
            'notes' => $request->notes,
            'price' => $service->price,
            'payment_status' => 'pending',
            'is_recurring' => $request->boolean('is_recurring'),
            'recurring_pattern' => $request->recurring_pattern,
        ]);

        // Create recurring appointments if needed
        if ($request->boolean('is_recurring') && $request->recurring_pattern) {
            $this->createRecurringAppointments($appointment, $request->recurring_pattern);
        }

        // Send notifications
        $this->sendAppointmentNotifications($appointment);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Termin erfolgreich gebucht!');
    }

    public function show(Appointment $appointment)
    {
        $user = Auth::user();
        
        // Check if user has access to this appointment
        if (!$user->isAdmin() && $appointment->customer_id !== $user->id && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $appointment->load(['customer', 'stylist', 'service', 'salon']);

        return view('appointments.show', compact('appointment'));
    }

    public function edit(Appointment $appointment)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $salon = session('selected_salon');
        $services = Service::where('salon_id', $salon->id)->active()->get();
        $stylists = User::stylists()->where('salon_id', $salon->id)->active()->get();

        return view('appointments.edit', compact('appointment', 'services', 'stylists'));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $validator = Validator::make($request->all(), [
            'service_id' => 'required|exists:services,id',
            'stylist_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $service = Service::findOrFail($request->service_id);
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($service->duration);

        // Check for conflicts (excluding this appointment)
        $conflicts = Appointment::where('stylist_id', $request->stylist_id)
            ->where('id', '!=', $appointment->id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->where('status', '!=', 'cancelled')
            ->get();

        if ($conflicts->count() > 0) {
            return back()->withErrors(['start_time' => 'Der gewählte Termin ist bereits belegt.'])->withInput();
        }

        $appointment->update([
            'service_id' => $request->service_id,
            'stylist_id' => $request->stylist_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $service->duration,
            'status' => $request->status,
            'notes' => $request->notes,
            'price' => $service->price,
        ]);

        return redirect()->route('appointments.show', $appointment)
            ->with('success', 'Termin erfolgreich aktualisiert!');
    }

    public function destroy(Appointment $appointment)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $appointment->customer_id !== $user->id && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $appointment->cancel('Storniert von ' . $user->name, $user->id);

        return redirect()->route('appointments.index')
            ->with('success', 'Termin erfolgreich storniert!');
    }

    public function confirm(Appointment $appointment)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $appointment->update(['status' => 'confirmed']);

        return back()->with('success', 'Termin bestätigt!');
    }

    public function complete(Appointment $appointment)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $appointment->stylist_id !== $user->id) {
            abort(403);
        }

        $appointment->complete();

        return back()->with('success', 'Termin als abgeschlossen markiert!');
    }

    public function getAvailableSlots($salonId, $date = null, $stylistId = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::today();
        $salon = Salon::findOrFail($salonId);
        
        $slots = [];
        $startTime = $date->copy()->setTime(9, 0); // 9:00 AM
        $endTime = $date->copy()->setTime(18, 0); // 6:00 PM
        
        $interval = 30; // 30 minutes intervals
        
        for ($time = $startTime; $time < $endTime; $time->addMinutes($interval)) {
            $slotEnd = $time->copy()->addMinutes($interval);
            
            // Check if salon is open
            $dayOfWeek = strtolower($time->format('l'));
            $openingHours = $salon->getOpeningHoursForDay($dayOfWeek);
            
            if (!$openingHours || !$openingHours['open'] || !$openingHours['close']) {
                continue;
            }
            
            $openTime = Carbon::parse($openingHours['open']);
            $closeTime = Carbon::parse($openingHours['close']);
            
            if ($time < $openTime || $slotEnd > $closeTime) {
                continue;
            }
            
            // Check if stylist is available
            $available = true;
            if ($stylistId) {
                $conflicts = Appointment::where('stylist_id', $stylistId)
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($query) use ($time, $slotEnd) {
                        $query->whereBetween('start_time', [$time, $slotEnd])
                            ->orWhereBetween('end_time', [$time, $slotEnd])
                            ->orWhere(function ($q) use ($time, $slotEnd) {
                                $q->where('start_time', '<=', $time)
                                    ->where('end_time', '>=', $slotEnd);
                            });
                    })
                    ->exists();
                
                $available = !$conflicts;
            }
            
            if ($available) {
                $slots[] = [
                    'time' => $time->format('H:i'),
                    'datetime' => $time->toDateTimeString(),
                    'available' => true,
                ];
            }
        }
        
        return $slots;
    }

    private function createRecurringAppointments($parentAppointment, $pattern)
    {
        $startDate = $parentAppointment->start_time;
        $endDate = Carbon::parse($pattern['end_date'] ?? $startDate->addMonths(3));
        
        $currentDate = $startDate->copy()->addWeek();
        
        while ($currentDate <= $endDate) {
            $appointment = $parentAppointment->replicate();
            $appointment->start_time = $currentDate;
            $appointment->end_time = $currentDate->copy()->addMinutes($parentAppointment->duration);
            $appointment->parent_appointment_id = $parentAppointment->id;
            $appointment->save();
            
            // Move to next occurrence based on pattern
            switch ($pattern['type']) {
                case 'weekly':
                    $currentDate->addWeek();
                    break;
                case 'biweekly':
                    $currentDate->addWeeks(2);
                    break;
                case 'monthly':
                    $currentDate->addMonth();
                    break;
            }
        }
    }

    private function sendAppointmentNotifications($appointment)
    {
        // Send notification to stylist
        $appointment->stylist->notify(new AppointmentBookedNotification($appointment));
        
        // Send notification to customer
        $appointment->customer->notify(new AppointmentConfirmationNotification($appointment));
    }
} 