<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\K1Form;
use App\Models\Distribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminK1Controller extends Controller
{
    /**
     * Get dashboard data for K-1 Generation
     */
    public function dashboardData(Request $request): JsonResponse
    {
        $taxYear = $request->input('year', Carbon::now()->subYear()->year); // Default to last year

        // 1. Stats
        $totalInvestors = User::where('role_type', 'investor')->count();
        $generatedCount = K1Form::where('tax_year', $taxYear)->where('status', 'generated')->count();
        $pendingCount = K1Form::where('tax_year', $taxYear)->where('status', 'pending_review')->count();
        // For missing info, we might check users with missing profile data or specific status
        $missingInfoCount = K1Form::where('tax_year', $taxYear)->where('status', 'missing_info')->count();

        $stats = [
            ['label' => 'Total Investors', 'value' => (string)$totalInvestors, 'subtext' => "Active in $taxYear", 'icon' => 'Users', 'color' => '#3B82F6'],
            ['label' => 'Generated', 'value' => (string)$generatedCount, 'subtext' => $totalInvestors > 0 ? round(($generatedCount / $totalInvestors) * 100) . '% complete' : '0% complete', 'icon' => 'CheckCircle', 'color' => '#10B981'],
            ['label' => 'Pending Review', 'value' => (string)$pendingCount, 'subtext' => 'Requires attention', 'icon' => 'Clock', 'color' => '#F59E0B'],
            ['label' => 'Missing Info', 'value' => (string)$missingInfoCount, 'subtext' => 'Action required', 'icon' => 'AlertCircle', 'color' => '#EF4444']
        ];

        // 2. Table Data (Investors list with K-1 status)
        // Fetch investors with their profile and distributions for the tax year
        $investors = User::where('role_type', 'investor')
            ->with(['investorProfile'])
            ->get()
            ->map(function ($investor) use ($taxYear) {
                // Fetch K-1 form for this investor and year
                $k1 = K1Form::where('user_id', $investor->id)->where('tax_year', $taxYear)->first();
                
                // Calculate total distributions for the tax year
                $distributions = Distribution::where('user_id', $investor->id)
                    ->whereYear('distribution_date', $taxYear)
                    ->where('status', 'processed')
                    ->sum('amount');

                $status = $k1 ? ucfirst(str_replace('_', ' ', $k1->status)) : 'Not Started';
                
                // Determine status colors
                $statusColor = '#64748B'; // Default gray
                $statusBg = '#F1F5F9';
                
                switch (strtolower($status)) {
                    case 'generated':
                        $statusColor = '#10B981';
                        $statusBg = '#DCFCE7';
                        break;
                    case 'pending review':
                        $statusColor = '#F59E0B';
                        $statusBg = '#FEF3C7';
                        break;
                    case 'missing info':
                        $statusColor = '#EF4444';
                        $statusBg = '#FEF2F2';
                        break;
                }

                $ssn = $investor->investorProfile && $investor->investorProfile->ssn_encrypted 
                    ? '***-**-' . substr($investor->investorProfile->ssn_encrypted, -4) // Simplified masking
                    : 'N/A';

                return [
                    'id' => (string)$investor->id,
                    'name' => $investor->name,
                    'entityType' => 'Individual', // This should come from profile if available
                    'taxId' => $ssn,
                    'distributions' => '$' . number_format($distributions, 2),
                    'status' => $status,
                    'statusColor' => $statusColor,
                    'statusBg' => $statusBg,
                    'generatedDate' => $k1 ? $k1->updated_at->format('M d, Y') : '-',
                    'actions' => $k1 && $k1->status === 'generated' ? ['Download', 'Email'] : ['Generate']
                ];
            })
            ->values(); // Ensure it's a zero-indexed array for JSON

        $tableData = [
            'headers' => ['Investor Name', 'Entity Type', 'Tax ID', 'Total Distributions', 'K-1 Status', 'Generated Date', 'Actions'],
            'rows' => $investors
        ];

        // 3. Header
        $header = [
            'title' => 'K-1 Generation',
            'subtitle' => "Generate and manage K-1 tax documents for $taxYear",
            'actionButtons' => [
                'generate' => ['label' => 'Generate K-1s', 'icon' => 'Play'],
                'export' => ['label' => 'Export Report', 'icon' => 'Download']
            ]
        ];

        // 4. Sample Preview (Mock for now, or pick first investor data)
        $samplePreview = [
            ['label' => 'Investor', 'value' => $investors->first()['name'] ?? 'Example Investor'],
            ['label' => 'Address', 'value' => '123 Main St, Miami, FL'],
            ['label' => 'SSN/TIN', 'value' => $investors->first()['taxId'] ?? '***-**-0000'],
            ['label' => 'Capital Account', 'value' => '$100,000.00'],
            ['label' => 'Share of Profit', 'value' => '1.5%']
        ];

        return response()->json([
            'k1Generation' => [
                'header' => $header,
                'stats' => $stats,
                'tableData' => $tableData,
                'samplePreview' => $samplePreview
            ]
        ]);
    }
}
