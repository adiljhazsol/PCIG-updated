<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Location;
use App\Models\Template;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AdminSettingController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Sidebar
        $sidebar = [
            'sections' => [
                [
                    'title' => 'Configuration',
                    'items' => ['County/State Config', 'Interest Rates & Models', 'Workflow Configuration']
                ],
                [
                    'title' => 'Management',
                    'items' => ['Templates Library', 'API Integrations', 'Share & Allocations']
                ],
                [
                    'title' => 'System',
                    'items' => ['Depreciation Settings', 'System Settings']
                ]
            ],
            'activeItem' => 'County/State Config'
        ];

        // 2. County/State Config (Dynamic)
        $locations = Location::all();
        $locationRows = $locations->map(function ($loc) {
            return [
                'id' => $loc->id,
                'county' => $loc->county,
                'state' => $loc->state,
                'redemptionRate' => is_array($loc->fees) && isset($loc->fees['redemption_rate']) ? $loc->fees['redemption_rate'] : 'N/A',
                'barmentPeriod' => is_array($loc->rules) && isset($loc->rules['barment_period']) ? $loc->rules['barment_period'] : 'N/A',
                'status' => ['label' => 'Active', 'color' => '#15803D', 'bg' => '#F0FDF4'] // Default to active for now
            ];
        });

        $countyState = [
            'header' => [
                'title' => 'County/State Configuration',
                'subtitle' => 'Configure rules, rates, and schedules for specific jurisdictions.'
            ],
            'addButton' => 'Add County',
            'tableHeaders' => ['County Name', 'State', 'Redemption Rate', 'Barment Period', 'Status', 'Actions'],
            'rows' => $locationRows,
            'editPanel' => [
                'title' => 'Edit Configuration',
                'fields' => [
                    'redemptionInterestRate' => ['label' => 'Redemption Interest Rate', 'value' => '20', 'suffix' => '%'],
                    'calculationMethod' => ['label' => 'Calculation Method', 'options' => ['Flat Penalty + Interest']],
                    'barmentPeriod' => ['label' => 'Barment Period (Redemption Period)', 'value' => '365', 'suffix' => 'Days'],
                    'barmentNotice' => ['label' => 'Barment Notice Timing', 'value' => '30', 'suffix' => 'Days Before'],
                    'quietTitleDeadline' => ['label' => 'Quiet Title Filing Deadline', 'value' => '45', 'suffix' => 'Days After'],
                    'defaultAttorney' => ['label' => 'Default Attorney', 'value' => 'Legal Partners LLC']
                ],
                'toggleLabel' => 'Active',
                'actions' => ['cancel' => 'Cancel', 'save' => 'Save Changes']
            ]
        ];

        // 3. Interest Models (Dynamic)
        $globalRate = Setting::where('key', 'interest_rate_global')->value('value') ?? '12.5';
        $interestModels = [
            'header' => ['title' => 'Interest Rates & Models', 'subtitle' => 'Set default interest calculation logic and global rates.'],
            'methodLabel' => 'Default Interest Calculation Method',
            'methods' => ['Simple Interest', 'Compound Interest', 'Tiered Interest'],
            'globalRate' => ['label' => 'Global Default Rate', 'value' => $globalRate, 'suffix' => '%'],
            'accrualBasis' => ['label' => 'Accrual Basis', 'value' => 'Actual/365'],
            'saveButton' => 'Save Settings'
        ];

        // 4. Workflow Config (Static for now as it's complex structure)
        $workflowConfig = [
            'header' => ['title' => 'Workflow Configuration', 'subtitle' => 'Customize workflow stages and automation rules.'],
            'fifaStages' => [
                'title' => 'FIFA Workflow Stages',
                'stages' => ['1. FIFA Received', '2. In Processing', '3. Sheriff Export Ready', '4. Notice Letter Required'],
                'addStageButton' => 'Add Stage',
                'startButton' => 'Start',
                'autoTriggerLabel' => 'Auto-Trigger'
            ]
        ];

        // 5. Templates Library (Dynamic)
        $templates = Template::latest()->take(10)->get();
        $templateRows = $templates->map(function ($tpl) {
            return [
                'id' => $tpl->id,
                'name' => $tpl->name,
                'type' => $tpl->type,
                'lastUpdated' => $tpl->updated_at ? $tpl->updated_at->diffForHumans() : ''
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'settingsAdmin' => [
                    'sidebar' => $sidebar,
                    'countyState' => $countyState,
                    'interestModels' => $interestModels,
                    'workflowConfig' => $workflowConfig,
                    'templatesLibrary' => [
                        'header' => ['title' => 'Templates Library', 'subtitle' => 'Manage email and document templates.'],
                        'uploadButton' => 'Upload New Template',
                        'headers' => ['Template Name', 'Type', 'Last Updated', 'Actions'],
                        'rows' => $templateRows
                    ],
                    'apiIntegrations' => [], // Add empty defaults if needed
                    'systemSettings' => []
                ]
            ]
        ]);
    }

    public function index(): JsonResponse
    {
        $settings = Setting::all();
        // Transform to key-value pairs or list
        $data = $settings->map(function ($setting) {
            return [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->casted_value,
                'type' => $setting->type,
                'description' => $setting->description,
            ];
        });
        
        return response()->json(['data' => $data]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|exists:settings,key',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($request->settings as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            if ($setting) {
                // If value is array/json type, json_encode it if needed, or rely on client sending string?
                // Let's assume client sends string or we cast it if type is json
                $value = $item['value'];
                if ($setting->type === 'json' && is_array($value)) {
                    $value = json_encode($value);
                } elseif ($setting->type === 'boolean') {
                    $value = $value ? '1' : '0';
                }
                
                $setting->update(['value' => (string)$value]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }
}
