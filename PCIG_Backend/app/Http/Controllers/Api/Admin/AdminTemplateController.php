<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Template::with('creator');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:notice,contract,letter,email,document',
            'content' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        $template = Template::create([
            'name' => $request->name,
            'type' => $request->type,
            'content' => $request->content,
            'variables' => $request->variables,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $template,
            'message' => 'Template created successfully'
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $template = Template::findOrFail($id);
        return response()->json(['data' => $template]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $template = Template::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:notice,contract,letter,email,document',
            'content' => 'sometimes|string',
            'variables' => 'nullable|array',
        ]);

        $template->update($request->only(['name', 'type', 'content', 'variables']));

        return response()->json([
            'success' => true,
            'data' => $template,
            'message' => 'Template updated successfully'
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $template = Template::findOrFail($id);
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }
}
