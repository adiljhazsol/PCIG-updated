<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Deadline;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminDeadlineController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // Fetch deadlines for calendar (all or filtered by month if requested, but frontend sends date)
        // Frontend sends ?date=YYYY-MM-DD
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : Carbon::now();
        $startOfMonth = $date->copy()->startOfMonth()->subDays(7); // buffer
        $endOfMonth = $date->copy()->endOfMonth()->addDays(7);

        $deadlines = Deadline::whereBetween('deadline_date', [$startOfMonth, $endOfMonth])->get();

        $calendarEvents = $deadlines->map(function ($d) {
            return [
                'id' => $d->id,
                'title' => $d->description,
                'start' => $d->deadline_date->format('Y-m-d'),
                'type' => $d->type,
                'status' => $d->status,
                'color' => $this->getColorForType($d->type),
                'description' => $d->description,
                'deadline_date' => $d->deadline_date->toIso8601String()
            ];
        });

        $upcomingDeadlines = Deadline::where('deadline_date', '>=', Carbon::today())
            ->where('status', '!=', 'completed')
            ->orderBy('deadline_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'task_name' => $d->description,
                    'due_date' => $d->deadline_date->format('M d, Y'),
                    'status' => ucfirst($d->status),
                    'priority' => 'High', // Logic could be added
                    'type' => $d->type,
                    'deadline_date' => $d->deadline_date->toIso8601String(),
                    'description' => $d->description
                ];
            });

        return response()->json([
            'success' => true,
            'calendarEvents' => $calendarEvents,
            'upcomingDeadlines' => $upcomingDeadlines
        ]);
    }

    public function store(Request $request): JsonResponse
    {
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
