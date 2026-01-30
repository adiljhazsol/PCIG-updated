<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    public function types(): JsonResponse
    {
        $types = [
            'financial_summary' => 'Financial Summary',
            'investor_activity' => 'Investor Activity',
            'property_performance' => 'Property Performance',
            'tax_report' => 'Tax Report'
        ];
        return response()->json(['data' => $types]);
    }

    public function history(Request $request): JsonResponse
    {
        $query = Report::with('generator');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'parameters' => 'nullable|array',
        ]);

        $type = $request->type;
        $fileName = $type . '_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $filePath = 'reports/' . $fileName;

        $headers = [];
        $data = [];

        switch ($type) {
            case 'property_performance':
                $headers = ['Property ID', 'Address', 'City', 'State', 'Purchase Price', 'Current Value', 'ROI %', 'Status'];
                $properties = Property::all();
                foreach ($properties as $prop) {
                    $data[] = [
                        $prop->id,
                        $prop->address,
                        $prop->city,
                        $prop->state,
                        $prop->purchase_price,
                        $prop->current_value,
                        $prop->roi,
                        $prop->status
                    ];
                }
                break;

            case 'financial_summary':
                $headers = ['Metric', 'Value'];
                $totalInvestment = Property::sum('purchase_price');
                $totalValue = Property::sum('current_value');
                $data[] = ['Total Investment', number_format($totalInvestment, 2)];
                $data[] = ['Total Asset Value', number_format($totalValue, 2)];
                $data[] = ['Net Appreciation', number_format($totalValue - $totalInvestment, 2)];
                $data[] = ['Active Properties', Property::whereNotIn('status', ['sold', 'closed'])->count()];
                break;
            
            default:
                 $headers = ['Message'];
                 $data[] = ['Report type not implemented yet'];
                 break;
        }

        // Generate CSV content
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $headers);
        foreach ($data as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        // Store file
        Storage::put($filePath, $content);

        $report = Report::create([
            'type' => $request->type,
            'parameters' => $request->parameters,
            'file_path' => $filePath,
            'generated_by' => $request->user()->id,
            'generated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report generated successfully'
        ], 201);
    }

    public function download($id): StreamedResponse|JsonResponse
    {
        $report = Report::findOrFail($id);

        if (!Storage::exists($report->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::download($report->file_path);
    }
}
