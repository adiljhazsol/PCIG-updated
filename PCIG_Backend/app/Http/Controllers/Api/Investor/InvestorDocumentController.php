<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Models\InvestorDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InvestorDocumentController extends Controller
{
    /**
     * List all documents for the authenticated investor.
     */
    public function list(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = InvestorDocument::where('user_id', $user->id);

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $documents = $query->latest('generated_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $documents,
        ]);
    }

    /**
     * Download a specific document.
     */
    public function download(Request $request, $id)
    {
        $user = $request->user();
        $document = InvestorDocument::where('user_id', $user->id)->findOrFail($id);

        if (!Storage::exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found on server.',
            ], 404);
        }

        return Storage::download($document->file_path, $document->title . '.' . pathinfo($document->file_path, PATHINFO_EXTENSION));
    }

    /**
     * Generate a custom report of documents.
     */
    public function generateReport(Request $request)
    {
        $user = $request->user();
        $query = InvestorDocument::where('user_id', $user->id);

        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('generated_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('generated_at', '<=', $request->end_date);
        }

        if ($request->has('type') && $request->type !== 'All Documents') {
            $query->where('type', $request->type);
        }

        $documents = $query->latest('generated_at')->get();

        $filename = 'documents_report_' . date('Y-m-d_H-i-s') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($documents) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Type', 'Title', 'Year', 'Generated At', 'Created At']);

            foreach ($documents as $document) {
                fputcsv($file, [
                    $document->id,
                    $document->type,
                    $document->title,
                    $document->year,
                    $document->generated_at,
                    $document->created_at,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
