<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AdminDeadlineController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Fetch deadlines for calendar (all or filtered by month if requested, but frontend sends date)
        // Frontend sends ?date=YYYY-MM-DD
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : Carbon::now();
        $startOfMonth = $date->copy()->startOfMonth()->subDays(7); // buffer
        $endOfMonth = $date->copy()->endOfMonth()->addDays(7);

        $query = Deadline::with('property')
            ->whereBetween('deadline_date', [$startOfMonth, $endOfMonth]);

        // Filters
        if ($request->filled('workflow') && $request->workflow !== 'All Workflows') {
            // Mapping friendly names to types
             $workflowMap = [
                'Tax Sale' => ['filing', 'payment', 'tax_sale'], 
                'Foreclosure' => ['hearing', 'expiry', 'foreclosure'],
                'Redemption' => ['redemption'],
                'Barment' => ['barment'],
                'Quiet Title' => ['quiet_title', 'qt'],
                'Sheriff' => ['sheriff_sale', 'sheriff'],
                'Auction' => ['auction'],
                'Tax Appeal' => ['appeal', 'tax_appeal'],
            ];
            if (isset($workflowMap[$request->workflow])) {
                $query->whereIn('type', $workflowMap[$request->workflow]);
            }
        }

        if ($request->filled('type') && $request->type !== 'All Types') {
            $query->where('type', $request->type);
        }

        if ($request->filled('county') && $request->county !== 'All Counties') {
            $query->whereHas('property', function($q) use ($request) {
                $q->where('county', $request->county);
            });
        }

        $deadlines = $query->get();

        $calendarEvents = $deadlines->map(function ($d) {
            return [
                'id' => $d->id,
                'title' => $d->description,
                'start' => $d->deadline_date->format('Y-m-d'),
                'type' => $d->type,
                'status' => $d->status,
                'color' => $this->getColorForType($d->type),
                'description' => $d->description,
                'deadline_date' => $d->deadline_date->toIso8601String(),
                'property' => $d->property ? [
                    'id' => $d->property->id,
                    'address' => $d->property->address,
                    'county' => $d->property->county
                ] : null
            ];
        });

        // Upcoming Deadlines (Global or Filtered?) 
        // Usually upcoming list respects the same filters but shows future items beyond current month view
        $upcomingQuery = Deadline::with('property')
            ->where('deadline_date', '>=', Carbon::today())
            ->where('status', '!=', 'completed');

        // Apply same filters to upcoming
        if ($request->filled('workflow') && $request->workflow !== 'All Workflows') {
            // Mapping friendly names to types
            $workflowMap = [
                'Tax Sale' => ['filing', 'payment', 'tax_sale'], 
                'Foreclosure' => ['hearing', 'expiry', 'foreclosure'],
                'Redemption' => ['redemption'],
                'Barment' => ['barment'],
                'Quiet Title' => ['quiet_title', 'qt'],
                'Sheriff' => ['sheriff_sale', 'sheriff'],
                'Auction' => ['auction'],
                'Tax Appeal' => ['appeal', 'tax_appeal'],
            ];
            if (isset($workflowMap[$request->workflow])) {
                $upcomingQuery->whereIn('type', $workflowMap[$request->workflow]);
            }
        }
        if ($request->filled('type') && $request->type !== 'All Types') {
            $upcomingQuery->where('type', $request->type);
        }
        if ($request->filled('county') && $request->county !== 'All Counties') {
            $upcomingQuery->whereHas('property', function($q) use ($request) {
                $q->where('county', $request->county);
            });
        }

        $upcomingDeadlines = $upcomingQuery->orderBy('deadline_date', 'asc')
            ->take(10)
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'task_name' => $d->description,
                    'due_date' => $d->deadline_date->format('M d, Y'),
                    'status' => ucfirst($d->status),
                    'priority' => 'High', 
                    'type' => $d->type,
                    'deadline_date' => $d->deadline_date->toIso8601String(),
                    'description' => $d->description,
                    'property' => $d->property ? [
                        'id' => $d->property->id,
                        'address' => $d->property->address,
                        'county' => $d->property->county
                    ] : null
                ];
            });
        
        // Get list of distinct counties for filter dropdown
        $counties = \App\Models\Property::distinct()->whereNotNull('county')->pluck('county')->sort()->values();
        // Get list of distinct types
        $types = Deadline::distinct()->pluck('type')->sort()->values();

        return response()->json([
            'success' => true,
            'calendarEvents' => $calendarEvents,
            'upcomingDeadlines' => $upcomingDeadlines,
            'filters' => [
                'counties' => $counties,
                'types' => $types
            ]
        ]);
    }

    public function export(Request $request)
    {
        $fileName = 'deadlines_' . now()->format('Y-m-d') . '.csv';
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $query = Deadline::with('property');
        
        // Apply filters (same as dashboard)
        if ($request->filled('workflow') && $request->workflow !== 'All Workflows') {
             $workflowMap = [
                'Tax Sale' => ['filing', 'payment', 'tax_sale'], 
                'Foreclosure' => ['hearing', 'expiry', 'foreclosure'],
                'Redemption' => ['redemption'],
                'Barment' => ['barment'],
                'Quiet Title' => ['quiet_title', 'qt'],
                'Sheriff' => ['sheriff_sale', 'sheriff'],
                'Auction' => ['auction'],
                'Tax Appeal' => ['appeal', 'tax_appeal'],
            ];
            if (isset($workflowMap[$request->workflow])) {
                $query->whereIn('type', $workflowMap[$request->workflow]);
            }
        }

        if ($request->filled('county') && $request->county !== 'All Counties') {
            $query->whereHas('property', function($q) use ($request) {
                $q->where('county', $request->county);
            });
        }
        if ($request->filled('type') && $request->type !== 'All Types') {
            $query->where('type', $request->type);
        }

        $columns = ['ID', 'Date', 'Type', 'Description', 'Status', 'Property Address', 'County'];

        $callback = function() use($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $query->chunk(100, function($deadlines) use($file) {
                foreach ($deadlines as $d) {
                    $row = [
                        $d->id,
                        $d->deadline_date->format('Y-m-d'),
                        $d->type,
                        $d->description,
                        $d->status,
                        $d->property ? $d->property->address : 'N/A',
                        $d->property ? $d->property->county : 'N/A'
                    ];

                    fputcsv($file, $row);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Deadline::with('property')->orderBy('deadline_date', 'asc');
        
        if ($request->has('limit')) {
            $deadlines = $query->paginate($request->input('limit', 15));
        } else {
            $deadlines = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => $deadlines
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('Store deadline request:', $request->all());

        try {
            $validated = $request->validate([
                'type' => 'required|string',
                'deadline_date' => 'required|date',
                'description' => 'required|string',
                'status' => 'required|string'
            ]);

            $deadline = Deadline::create($validated);

            return response()->json([
                'success' => true,
                'data' => $deadline
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing deadline: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $deadline = Deadline::findOrFail($id);
        $deadline->update($request->all());
        return response()->json(['success' => true, 'data' => $deadline]);
    }

    public function destroy($id): JsonResponse
    {
        Deadline::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    private function getColorForType($type)
    {
        $colors = [
            'filing' => '#3B82F6',
            'payment' => '#10B981',
            'hearing' => '#F59E0B',
            'expiry' => '#EF4444'
        ];
        return $colors[$type] ?? '#64748B';
    }
}
