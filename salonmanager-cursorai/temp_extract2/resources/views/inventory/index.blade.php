@extends('layouts.app')

@section('title', 'Lagerverwaltung')

@section('content')
<div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Lagerverwaltung</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Verwalten Sie Ihre Produktbestände und QR-Codes</p>
        </div>
        <div class="flex space-x-4">
            <button onclick="openQRScanner()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"></path>
                </svg>
                QR-Scanner
            </button>
            <a href="{{ route('inventory.create') }}" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Bestand hinzufügen
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamtbestand</p>
                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ $inventory->total() }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-red-100 dark:bg-red-900">
                    <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Niedriger Bestand</p>
                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ $lowStockItems->count() }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Gesamtwert</p>
                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">€{{ number_format($totalValue, 2) }}</p>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Aktive Produkte</p>
                    <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ $inventory->where('quantity', '>', 0)->count() }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Low Stock Alerts -->
    @if($lowStockItems->count() > 0)
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
        <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 class="text-lg font-medium text-red-800 dark:text-red-200">Niedriger Bestand</h3>
        </div>
        <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{{ $lowStockItems->count() }} Produkt(e) haben einen niedrigen Bestand (≤ 5 Stück).</p>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
            @foreach($lowStockItems->take(5) as $item)
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {{ $item->product->name }} ({{ $item->quantity }})
            </span>
            @endforeach
            @if($lowStockItems->count() > 5)
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                +{{ $lowStockItems->count() - 5 }} weitere
            </span>
            @endif
        </div>
    </div>
    @endif

    <!-- Inventory Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Lagerbestand</h3>
                <div class="flex space-x-2">
                    <button onclick="exportInventory()" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        Export
                    </button>
                    <button onclick="bulkUpdate()" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium">
                        Bulk-Update
                    </button>
                </div>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produkt</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Menge</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Standort</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verfallsdatum</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wert</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    @forelse($inventory as $item)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    @if($item->product->images)
                                    <img class="h-10 w-10 rounded-full object-cover" src="{{ asset('storage/' . json_decode($item->product->images)[0]) }}" alt="{{ $item->product->name }}">
                                    @else
                                    <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                        <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                        </svg>
                                    </div>
                                    @endif
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ $item->product->name }}</div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ $item->product->sku }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 dark:text-white font-medium">{{ $item->quantity }}</div>
                            @if($item->batch_number)
                            <div class="text-xs text-gray-500 dark:text-gray-400">Chargen-Nr: {{ $item->batch_number }}</div>
                            @endif
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $item->formatted_location }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                @if($item->stock_status === 'expired') bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200
                                @elseif($item->stock_status === 'low_stock') bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200
                                @elseif($item->stock_status === 'expiring_soon') bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200
                                @else bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 @endif">
                                {{ $item->stock_status_text }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {{ $item->formatted_expiry_date }}
                            @if($item->days_until_expiry !== null)
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {{ $item->days_until_expiry > 0 ? $item->days_until_expiry . ' Tage' : 'Abgelaufen' }}
                            </div>
                            @endif
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            €{{ number_format($item->total_value, 2) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-2">
                                <a href="{{ route('inventory.show', $item) }}" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                    Anzeigen
                                </a>
                                <a href="{{ route('inventory.edit', $item) }}" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                    Bearbeiten
                                </a>
                                <button onclick="generateQR({{ $item->id }})" class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                                    QR-Code
                                </button>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Keine Lagerbestände gefunden
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {{ $inventory->links() }}
        </div>
    </div>
</div>

<!-- QR Scanner Modal -->
<div id="qrScannerModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">QR-Code Scanner</h3>
            <div id="qrScanner" class="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div class="flex justify-end space-x-3">
                <button onclick="closeQRScanner()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Abbrechen
                </button>
                <button onclick="scanQRCode()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Scannen
                </button>
            </div>
        </div>
    </div>
</div>

<!-- QR Code Modal -->
<div id="qrCodeModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3 text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">QR-Code</h3>
            <div id="qrCodeDisplay" class="w-full h-64 bg-white rounded-lg mb-4 flex items-center justify-center">
                <p class="text-gray-500 dark:text-gray-400">QR-Code wird generiert...</p>
            </div>
            <div class="flex justify-end space-x-3">
                <button onclick="closeQRCodeModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Schließen
                </button>
                <button onclick="downloadQRCode()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Herunterladen
                </button>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script src="https://unpkg.com/html5-qrcode"></script>
<script>
let currentQRCodeUrl = null;
let currentQRCodeData = null;

function openQRScanner() {
    document.getElementById('qrScannerModal').classList.remove('hidden');
    initQRScanner();
}

function closeQRScanner() {
    document.getElementById('qrScannerModal').classList.add('hidden');
    if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear();
    }
}

function initQRScanner() {
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "qrScanner",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    window.html5QrcodeScanner = html5QrcodeScanner;
}

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`);
    closeQRScanner();
    
    // Send QR code to server
    fetch('/inventory/scan-qr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ qr_code: decodedText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('QR-Code nicht gefunden: ' + data.error);
        } else {
            showInventoryItem(data.inventory_item);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Fehler beim Scannen des QR-Codes');
    });
}

function onScanFailure(error) {
    // Handle scan failure, usually ignore
    console.warn(`Code scan error = ${error}`);
}

function generateQR(inventoryItemId) {
    document.getElementById('qrCodeModal').classList.remove('hidden');
    
    fetch(`/inventory/${inventoryItemId}/generate-qr`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
    .then(response => response.json())
    .then(data => {
        currentQRCodeUrl = data.qr_code_url;
        currentQRCodeData = data.qr_code_data;
        
        const qrDisplay = document.getElementById('qrCodeDisplay');
        qrDisplay.innerHTML = `<img src="${data.qr_code_url}" alt="QR Code" class="max-w-full max-h-full">`;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('qrCodeDisplay').innerHTML = '<p class="text-red-500">Fehler beim Generieren des QR-Codes</p>';
    });
}

function closeQRCodeModal() {
    document.getElementById('qrCodeModal').classList.add('hidden');
    currentQRCodeUrl = null;
    currentQRCodeData = null;
}

function downloadQRCode() {
    if (currentQRCodeUrl) {
        const link = document.createElement('a');
        link.href = currentQRCodeUrl;
        link.download = 'qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showInventoryItem(inventoryItem) {
    // Create a modal to show inventory item details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Produkt gefunden</h3>
                <div class="space-y-2">
                    <p><strong>Produkt:</strong> ${inventoryItem.product.name}</p>
                    <p><strong>Menge:</strong> ${inventoryItem.quantity}</p>
                    <p><strong>Standort:</strong> ${inventoryItem.location || 'Kein Standort'}</p>
                    <p><strong>Status:</strong> ${inventoryItem.stock_status_text}</p>
                </div>
                <div class="flex justify-end space-x-3 mt-4">
                    <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                        Schließen
                    </button>
                    <a href="/inventory/${inventoryItem.id}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Details anzeigen
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function exportInventory() {
    window.location.href = '/inventory/export';
}

function bulkUpdate() {
    // Implement bulk update functionality
    alert('Bulk-Update Funktion wird implementiert');
}
</script>
@endpush
@endsection 