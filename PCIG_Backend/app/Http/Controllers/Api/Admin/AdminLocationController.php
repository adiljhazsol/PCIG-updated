<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLocationController extends Controller
{
    /**
     * Get all locations
     */
    public function index(Request $request): JsonResponse
    {
        $locations = Location::all();

        return response()->json([
            'success' => true,
            'data' => $locations,
        ]);
    }

    /**
     * Create a new location
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'required|string',
            'county' => 'nullable|string',
            'city' => 'nullable|string',
            'rules' => 'nullable|array',
            'fees' => 'nullable|array',
            'contact_info' => 'nullable|array',
        ]);

        $location = Location::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Location created successfully',
            'data' => $location,
        ]);
    }

    /**
     * Update a location
     */
    public function update(Request $request, $id): JsonResponse
    {
        $request->validate([
            'state' => 'required|string',
            'county' => 'nullable|string',
            'city' => 'nullable|string',
            'rules' => 'nullable|array',
            'fees' => 'nullable|array',
            'contact_info' => 'nullable|array',
        ]);

        $location = Location::findOrFail($id);
        $location->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'data' => $location,
        ]);
    }

    /**
     * Delete a location
     */
    public function destroy($id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Location deleted successfully',
        ]);
    }
}
