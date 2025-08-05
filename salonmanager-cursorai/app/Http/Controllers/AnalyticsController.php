<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Appointment;
use App\Models\Order;
use App\Models\User;
use App\Models\Service;
use App\Models\Salon;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $salon = $user->salon;
        
        if (!$salon) {
            return redirect()->route('salon.select')->with('error', 'Bitte wählen Sie einen Salon aus');
        }

        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $data = [
            'today_appointments' => $this->getTodayAppointments($salon),
            'monthly_revenue' => $this->getMonthlyRevenue($salon),
            'top_services' => $this->getTopServices($salon),
            'customer_growth' => $this->getCustomerGrowth($salon),
            'appointment_stats' => $this->getAppointmentStats($salon),
            'revenue_chart' => $this->getRevenueChart($salon),
            'stylist_performance' => $this->getStylistPerformance($salon),
            'upcoming_appointments' => $this->getUpcomingAppointments($salon),
        ];

        return view('analytics.dashboard', compact('data', 'salon'));
    }

    public function reports(Request $request)
    {
        $user = Auth::user();
        $salon = $user->salon;
        
        $dateRange = $request->get('date_range', 'this_month');
        $reportType = $request->get('report_type', 'revenue');
        
        $data = $this->generateReport($salon, $reportType, $dateRange);
        
        return view('analytics.reports', compact('data', 'salon', 'dateRange', 'reportType'));
    }

    public function export(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string|in:appointments,revenue,customers,services',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after:date_from',
            'format' => 'required|string|in:pdf,csv,excel',
        ]);

        $user = Auth::user();
        $salon = $user->salon;
        
        $data = $this->generateExportData($salon, $request->report_type, $request->date_from, $request->date_to);
        
        switch ($request->format) {
            case 'pdf':
                return $this->exportToPdf($data, $request->report_type);
            case 'csv':
                return $this->exportToCsv($data, $request->report_type);
            case 'excel':
                return $this->exportToExcel($data, $request->report_type);
        }
    }

    private function getTodayAppointments($salon)
    {
        return Appointment::where('salon_id', $salon->id)
            ->whereDate('start_time', Carbon::today())
            ->with(['customer', 'stylist', 'service'])
            ->orderBy('start_time')
            ->get();
    }

    private function getMonthlyRevenue($salon)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $currentRevenue = Appointment::where('salon_id', $salon->id)
            ->where('payment_status', 'paid')
            ->whereBetween('start_time', [$currentMonth, Carbon::now()])
            ->sum('price');

        $lastMonthRevenue = Appointment::where('salon_id', $salon->id)
            ->where('payment_status', 'paid')
            ->whereBetween('start_time', [$lastMonth, $currentMonth])
            ->sum('price');

        $growth = $lastMonthRevenue > 0 ? (($currentRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;

        return [
            'current' => $currentRevenue,
            'last_month' => $lastMonthRevenue,
            'growth' => $growth,
        ];
    }

    private function getTopServices($salon)
    {
        return Service::where('salon_id', $salon->id)
            ->withCount(['appointments' => function($query) {
                $query->where('payment_status', 'paid');
            }])
            ->withSum(['appointments' => function($query) {
                $query->where('payment_status', 'paid');
            }], 'price')
            ->orderByDesc('appointments_count')
            ->limit(5)
            ->get();
    }

    private function getCustomerGrowth($salon)
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = User::where('salon_id', $salon->id)
                ->where('role', 'customer')
                ->whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->count();
            
            $months->push([
                'month' => $month->format('M Y'),
                'count' => $count,
            ]);
        }

        return $months;
    }

    private function getAppointmentStats($salon)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today' => Appointment::where('salon_id', $salon->id)
                ->whereDate('start_time', $today)
                ->count(),
            'this_month' => Appointment::where('salon_id', $salon->id)
                ->whereBetween('start_time', [$thisMonth, Carbon::now()])
                ->count(),
            'completed_today' => Appointment::where('salon_id', $salon->id)
                ->whereDate('start_time', $today)
                ->where('status', 'completed')
                ->count(),
            'cancelled_today' => Appointment::where('salon_id', $salon->id)
                ->whereDate('start_time', $today)
                ->where('status', 'cancelled')
                ->count(),
        ];
    }

    private function getRevenueChart($salon)
    {
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenue = Appointment::where('salon_id', $salon->id)
                ->where('payment_status', 'paid')
                ->whereMonth('start_time', $month->month)
                ->whereYear('start_time', $month->year)
                ->sum('price');
            
            $months->push([
                'month' => $month->format('M Y'),
                'revenue' => $revenue,
            ]);
        }

        return $months;
    }

    private function getStylistPerformance($salon)
    {
        return User::where('salon_id', $salon->id)
            ->where('role', 'stylist')
            ->withCount(['stylistAppointments' => function($query) {
                $query->where('payment_status', 'paid');
            }])
            ->withSum(['stylistAppointments' => function($query) {
                $query->where('payment_status', 'paid');
            }], 'price')
            ->orderByDesc('stylist_appointments_count')
            ->limit(10)
            ->get();
    }

    private function getUpcomingAppointments($salon)
    {
        return Appointment::where('salon_id', $salon->id)
            ->where('start_time', '>', Carbon::now())
            ->where('status', 'confirmed')
            ->with(['customer', 'stylist', 'service'])
            ->orderBy('start_time')
            ->limit(10)
            ->get();
    }

    private function generateReport($salon, $reportType, $dateRange)
    {
        $dateRange = $this->parseDateRange($dateRange);
        
        switch ($reportType) {
            case 'revenue':
                return $this->generateRevenueReport($salon, $dateRange);
            case 'appointments':
                return $this->generateAppointmentsReport($salon, $dateRange);
            case 'customers':
                return $this->generateCustomersReport($salon, $dateRange);
            case 'services':
                return $this->generateServicesReport($salon, $dateRange);
            default:
                return [];
        }
    }

    private function parseDateRange($dateRange)
    {
        switch ($dateRange) {
            case 'today':
                return [Carbon::today(), Carbon::today()];
            case 'this_week':
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
            case 'this_month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
            case 'last_month':
                return [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()];
            case 'this_year':
                return [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()];
            default:
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
        }
    }

    private function generateRevenueReport($salon, $dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        $revenue = Appointment::where('salon_id', $salon->id)
            ->where('payment_status', 'paid')
            ->whereBetween('start_time', [$startDate, $endDate])
            ->selectRaw('
                DATE(start_time) as date,
                COUNT(*) as appointments,
                SUM(price) as revenue,
                AVG(price) as avg_price
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'type' => 'revenue',
            'data' => $revenue,
            'total_revenue' => $revenue->sum('revenue'),
            'total_appointments' => $revenue->sum('appointments'),
            'avg_revenue_per_appointment' => $revenue->avg('avg_price'),
        ];
    }

    private function generateAppointmentsReport($salon, $dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        $appointments = Appointment::where('salon_id', $salon->id)
            ->whereBetween('start_time', [$startDate, $endDate])
            ->with(['customer', 'stylist', 'service'])
            ->get();

        $statusBreakdown = $appointments->groupBy('status')->map->count();
        $stylistBreakdown = $appointments->groupBy('stylist.name')->map->count();

        return [
            'type' => 'appointments',
            'data' => $appointments,
            'status_breakdown' => $statusBreakdown,
            'stylist_breakdown' => $stylistBreakdown,
            'total_appointments' => $appointments->count(),
        ];
    }

    private function generateCustomersReport($salon, $dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        $customers = User::where('salon_id', $salon->id)
            ->where('role', 'customer')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->withCount(['appointments' => function($query) use ($dateRange) {
                $query->whereBetween('start_time', $dateRange);
            }])
            ->withSum(['appointments' => function($query) use ($dateRange) {
                $query->whereBetween('start_time', $dateRange);
            }], 'price')
            ->orderByDesc('appointments_sum_price')
            ->get();

        return [
            'type' => 'customers',
            'data' => $customers,
            'total_customers' => $customers->count(),
            'total_revenue' => $customers->sum('appointments_sum_price'),
        ];
    }

    private function generateServicesReport($salon, $dateRange)
    {
        [$startDate, $endDate] = $dateRange;

        $services = Service::where('salon_id', $salon->id)
            ->withCount(['appointments' => function($query) use ($dateRange) {
                $query->whereBetween('start_time', $dateRange);
            }])
            ->withSum(['appointments' => function($query) use ($dateRange) {
                $query->whereBetween('start_time', $dateRange);
            }], 'price')
            ->orderByDesc('appointments_count')
            ->get();

        return [
            'type' => 'services',
            'data' => $services,
            'total_services' => $services->count(),
            'total_bookings' => $services->sum('appointments_count'),
            'total_revenue' => $services->sum('appointments_sum_price'),
        ];
    }

    private function generateExportData($salon, $reportType, $dateFrom, $dateTo)
    {
        switch ($reportType) {
            case 'appointments':
                return Appointment::where('salon_id', $salon->id)
                    ->whereBetween('start_time', [$dateFrom, $dateTo])
                    ->with(['customer', 'stylist', 'service'])
                    ->get();
            case 'revenue':
                return Appointment::where('salon_id', $salon->id)
                    ->where('payment_status', 'paid')
                    ->whereBetween('start_time', [$dateFrom, $dateTo])
                    ->with(['customer', 'stylist', 'service'])
                    ->get();
            case 'customers':
                return User::where('salon_id', $salon->id)
                    ->where('role', 'customer')
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->get();
            case 'services':
                return Service::where('salon_id', $salon->id)
                    ->withCount(['appointments' => function($query) use ($dateFrom, $dateTo) {
                        $query->whereBetween('start_time', [$dateFrom, $dateTo]);
                    }])
                    ->get();
            default:
                return collect();
        }
    }

    private function exportToPdf($data, $reportType)
    {
        $pdf = PDF::loadView('analytics.exports.pdf', compact('data', 'reportType'));
        return $pdf->download("{$reportType}_report_" . date('Y-m-d') . ".pdf");
    }

    private function exportToCsv($data, $reportType)
    {
        $filename = "{$reportType}_report_" . date('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($data, $reportType) {
            $file = fopen('php://output', 'w');
            
            // Write headers based on report type
            switch ($reportType) {
                case 'appointments':
                    fputcsv($file, ['ID', 'Customer', 'Stylist', 'Service', 'Date', 'Time', 'Status', 'Price']);
                    foreach ($data as $row) {
                        fputcsv($file, [
                            $row->id,
                            $row->customer->name ?? '',
                            $row->stylist->name ?? '',
                            $row->service->name ?? '',
                            $row->start_time->format('Y-m-d'),
                            $row->start_time->format('H:i'),
                            $row->status,
                            $row->price,
                        ]);
                    }
                    break;
                case 'revenue':
                    fputcsv($file, ['ID', 'Customer', 'Service', 'Date', 'Amount', 'Payment Method']);
                    foreach ($data as $row) {
                        fputcsv($file, [
                            $row->id,
                            $row->customer->name ?? '',
                            $row->service->name ?? '',
                            $row->start_time->format('Y-m-d'),
                            $row->price,
                            $row->payment_method,
                        ]);
                    }
                    break;
                // Add more cases for other report types
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToExcel($data, $reportType)
    {
        // This would require Laravel Excel package
        // For now, return CSV as Excel
        return $this->exportToCsv($data, $reportType);
    }
} 