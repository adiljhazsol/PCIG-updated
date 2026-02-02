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
     * Get dashboard data for County/State Configuration
     */
    public function dashboardData(Request $request): JsonResponse
    {
        $locations = Location::all();
        
        // Calculate stats
        $totalConfigured = $locations->count();
        $activeCounties = $locations->where('county', '!=', null)->count();
        $statesCovered = $locations->unique('state')->count();
        $incomplete = $locations->filter(function($loc) {
            return empty($loc->rules);
        })->count();
        
        $completeness = $totalConfigured > 0 ? round((($totalConfigured - $incomplete) / $totalConfigured) * 100) : 0;

        $overviewCards = [
            ['label' => 'Configuration Completeness', 'value' => $completeness . '%', 'icon' => 'Percent', 'color' => '#3B82F6'],
            ['label' => 'Total Configured', 'value' => (string)$totalConfigured, 'icon' => 'Globe', 'color' => '#10B981'],
            ['label' => 'Active Counties', 'value' => (string)$activeCounties, 'icon' => 'CheckCircle2', 'color' => '#F59E0B'],
            ['label' => 'Incomplete', 'value' => (string)$incomplete, 'icon' => 'AlertTriangle', 'color' => '#EF4444'],
            ['label' => 'States Covered', 'value' => (string)$statesCovered, 'icon' => 'Map', 'color' => '#6366F1'],
        ];

        // Left Sidebar Navigation
        $navigation = $locations->map(function($loc) {
            return [
                'id' => $loc->id,
                'label' => $loc->county ? "{$loc->county}, {$loc->state}" : $loc->state,
                'subtext' => 'Active',
                'active' => false
            ];
        })->values();

        $leftSidebar = [
            'title' => 'Jurisdictions',
            'addButton' => 'Add New County',
            'navigation' => $navigation
        ];
        
        // Selected Location Data
        $selectedId = $request->query('id');
        $selectedLocation = $selectedId ? $locations->firstWhere('id', $selectedId) : $locations->first();
        
        $locationData = null;
        if ($selectedLocation) {
            $locationData = [
                'id' => $selectedLocation->id,
                'jurisdictionName' => $selectedLocation->county ? "{$selectedLocation->county}, {$selectedLocation->state}" : $selectedLocation->state,
                'stateCode' => $selectedLocation->state,
                'county' => $selectedLocation->county, // Added raw county for edit forms
                'fipsCode' => $selectedLocation->contact_info['fips'] ?? '',
                'timeZone' => $selectedLocation->contact_info['timezone'] ?? '',
                'lastUpdated' => $selectedLocation->updated_at->format('M d, Y'),
                'redemptionRules' => $selectedLocation->rules['redemption'] ?? [],
                'barmentRules' => $selectedLocation->rules['barment'] ?? [],
                'quietTitleRules' => $selectedLocation->rules['quiet_title'] ?? [],
                'fees' => $selectedLocation->fees ?? [],
            ];
        }

        // Templates (Mocking for now as we don't have location-specific templates yet)
        $templates = \App\Models\Template::all()->map(function($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'type' => $t->type,
                'lastUpdated' => $t->updated_at->format('M d, Y'),
                'content' => $t->content
            ];
        });

        return response()->json([
            'header' => [
                'title' => 'County/State Configuration',
                'subtitle' => 'Manage rules, rates, and schedules for multi-county operations'
            ],
            'overviewCards' => $overviewCards,
            'leftSidebar' => $leftSidebar,
            'locations' => $locations, // Return all locations for frontend compatibility
            'selectedLocation' => $locationData,
            'templates' => $templates,
            'countySelector' => [
                'label' => 'Select County',
                'cloneButton' => ['label' => 'Clone', 'icon' => 'Copy']
            ],
            'redemptionRules' => ['title' => 'Redemption Rules'],
            'barmentRules' => ['title' => 'Barment Rules'],
            'localFees' => ['title' => 'Local Fees & Taxes'],
            'statutoryTemplates' => ['title' => 'Statutory Templates']
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
