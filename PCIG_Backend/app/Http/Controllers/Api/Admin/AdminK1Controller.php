<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\K1Form;
use App\Models\Distribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
            ['label' => 'Total Investors', 'value' => (string)$totalInvestors, 'subtext' => "Active in " . ($taxYear + 1), 'icon' => 'Users', 'color' => '#3B82F6'],
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

                // Placeholders for P/L and Depreciation (logic to be implemented based on fund allocations)
                $pl = 0.00; 
                $depreciation = 0.00;
                $totalAlloc = $pl + $distributions; // Simplified logic

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
                    'status' => $status,
                    'statusColor' => $statusColor,
                    'statusBg' => $statusBg,
                    'pl' => '$' . number_format($pl, 2),
                    'depreciation' => '$' . number_format($depreciation, 2),
                    'distributions' => '$' . number_format($distributions, 2),
                    'totalAlloc' => '$' . number_format($totalAlloc, 2),
                    'totalAllocColor' => $totalAlloc > 0 ? '#10B981' : '#64748B',
                    'actions' => $k1 && $k1->status === 'generated' ? ['Download', 'Email'] : ['Generate']
                ];
            })
            ->values(); // Ensure it's a zero-indexed array for JSON

        $tableData = [
            'headers' => ['Investor', 'Data Status', 'P/L', 'Depreciation', 'Distributions', 'Total Alloc.', 'Action'],
            'rows' => $investors,
            'reviewCount' => $investors->count() // For the tab badge
        ];

        // 3. Header
        $header = [
            'title' => 'K-1 Generation Center',
            'subtitle' => "Automated Schedule K-1 generation for Tax Year $taxYear",
            'actionButtons' => [
                'generate' => ['label' => 'Generate All K-1s', 'icon' => 'Play'],
                'export' => ['label' => 'Export Tax Data (CSV)', 'icon' => 'Download']
            ]
        ];

        // 4. Sample Preview (Real data from first generated K1 or first investor)
        $previewInvestor = User::where('role_type', 'investor')->with('investorProfile')->first();
        
        if ($previewInvestor) {
            $totalCapital = \App\Models\FundInvestment::where('user_id', $previewInvestor->id)->sum('amount') + 
                            \App\Models\Investment::where('user_id', $previewInvestor->id)->sum('amount');
                            
            $samplePreview = [
                ['label' => 'Investor', 'value' => $previewInvestor->name],
                ['label' => 'Address', 'value' => $previewInvestor->investorProfile ? 
                    ($previewInvestor->investorProfile->address_street . ', ' . $previewInvestor->investorProfile->address_city . ', ' . $previewInvestor->investorProfile->address_state) : 'N/A'],
                ['label' => 'SSN/TIN', 'value' => $previewInvestor->investorProfile && $previewInvestor->investorProfile->ssn_encrypted ? '***-**-' . substr($previewInvestor->investorProfile->ssn_encrypted, -4) : 'N/A'],
                ['label' => 'Capital Account', 'value' => '$' . number_format($totalCapital, 2)],
                ['label' => 'Share of Profit', 'value' => 'Dynamic %'] // Complex to calc on fly
            ];
        } else {
             $samplePreview = [
                ['label' => 'Investor', 'value' => 'No Data'],
                ['label' => 'Address', 'value' => 'No Data'],
                ['label' => 'SSN/TIN', 'value' => 'No Data'],
                ['label' => 'Capital Account', 'value' => '$0.00'],
                ['label' => 'Share of Profit', 'value' => '0%']
            ];
        }

        return response()->json([
            'k1Generation' => [
                'header' => $header,
                'stats' => $stats,
                'tableData' => $tableData,
                'samplePreview' => $samplePreview
            ]
        ]);
    }

    /**
     * Generate K-1 Forms
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            Log::info('K1 Generation started', $request->all());

            $request->validate([
                'tax_year' => 'required|integer',
                'scope' => 'required|string', // all, fund, property, selected
            ]);

            $taxYear = $request->input('tax_year');
            
            // Fetch investors with their fund investments
            $investors = User::where('role_type', 'investor')
                ->with('fundInvestments.fund')
                ->get();
                
            $count = 0;

            foreach ($investors as $investor) {
                // If investor has no fund investments, we can't generate a K-1 linked to a fund
                // For demo purposes, if we need to force generation, we'd need a default fund.
                // Here we'll stick to actual investments.
                $fundInvestments = $investor->fundInvestments;
                
                // Group by fund to ensure one K-1 per fund per year
                $uniqueFunds = $fundInvestments->unique('fund_id');
                
                foreach ($uniqueFunds as $investment) {
                    $fund = $investment->fund;
                    if (!$fund) continue;

                    // Check if K1 already exists
                    $existingK1 = K1Form::where('user_id', $investor->id)
                        ->where('fund_id', $fund->id)
                        ->where('tax_year', $taxYear)
                        ->first();
                    
                    // Define file path
                    $fileName = "{$investor->id}_{$fund->id}_k1.pdf";
                    $relativePath = "k1s/{$taxYear}/{$fileName}";

                    // Create dummy PDF content if it doesn't exist physically
                    if (!Storage::disk('public')->exists($relativePath)) {
                        $dummyContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Outlines 2 0 R /Pages 3 0 R >>\nendobj\n2 0 obj\n<< /Type /Outlines /Count 0 >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /ProcSet 6 0 R >> >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(K-1 Form for Investor {$investor->name} - Fund {$fund->name}) Tj\nET\nendstream\nendobj\n6 0 obj\n[/PDF /Text]\nendobj\nxref\n0 7\n0000000000 65535 f\n0000000009 00000 n\n0000000074 00000 n\n0000000120 00000 n\n0000000179 00000 n\n0000000300 00000 n\n0000000393 00000 n\ntrailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n423\n%%EOF";
                        
                        Storage::disk('public')->put($relativePath, $dummyContent);
                    }

                    if (!$existingK1) {
                        K1Form::create([
                            'user_id' => $investor->id,
                            'fund_id' => $fund->id,
                            'tax_year' => $taxYear,
                            'status' => 'generated',
                            'file_path' => $relativePath,
                            'generated_at' => now(),
                            'generated_by' => Auth::id() ?? 1, // Default to admin if running from console/tinker
                        ]);
                        $count++;
                    }
                }
            }

            Log::info("K1 Generation completed. Generated: $count");

            return response()->json([
                'message' => "Successfully generated $count K-1 forms",
                'count' => $count
            ]);
        } catch (\Exception $e) {
            Log::error('K1 Generation failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download K-1 Form
     */
    public function download($id)
    {
        $k1 = K1Form::findOrFail($id);
        
        if (!Storage::disk('public')->exists($k1->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->download(Storage::disk('public')->path($k1->file_path));
    }

    /**
     * View K-1 Form (Inline)
     */
    public function view($id)
    {
        $k1 = K1Form::findOrFail($id);
        
        if (!Storage::disk('public')->exists($k1->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file(Storage::disk('public')->path($k1->file_path));
    }

    /**
     * List K-1 Forms
     */
    public function index(Request $request): JsonResponse
    {
        $taxYear = $request->input('year', Carbon::now()->subYear()->year);
        
        $forms = K1Form::with('user')
            ->where('tax_year', $taxYear)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json($forms);
    }

    /**
     * Publish/Send K-1 Forms
     */
    public function publish(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:k1_forms,id'
        ]);
        
        $ids = $request->input('ids');
        
        K1Form::whereIn('id', $ids)->update([
            'status' => 'published'
        ]);
        
        return response()->json(['message' => 'K-1 forms published successfully']);
    }
}
