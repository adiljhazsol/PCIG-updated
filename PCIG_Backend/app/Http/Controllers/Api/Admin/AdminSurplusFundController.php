<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SurplusFund;
use App\Models\SurplusFundContact;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminSurplusFundController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Stats
        $activeCases = SurplusFund::whereIn('status', ['identified', 'claim_filed', 'approved'])->count();
        $totalRecovered = SurplusFund::where('status', 'received')->sum('amount');
        $successRate = SurplusFund::where('status', 'received')->count() > 0
            ? (SurplusFund::where('status', 'received')->count() / SurplusFund::whereIn('status', ['received', 'denied'])->count()) * 100
            : 0;
        $pendingClaims = SurplusFund::where('status', 'claim_filed')->count();

        // Calculate trends (vs last month)
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $activeCasesLastMonth = SurplusFund::whereIn('status', ['identified', 'claim_filed', 'approved'])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $activeTrend = $activeCases - $activeCasesLastMonth;
        $activeTrendStr = ($activeTrend >= 0 ? '+' : '') . $activeTrend . ' vs last month';

        // Alert Banner - New funds this week
        $newFundsCount = SurplusFund::where('created_at', '>=', Carbon::now()->subWeek())->count();
        $alertBanner = $newFundsCount > 0 ? [
            'message' => "$newFundsCount new surplus funds identified this week.",
            'buttonLabel' => 'View List',
            'type' => 'info'
        ] : null;

        // Dynamic Filters
        $counties = Property::distinct('county')->pluck('county')->filter()->values()->toArray();

        // Table Rows
        $records = SurplusFund::with(['property.documents', 'contacts.creator'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($fund) {
                $statusColor = $this->getStatusColor($fund->status);
                // Background color based on status color
                $bgColors = [
                    'blue' => '#DBEAFE', // blue-100
                    'orange' => '#FFEDD5', // orange-100
                    'green' => '#DCFCE7', // green-100
                    'purple' => '#F3E8FF', // purple-100
                    'red' => '#FEE2E2', // red-100
                    'gray' => '#F3F4F6', // gray-700
                ];
                $textColors = [
                    'blue' => '#1E40AF', // blue-800
                    'orange' => '#9A3412', // orange-800
                    'green' => '#166534', // green-800
                    'purple' => '#6B21A8', // purple-800
                    'red' => '#991B1B', // red-800
                    'gray' => '#374151', // gray-700
                ];

                $colorKey = $statusColor;
                $finalStatusColor = $textColors[$colorKey] ?? '#374151';
                $finalStatusBg = $bgColors[$colorKey] ?? '#F3F4F6';

                $surplusDocs = $fund->property ? $fund->property->documents->where('type', 'surplus') : collect([]);
                $documents = $surplusDocs->isEmpty()
                    ? ['message' => 'No documents uploaded.']
                    : $surplusDocs->values()->map(function($doc) {
                        return [
                            'id' => $doc->id,
                            'name' => $doc->file_name,
                            'url' => asset('storage/' . $doc->file_path),
                            'date' => $doc->created_at->format('M d, Y')
                        ];
                    });

                return [
                    'id' => $fund->id,
                    'propertyId' => $fund->property_id,
                    'caseNumber' => $fund->case_number ?? 'SF-' . $fund->id,
                    'fcsFile' => $fund->case_number ?? 'SF-' . $fund->id,
                    'pcigId' => $fund->property ? 'PROP-' . $fund->property->id : 'Unknown',
                    'county' => $fund->property ? $fund->property->county : 'Unknown',
                    'parcelId' => $fund->property ? $fund->property->parcel_id : 'Unknown',
                    'originalOwner' => $fund->property ? ($fund->property->owner ?? 'Unknown') : 'Unknown',
                    'amount' => (float)$fund->amount,
                    'collected' => '$' . number_format($fund->amount), // Total amount
                    'surplusCollected' => $fund->status === 'received' ? '$' . number_format($fund->amount) : '$0.00',
                    'paid' => '$0.00', // Need 'paid' field or relation if tracking payments
                    'unclaimed' => '$' . number_format($fund->amount),
                    'surplusUnclaimed' => $fund->status !== 'received' ? '$' . number_format($fund->amount) : '$0.00',
                    'unclaimedColor' => '#16A34A',
                    'saleDate' => $fund->created_at->format('M d, Y'),
                    'status' => ucfirst(str_replace('_', ' ', $fund->status)),
                    'statusColor' => $finalStatusColor,
                    'statusBg' => $finalStatusBg,
                    'recipientName' => $fund->property ? ($fund->property->owner ?? 'Unknown') : 'Unknown',
                    'dateIdentified' => $fund->created_at->format('Y-m-d'),
                    'claimDeadline' => $fund->created_at->addYears(1)->format('Y-m-d'), // Assuming 1 year deadline
                    'documents' => $documents,
                    'notes' => $fund->notes ?? '',
                    'contactHistory' => $fund->contacts->map(function($contact) {
                        return [
                            'id' => $contact->id,
                            'date' => $contact->contact_date->format('M d, Y'),
                            'type' => ucfirst($contact->type),
                            'notes' => $contact->notes,
                            'user' => $contact->creator->name ?? 'Unknown',
                        ];
                    }),
                    'outreach' => $fund->contacts->where('type', 'letter')->sortByDesc('created_at')->first() ? [
                        'documentName' => 'Claim Letter - ' . $fund->contacts->where('type', 'letter')->sortByDesc('created_at')->first()->created_at->format('M d, Y'),
                        'status' => 'Sent',
                        'url' => url("/api/admin/workflow/surplus/{$fund->id}/letter")
                    ] : null,
                    'recipientInfo' => [
                        'name' => $fund->property ? ($fund->property->owner ?? '') : '',
                        'address' => $fund->property ? $fund->property->address : '',
                        'city' => $fund->property ? $fund->property->city : '',
                        'state' => $fund->property ? $fund->property->state : '',
                        'phone' => $fund->property ? $fund->property->owner_phone : ''
                    ]
                ];
            });

        return response()->json([
            'surplusFundsResearch' => [
                'header' => [
                    'title' => 'Surplus Funds Research',
                    'subtitle' => 'Identify, track, and recover surplus funds from tax sales.'
                ],
                'actionButtons' => [
                    'bulkImport' => ['label' => 'Bulk Import', 'icon' => 'Upload', 'action' => 'upload'],
                    'export' => ['label' => 'Export Report', 'icon' => 'Download', 'action' => 'export'],
                    'addRecord' => ['label' => 'New Research', 'icon' => 'Plus', 'action' => 'new']
                ],
                'alertBanner' => $alertBanner,
                'summaryCards' => [
                    ['label' => 'Active Cases', 'value' => $activeCases, 'subtext' => $activeTrendStr, 'trend' => $activeTrendStr, 'icon' => 'Search', 'color' => '#3B82F6'],
                    ['label' => 'Total Recovered', 'value' => '$' . number_format($totalRecovered), 'subtext' => 'YTD', 'trend' => 'YTD', 'icon' => 'Download', 'color' => '#10B981'],
                    ['label' => 'Success Rate', 'value' => round($successRate) . '%', 'subtext' => 'All time', 'trend' => 'All time', 'icon' => 'CheckCircle2', 'color' => '#F59E0B'],
                    ['label' => 'Pending Claims', 'value' => $pendingClaims, 'subtext' => 'Awaiting approval', 'trend' => 'Current', 'icon' => 'Clock', 'color' => '#6366F1']
                ],
                'searchPlaceholder' => 'Search by case #, county, owner, or parcel ID...',
                'filters' => [
                    ['label' => 'Status', 'selected' => 'All', 'options' => ['All', 'Identified', 'Claim Filed', 'Approved', 'Received']],
                    ['label' => 'County', 'selected' => 'All', 'options' => array_merge(['All'], $counties)],
                    ['label' => 'Amount', 'selected' => 'All', 'options' => ['All', '$0 - $5k', '$5k - $20k', '$20k+']]
                ],
                'generateLettersButton' => ['label' => 'Generate Claim Letters'],
                'tableHeaders' => ['Case #', 'County', 'Parcel ID', 'Original Owner', 'Amount', 'Status', 'Date Identified', 'Claim Deadline', 'Actions'],
                'records' => $records,
                'selectedRecord' => $records->first() ?? null
            ]
        ]);
    }

    private function getStatusColor($status)
    {
        $colors = [
            'identified' => 'blue',
            'claim_filed' => 'orange',
            'approved' => 'green',
            'received' => 'purple',
            'denied' => 'red',
            'new' => 'gray'
        ];
        return $colors[$status] ?? 'gray';
    }

    public function index(Request $request): JsonResponse
    {
        $query = SurplusFund::with('property');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $fund = SurplusFund::create([
            'property_id' => $request->property_id,
            'amount' => $request->amount,
            'status' => 'identified',
            'notes' => $request->notes,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Surplus fund identified successfully'
        ], 201);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');
        $header = fgetcsv($handle); // Assume first row is header

        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            // Basic mapping logic - assuming columns: Property ID, Amount, Notes
            // In a real app, this should be more robust
            try {
                // Example: [0] => property_id, [1] => amount, [2] => notes
                if (count($row) >= 2) {
                    $propertyId = $row[0];
                    $amount = $row[1];
                    $notes = $row[2] ?? '';

                    if (Property::find($propertyId)) {
                        SurplusFund::create([
                            'property_id' => $propertyId,
                            'amount' => $amount,
                            'status' => 'identified',
                            'notes' => $notes,
                            'created_by' => $request->user()->id,
                        ]);
                        $imported++;
                    }
                }
            } catch (\Exception $e) {
                // Skip error rows
            }
        }
        fclose($handle);

        return response()->json([
            'success' => true,
            'message' => "Imported $imported records successfully."
        ]);
    }

    public function export(Request $request)
    {
        $filename = 'surplus-funds-' . date('Y-m-d') . '.csv';
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Case Number', 'Property ID', 'Amount', 'Status', 'Date Identified'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $funds = SurplusFund::with('property')->latest()->get();

            foreach ($funds as $fund) {
                $row = [
                    $fund->id,
                    $fund->case_number ?? 'SF-' . $fund->id,
                    $fund->property_id,
                    $fund->amount,
                    $fund->status,
                    $fund->created_at->format('Y-m-d'),
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function generateLetters(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:surplus_funds,id'
        ]);
        
        $count = 0;
        foreach ($request->ids as $id) {
            $fund = SurplusFund::find($id);
            if ($fund) {
                // Log the contact
                $fund->contacts()->create([
                    'type' => 'letter',
                    'notes' => 'Claim letter generated and sent.',
                    'contact_date' => now(),
                    'created_by' => $request->user()->id,
                ]);
                $count++;
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Claim letters generated and logged for ' . $count . ' records.'
        ]);
    }

    public function viewLetter($id)
    {
        $fund = SurplusFund::with('property')->findOrFail($id);
        
        $ownerName = $fund->property ? ($fund->property->owner ?? 'Owner') : 'Owner';
        $address = $fund->property ? $fund->property->address : 'Address';
        $city = $fund->property ? $fund->property->city : 'City';
        $state = $fund->property ? $fund->property->state : 'State';
        $amount = number_format($fund->amount, 2);
        $date = now()->format('F d, Y');
        
        $html = "
        <html>
        <head>
            <style>
                body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
                .header { text-align: right; margin-bottom: 40px; }
                .recipient { margin-bottom: 30px; }
                .subject { font-weight: bold; margin-bottom: 20px; text-decoration: underline; }
                .content { margin-bottom: 40px; }
                .signature { margin-top: 60px; }
            </style>
        </head>
        <body>
            <div class='header'>
                $date
            </div>
            
            <div class='recipient'>
                $ownerName<br>
                $address<br>
                $city, $state
            </div>
            
            <div class='subject'>
                RE: NOTICE OF UNCLAIMED SURPLUS FUNDS - $$amount
            </div>
            
            <div class='content'>
                <p>Dear $ownerName,</p>
                
                <p>Our records indicate that there are unclaimed surplus funds remaining from the tax sale of the property located at <strong>$address</strong>. The total amount currently held is <strong>$$amount</strong>.</p>
                
                <p>We specialize in the recovery of these funds and can assist you in filing the necessary claims to retrieve what is rightfully yours. Please note that there may be a deadline to claim these funds.</p>
                
                <p>Please contact our office at your earliest convenience to discuss how we can help you recover these funds.</p>
            </div>
            
            <div class='signature'>
                Sincerely,<br><br>
                <strong>Asset Recovery Team</strong><br>
                (555) 123-4567
            </div>
        </body>
        </html>
        ";
        
        return response($html)->header('Content-Type', 'text/html');
    }

    public function claim(Request $request, $id): JsonResponse
    {
        $fund = SurplusFund::findOrFail($id);
        
        $request->validate([
            'claim_filed_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $fund->update([
            'status' => 'claim_filed',
            'claim_filed_date' => $request->claim_filed_date,
            'notes' => $request->notes ? $fund->notes . "\n" . $request->notes : $fund->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Claim filed successfully'
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $fund = SurplusFund::findOrFail($id);

        $request->validate([
            'status' => 'required|in:identified,claim_filed,approved,received,denied',
            'received_date' => 'required_if:status,received|date|nullable',
            'notes' => 'nullable|string',
        ]);

        $fund->update([
            'status' => $request->status,
            'received_date' => $request->received_date,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'data' => $fund,
            'message' => 'Surplus fund status updated'
        ]);
    }

    public function logContact(Request $request, $id): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'notes' => 'nullable|string',
            'contact_date' => 'required|date',
        ]);

        $fund = SurplusFund::findOrFail($id);
        
        $contact = $fund->contacts()->create([
            'type' => $request->type,
            'notes' => $request->notes,
            'contact_date' => $request->contact_date,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true, 
            'data' => $contact,
            'message' => 'Contact logged successfully'
        ]);
    }

    public function updateRecipient(Request $request, $id): JsonResponse
    {
         $fund = SurplusFund::findOrFail($id);
         
         $request->validate([
             'name' => 'required|string',
             'address' => 'required|string',
             'city' => 'required|string',
             'state' => 'required|string',
             'phone' => 'nullable|string',
         ]);
         
         if ($fund->property) {
             $fund->property->update([
                 'owner' => $request->name,
                 'address' => $request->address,
                 'city' => $request->city,
                 'state' => $request->state,
                 'owner_phone' => $request->phone,
             ]);
         }
         
         return response()->json([
             'success' => true,
             'message' => 'Recipient info updated successfully'
         ]);
    }
}
