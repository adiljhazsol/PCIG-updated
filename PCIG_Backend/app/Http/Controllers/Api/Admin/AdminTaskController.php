<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminTaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['assignedUser', 'creator', 'related']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'related_type' => 'nullable|string',
            'related_id' => 'nullable|integer',
        ]);

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status,
            'due_date' => $request->due_date,
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id,
            'related_type' => $request->related_type,
            'related_id' => $request->related_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $task->load('assignedUser'),
            'message' => 'Task created successfully'
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $task = Task::with(['assignedUser', 'creator', 'related'])->findOrFail($id);
        return response()->json(['data' => $task]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $task = Task::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task->update($request->only([
            'title', 'description', 'priority', 'status', 'due_date', 'assigned_to'
        ]));

        return response()->json([
            'success' => true,
            'data' => $task->load('assignedUser'),
            'message' => 'Task updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    public function dashboardData(): JsonResponse
    {
        $stats = [
            'pending' => Task::where('status', 'pending')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'completed' => Task::where('status', 'completed')->count(),
            'high_priority' => Task::where('priority', 'high')->where('status', '!=', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent' => Task::with('assignedUser')->latest()->take(5)->get()
            ]
        ]);
    }
}
