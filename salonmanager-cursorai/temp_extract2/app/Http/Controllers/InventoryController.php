<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Carbon\Carbon;

class InventoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $salon = $user->salon;
        
        if (!$salon) {
            return redirect()->route('salon.select')->with('error', 'Bitte wählen Sie einen Salon aus');
        }

        $inventory = InventoryItem::where('salon_id', $salon->id)
            ->with(['product', 'transactions'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $lowStockItems = InventoryItem::where('salon_id', $salon->id)
            ->where('quantity', '<=', 5)
            ->with('product')
            ->get();

        $totalValue = InventoryItem::where('salon_id', $salon->id)
            ->join('products', 'inventory_items.product_id', '=', 'products.id')
            ->selectRaw('SUM(inventory_items.quantity * products.price) as total_value')
            ->first()
            ->total_value ?? 0;

        return view('inventory.index', compact('inventory', 'lowStockItems', 'totalValue', 'salon'));
    }

    public function create()
    {
        $user = Auth::user();
        $salon = $user->salon;
        
        $products = Product::where('salon_id', $salon->id)
            ->where('is_active', true)
            ->get();

        return view('inventory.create', compact('products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date|after:today',
            'batch_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $salon = $user->salon;
        $product = Product::find($request->product_id);

        // Check if inventory item already exists for this product
        $inventoryItem = InventoryItem::where('salon_id', $salon->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($inventoryItem) {
            // Update existing inventory
            $oldQuantity = $inventoryItem->quantity;
            $inventoryItem->update([
                'quantity' => $inventoryItem->quantity + $request->quantity,
                'location' => $request->location ?? $inventoryItem->location,
                'expiry_date' => $request->expiry_date ?? $inventoryItem->expiry_date,
                'batch_number' => $request->batch_number ?? $inventoryItem->batch_number,
                'notes' => $request->notes ?? $inventoryItem->notes,
            ]);

            // Create transaction record
            InventoryTransaction::create([
                'inventory_item_id' => $inventoryItem->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => 'stock_added',
                'performed_by' => $user->id,
                'notes' => $request->notes,
            ]);
        } else {
            // Create new inventory item
            $inventoryItem = InventoryItem::create([
                'salon_id' => $salon->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'location' => $request->location,
                'expiry_date' => $request->expiry_date,
                'batch_number' => $request->batch_number,
                'notes' => $request->notes,
                'qr_code' => $this->generateQRCode($product, $salon),
            ]);

            // Create transaction record
            InventoryTransaction::create([
                'inventory_item_id' => $inventoryItem->id,
                'type' => 'in',
                'quantity' => $request->quantity,
                'reason' => 'initial_stock',
                'performed_by' => $user->id,
                'notes' => $request->notes,
            ]);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Lagerbestand erfolgreich hinzugefügt');
    }

    public function show(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $inventoryItem->load(['product', 'transactions.user']);

        return view('inventory.show', compact('inventoryItem'));
    }

    public function edit(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $products = Product::where('salon_id', $user->salon_id)
            ->where('is_active', true)
            ->get();

        return view('inventory.edit', compact('inventoryItem', 'products'));
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:0',
            'location' => 'nullable|string|max:255',
            'expiry_date' => 'nullable|date|after:today',
            'batch_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $oldQuantity = $inventoryItem->quantity;
        $quantityDifference = $request->quantity - $oldQuantity;

        $inventoryItem->update([
            'quantity' => $request->quantity,
            'location' => $request->location,
            'expiry_date' => $request->expiry_date,
            'batch_number' => $request->batch_number,
            'notes' => $request->notes,
        ]);

        // Create transaction record if quantity changed
        if ($quantityDifference != 0) {
            InventoryTransaction::create([
                'inventory_item_id' => $inventoryItem->id,
                'type' => $quantityDifference > 0 ? 'in' : 'out',
                'quantity' => abs($quantityDifference),
                'reason' => $quantityDifference > 0 ? 'stock_adjusted' : 'stock_reduced',
                'performed_by' => $user->id,
                'notes' => $request->notes,
            ]);
        }

        return redirect()->route('inventory.index')
            ->with('success', 'Lagerbestand erfolgreich aktualisiert');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $inventoryItem->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Lagerbestand erfolgreich gelöscht');
    }

    public function scanQR(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $user = Auth::user();
        $salon = $user->salon;

        $inventoryItem = InventoryItem::where('salon_id', $salon->id)
            ->where('qr_code', $request->qr_code)
            ->with(['product', 'transactions'])
            ->first();

        if (!$inventoryItem) {
            return response()->json(['error' => 'QR-Code nicht gefunden'], 404);
        }

        return response()->json([
            'inventory_item' => $inventoryItem,
            'product' => $inventoryItem->product,
            'transactions' => $inventoryItem->transactions->take(5),
        ]);
    }

    public function generateQR(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $qrCode = QrCode::size(300)
            ->format('png')
            ->generate($inventoryItem->qr_code);

        $filename = 'qr_codes/' . $inventoryItem->id . '_' . time() . '.png';
        Storage::disk('public')->put($filename, $qrCode);

        return response()->json([
            'qr_code_url' => asset('storage/' . $filename),
            'qr_code_data' => $inventoryItem->qr_code,
        ]);
    }

    public function export(Request $request)
    {
        $user = Auth::user();
        $salon = $user->salon;

        $inventory = InventoryItem::where('salon_id', $salon->id)
            ->with(['product', 'transactions'])
            ->get();

        $filename = 'inventory_export_' . date('Y-m-d_H-i-s') . '.csv';
        $filepath = storage_path('app/public/exports/' . $filename);

        $file = fopen($filepath, 'w');

        // Write headers
        fputcsv($file, [
            'Produkt ID',
            'Produkt Name',
            'Menge',
            'Standort',
            'Verfallsdatum',
            'Chargennummer',
            'QR-Code',
            'Notizen',
            'Erstellt am',
            'Aktualisiert am'
        ]);

        // Write data
        foreach ($inventory as $item) {
            fputcsv($file, [
                $item->product->id,
                $item->product->name,
                $item->quantity,
                $item->location,
                $item->expiry_date ? $item->expiry_date->format('Y-m-d') : '',
                $item->batch_number,
                $item->qr_code,
                $item->notes,
                $item->created_at->format('Y-m-d H:i:s'),
                $item->updated_at->format('Y-m-d H:i:s')
            ]);
        }

        fclose($file);

        return response()->download($filepath, $filename)
            ->deleteFileAfterSend();
    }

    public function lowStock()
    {
        $user = Auth::user();
        $salon = $user->salon;

        $lowStockItems = InventoryItem::where('salon_id', $salon->id)
            ->where('quantity', '<=', 5)
            ->with(['product'])
            ->get();

        return view('inventory.low-stock', compact('lowStockItems'));
    }

    public function expiryAlerts()
    {
        $user = Auth::user();
        $salon = $user->salon;

        $expiringItems = InventoryItem::where('salon_id', $salon->id)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', Carbon::now()->addDays(30))
            ->where('expiry_date', '>', Carbon::now())
            ->with(['product'])
            ->get();

        return view('inventory.expiry-alerts', compact('expiringItems'));
    }

    public function transactions(InventoryItem $inventoryItem)
    {
        $user = Auth::user();
        
        if ($inventoryItem->salon_id !== $user->salon_id) {
            abort(403);
        }

        $transactions = InventoryTransaction::where('inventory_item_id', $inventoryItem->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('inventory.transactions', compact('inventoryItem', 'transactions'));
    }

    private function generateQRCode($product, $salon)
    {
        $data = [
            'type' => 'inventory',
            'salon_id' => $salon->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'timestamp' => time(),
            'hash' => md5($salon->id . $product->id . time())
        ];

        return base64_encode(json_encode($data));
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|integer|min:0',
            'items.*.action' => 'required|in:add,subtract,set',
        ]);

        $user = Auth::user();
        $salon = $user->salon;

        foreach ($request->items as $item) {
            $inventoryItem = InventoryItem::where('id', $item['id'])
                ->where('salon_id', $salon->id)
                ->first();

            if (!$inventoryItem) {
                continue;
            }

            $oldQuantity = $inventoryItem->quantity;
            $newQuantity = 0;

            switch ($item['action']) {
                case 'add':
                    $newQuantity = $oldQuantity + $item['quantity'];
                    break;
                case 'subtract':
                    $newQuantity = max(0, $oldQuantity - $item['quantity']);
                    break;
                case 'set':
                    $newQuantity = $item['quantity'];
                    break;
            }

            $inventoryItem->update(['quantity' => $newQuantity]);

            // Create transaction record
            if ($newQuantity != $oldQuantity) {
                InventoryTransaction::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'type' => $newQuantity > $oldQuantity ? 'in' : 'out',
                    'quantity' => abs($newQuantity - $oldQuantity),
                    'reason' => 'bulk_update',
                    'performed_by' => $user->id,
                    'notes' => 'Bulk-Update: ' . $item['action'] . ' ' . $item['quantity'],
                ]);
            }
        }

        return response()->json(['success' => true]);
    }
} 