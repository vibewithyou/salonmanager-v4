@props(['appointment'])

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 
    @if($appointment->status === 'confirmed') border-green-500
    @elseif($appointment->status === 'completed') border-blue-500
    @elseif($appointment->status === 'cancelled') border-red-500
    @else border-yellow-500 @endif">
    
    <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full 
                @if($appointment->status === 'confirmed') bg-green-500
                @elseif($appointment->status === 'completed') bg-blue-500
                @elseif($appointment->status === 'cancelled') bg-red-500
                @else bg-yellow-500 @endif">
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ $appointment->service->name }}
            </h3>
        </div>
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
            @if($appointment->status === 'confirmed') bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200
            @elseif($appointment->status === 'completed') bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200
            @elseif($appointment->status === 'cancelled') bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200
            @else bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 @endif">
            {{ ucfirst($appointment->status) }}
        </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Datum & Zeit</p>
            <p class="text-sm text-gray-900 dark:text-white">
                {{ $appointment->start_time->format('d.m.Y H:i') }} - {{ $appointment->end_time->format('H:i') }}
            </p>
        </div>
        
        <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Stylist</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ $appointment->stylist->name }}</p>
        </div>

        @if($appointment->customer)
        <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Kunde</p>
            <p class="text-sm text-gray-900 dark:text-white">{{ $appointment->customer->name }}</p>
        </div>
        @endif

        <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Preis</p>
            <p class="text-sm text-gray-900 dark:text-white">€{{ number_format($appointment->price, 2) }}</p>
        </div>
    </div>

    @if($appointment->notes)
    <div class="mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Notizen</p>
        <p class="text-sm text-gray-900 dark:text-white">{{ $appointment->notes }}</p>
    </div>
    @endif

    @if($appointment->payment_status)
    <div class="mb-4">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Zahlungsstatus</p>
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
            @if($appointment->payment_status === 'paid') bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200
            @elseif($appointment->payment_status === 'pending') bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200
            @else bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 @endif">
            {{ ucfirst($appointment->payment_status) }}
        </span>
    </div>
    @endif

    @if($appointment->is_recurring)
    <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
        <div class="flex items-center">
            <svg class="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-sm text-blue-700 dark:text-blue-300">
                Wiederkehrender Termin ({{ $appointment->recurring_pattern }})
            </span>
        </div>
    </div>
    @endif

    <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex space-x-2">
            @if($appointment->status === 'pending')
                @can('confirm', $appointment)
                <form action="{{ route('appointments.confirm', $appointment) }}" method="POST" class="inline">
                    @csrf
                    @method('PATCH')
                    <button type="submit" class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Bestätigen
                    </button>
                </form>
                @endcan
            @endif

            @if($appointment->status === 'confirmed')
                @can('complete', $appointment)
                <form action="{{ route('appointments.complete', $appointment) }}" method="POST" class="inline">
                    @csrf
                    @method('PATCH')
                    <button type="submit" class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Abschließen
                    </button>
                </form>
                @endcan
            @endif

            @if(in_array($appointment->status, ['pending', 'confirmed']))
                @can('cancel', $appointment)
                <form action="{{ route('appointments.destroy', $appointment) }}" method="POST" class="inline" onsubmit="return confirm('Sind Sie sicher, dass Sie diesen Termin stornieren möchten?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Stornieren
                    </button>
                </form>
                @endcan
            @endif
        </div>

        <div class="flex space-x-2">
            <a href="{{ route('appointments.show', $appointment) }}" class="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Anzeigen
            </a>

            @can('update', $appointment)
            <a href="{{ route('appointments.edit', $appointment) }}" class="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Bearbeiten
            </a>
            @endcan
        </div>
    </div>
</div> 