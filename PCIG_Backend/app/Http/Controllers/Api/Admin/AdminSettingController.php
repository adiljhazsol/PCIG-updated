<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Location;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminSettingController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
                'roles' => $request->user()->getRoleNames(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ]
        ]);
    }

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
                'status' => ['label' => 'Active', 'color' => '#15803D', 'bg' => '#F0FDF4']
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
        $interestMethod = Setting::where('key', 'interest_calculation_method')->value('value') ?? 'Simple Interest';
        
        $interestModels = [
            'header' => ['title' => 'Interest Rates & Models', 'subtitle' => 'Set default interest calculation logic and global rates.'],
            'methodLabel' => 'Default Interest Calculation Method',
            'methods' => ['Simple Interest', 'Compound Interest', 'Tiered Interest'],
            'selectedMethod' => $interestMethod,
            'globalRate' => ['label' => 'Global Default Rate', 'value' => $globalRate, 'suffix' => '%'],
            'accrualBasis' => ['label' => 'Accrual Basis', 'value' => 'Actual/365'],
            'saveButton' => 'Save Settings'
        ];

        // 4. Workflow Config
        $workflowStages = Setting::where('key', 'workflow_stages')->value('value');
        $workflowStages = $workflowStages ? json_decode($workflowStages, true) : ['1. FIFA Received', '2. In Processing', '3. Sheriff Export Ready', '4. Notice Letter Required'];

        $workflowConfig = [
            'header' => ['title' => 'Workflow Configuration', 'subtitle' => 'Customize workflow stages and automation rules.'],
            'fifaStages' => [
                'title' => 'FIFA Workflow Stages',
                'stages' => $workflowStages,
                'addStageButton' => 'Add Stage',
                'startButton' => 'Save Workflow',
                'autoTriggerLabel' => 'Auto-Trigger'
            ]
        ];

        // 5. Templates Library
        $templates = Template::latest()->take(10)->get();
        $templateRows = $templates->map(function ($tpl) {
            return [
                'id' => $tpl->id,
                'name' => $tpl->name,
                'type' => $tpl->type,
                'county' => 'Fulton', // Example, replace with real data if available
                'updated' => $tpl->updated_at ? $tpl->updated_at->diffForHumans() : ''
            ];
        });

        // 6. API Integrations
        $letterstreamKey = Setting::where('key', 'letterstream_api_key')->value('value') ?? '';
        $letterstreamEnv = Setting::where('key', 'letterstream_env')->value('value') ?? 'Production';
        $letterstreamEnabled = Setting::where('key', 'letterstream_enabled')->value('value') === '1';

        $apiIntegrations = [
            'header' => ['title' => 'API Integrations', 'subtitle' => 'Manage external service connections.'],
            'providers' => [
                [
                    'id' => 'letterstream',
                    'name' => 'LetterStream',
                    'description' => 'Automated mail delivery service for notices.',
                    'statusLabel' => $letterstreamEnabled ? 'Connected' : 'Disconnected',
                    'statusBg' => $letterstreamEnabled ? '#F0FDF4' : '#FEF2F2',
                    'statusColor' => $letterstreamEnabled ? '#15803D' : '#DC2626',
                    'apiKeyLabel' => 'API Key',
                    'apiKeyValue' => $letterstreamKey,
                    'environmentLabel' => 'Environment',
                    'environmentValue' => $letterstreamEnv,
                    'enableLabel' => 'Enable Automatic Mailing',
                    'enabled' => $letterstreamEnabled,
                    'testButton' => 'Test Connection',
                    'saveButton' => 'Save Changes'
                ],
                [
                    'id' => 'stripe',
                    'name' => 'Stripe',
                    'description' => 'Payment processing for payoff requests.',
                    'statusLabel' => 'Connected',
                    'statusBg' => '#F0FDF4',
                    'statusColor' => '#15803D',
                    'configureButton' => 'Configure Stripe',
                    'publishableKey' => Setting::where('key', 'stripe_publishable_key')->value('value') ?? '',
                    'secretKey' => Setting::where('key', 'stripe_secret_key')->value('value') ?? '',
                    'webhookSecret' => Setting::where('key', 'stripe_webhook_secret')->value('value') ?? ''
                ]
            ]
        ];

        // 7. Share & Allocations
        $investorShare = Setting::where('key', 'investor_share')->value('value') ?? '60';
        $companyShare = Setting::where('key', 'company_share')->value('value') ?? '40';

        $shareAllocations = [
            'header' => ['title' => 'Share & Allocations', 'subtitle' => 'Configure profit sharing and fund allocations.'],
            'fields' => [
                'investorShare' => ['label' => 'Investor Share', 'value' => $investorShare, 'suffix' => '%', 'key' => 'investor_share'],
                'companyShare' => ['label' => 'Company Share', 'value' => $companyShare, 'suffix' => '%', 'key' => 'company_share']
            ],
            'saveButton' => 'Save Changes'
        ];

        // 8. Depreciation Settings
        $depreciationMethod = Setting::where('key', 'depreciation_method')->value('value') ?? 'Straight Line';
        $usefulLife = Setting::where('key', 'depreciation_useful_life')->value('value') ?? '27.5';

        $depreciationSettings = [
            'header' => ['title' => 'Depreciation Settings', 'subtitle' => 'Configure asset depreciation.'],
            'fields' => [
                'method' => ['label' => 'Depreciation Method', 'value' => $depreciationMethod, 'key' => 'depreciation_method'],
                'usefulLife' => ['label' => 'Useful Life', 'value' => $usefulLife, 'suffix' => 'Years', 'key' => 'depreciation_useful_life']
            ],
            'saveButton' => 'Save Settings'
        ];

        // 9. System Settings
        $platformName = Setting::where('key', 'platform_name')->value('value') ?? 'PCIG Admin';
        $supportEmail = Setting::where('key', 'support_email')->value('value') ?? 'support@pcig.com';
        $timeZone = Setting::where('key', 'time_zone')->value('value') ?? 'America/New_York';
        $currency = Setting::where('key', 'currency')->value('value') ?? 'USD';
        $sessionTimeout = Setting::where('key', 'session_timeout')->value('value') ?? '30 Minutes';
        $twoFactorSelected = Setting::where('key', 'two_factor_methods')->value('value');
        $twoFactorSelected = $twoFactorSelected ? json_decode($twoFactorSelected, true) : ['Email (Default)'];

        $systemSettings = [
            'header' => ['title' => 'System Settings', 'subtitle' => 'General system configuration.'],
            'fields' => [
                'platformName' => ['label' => 'Platform Name', 'value' => $platformName, 'key' => 'platform_name'],
                'supportEmail' => ['label' => 'Support Email', 'value' => $supportEmail, 'key' => 'support_email'],
                'timeZone' => ['label' => 'Time Zone', 'value' => $timeZone, 'key' => 'time_zone'],
                'currency' => ['label' => 'Currency', 'value' => $currency, 'key' => 'currency'],
                'sessionTimeout' => ['label' => 'Session Timeout', 'value' => $sessionTimeout, 'key' => 'session_timeout']
            ],
            'twoFactor' => [
                'label' => 'Two-Factor Authentication',
                'options' => ['Email (Default)', 'SMS', 'Authenticator App'],
                'selected' => $twoFactorSelected,
                'key' => 'two_factor_methods'
            ],
            'saveButton' => 'Save System Settings'
        ];

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
                        'createButton' => 'Create Template',
                        'tabs' => ['All Templates', 'Email', 'Document', 'Export'],
                        'tableHeaders' => ['Template Name', 'Type', 'County', 'Last Updated', 'Actions'],
                        'rows' => $templateRows
                    ],
                    'apiIntegrations' => $apiIntegrations,
                    'shareAllocations' => $shareAllocations,
                    'depreciationSettings' => $depreciationSettings,
                    'systemSettings' => $systemSettings
                ]
            ]
        ]);
    }

    public function index(): JsonResponse
    {
        $settings = Setting::all();
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
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($request->settings as $item) {
            $value = $item['value'];
            // Determine type if needed, or default to string
            $type = 'string';
            
            // Basic type inference
            if (is_numeric($value)) {
                // $type = 'integer'; // Keep as string for flexibility unless strictly needed
            } elseif (is_array($value)) {
                $value = json_encode($value);
                $type = 'json';
            } elseif (is_bool($value) || $value === 'true' || $value === 'false') {
                $value = ($value === true || $value === 'true') ? '1' : '0';
                $type = 'boolean';
            }

            Setting::updateOrCreate(
                ['key' => $item['key']],
                ['value' => (string)$value, 'type' => $type]
            );
        }

        return response()->json(['success' => true, 'message' => 'Settings updated successfully']);
    }

    public function storeLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'county' => 'required|string',
            'state' => 'required|string',
            'rules' => 'nullable|array',
        ]);

        $fees = [];
        $rules = [];

        if ($request->has('rules')) {
            $r = $request->rules;
            if (isset($r['redemption']['statutoryInterestRate'])) {
                $fees['redemption_rate'] = $r['redemption']['statutoryInterestRate'] . '%';
            }
            if (isset($r['barment']['barmentPeriod'])) {
                $rules['barment_period'] = $r['barment']['barmentPeriod'] . ' days';
            }
            if (isset($r['barment']['noticeRequired'])) {
                $rules['barment_notice'] = $r['barment']['noticeRequired'];
            }
            if (isset($r['quiet_title']['waitingPeriod'])) {
                $rules['quiet_title_deadline'] = $r['quiet_title']['waitingPeriod'];
            }
            if (isset($r['legal']['defaultAttorney'])) {
                $rules['default_attorney'] = $r['legal']['defaultAttorney'];
            }
        }

        $location = Location::create([
            'county' => $validated['county'],
            'state' => $validated['state'],
            'fees' => $fees,
            'rules' => $rules
        ]);

        return response()->json(['success' => true, 'message' => 'Location added successfully', 'data' => $location]);
    }

    public function updateLocation(Request $request, $id): JsonResponse
    {
        $location = Location::findOrFail($id);
        
        $data = $request->all();
        
        $fees = $location->fees ?? [];
        $rules = $location->rules ?? [];

        if ($request->has('rules')) {
            $r = $request->rules;
            if (isset($r['redemption']['statutoryInterestRate'])) {
                $fees['redemption_rate'] = $r['redemption']['statutoryInterestRate'] . '%';
            }
            if (isset($r['barment']['barmentPeriod'])) {
                $rules['barment_period'] = $r['barment']['barmentPeriod'] . ' days';
            }
            if (isset($r['barment']['noticeRequired'])) {
                $rules['barment_notice'] = $r['barment']['noticeRequired'];
            }
            if (isset($r['quiet_title']['waitingPeriod'])) {
                $rules['quiet_title_deadline'] = $r['quiet_title']['waitingPeriod'];
            }
            if (isset($r['legal']['defaultAttorney'])) {
                $rules['default_attorney'] = $r['legal']['defaultAttorney'];
            }
        } elseif (isset($data['redemptionInterestRate'])) {
            // Fallback for flat structure
            $fees['redemption_rate'] = $data['redemptionInterestRate'] . '%';
            if (isset($data['barmentPeriod'])) $rules['barment_period'] = $data['barmentPeriod'] . ' days';
            if (isset($data['barmentNotice'])) $rules['barment_notice'] = $data['barmentNotice'];
            if (isset($data['quietTitleDeadline'])) $rules['quiet_title_deadline'] = $data['quietTitleDeadline'];
            if (isset($data['defaultAttorney'])) $rules['default_attorney'] = $data['defaultAttorney'];
        }

        if (isset($data['county'])) $location->county = $data['county'];
        if (isset($data['state'])) $location->state = $data['state'];

        $location->fees = $fees;
        $location->rules = $rules;
        $location->save();

        return response()->json(['success' => true, 'message' => 'Location updated successfully']);
    }

    public function updateInterest(Request $request): JsonResponse
    {
        $request->validate([
            'globalRate' => 'required',
            'method' => 'required'
        ]);

        Setting::updateOrCreate(
            ['key' => 'interest_rate_global'],
            ['value' => $request->globalRate, 'type' => 'string']
        );

        Setting::updateOrCreate(
            ['key' => 'interest_calculation_method'],
            ['value' => $request->method, 'type' => 'string']
        );

        return response()->json(['success' => true, 'message' => 'Interest settings updated']);
    }

    public function updateWorkflow(Request $request): JsonResponse
    {
        $request->validate([
            'stages' => 'required|array'
        ]);

        Setting::updateOrCreate(
            ['key' => 'workflow_stages'],
            ['value' => json_encode($request->stages), 'type' => 'json']
        );

        return response()->json(['success' => true, 'message' => 'Workflow settings updated']);
    }

    public function destroyLocation($id): JsonResponse
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return response()->json(['success' => true, 'message' => 'Location deleted successfully']);
    }
}
