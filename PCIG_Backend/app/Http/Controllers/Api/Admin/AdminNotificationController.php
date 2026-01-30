<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EscalationRule;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;
use App\Notifications\SystemNotification; // We'll need to create this if it doesn't exist, but we saw it in file list

class AdminNotificationController extends Controller
{
    /**
     * Get dashboard data for Notifications & Escalation System
     */
    public function dashboardData(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Header
        $header = [
            'title' => 'Notifications & Escalation',
            'subtitle' => 'Manage system alerts, workflow escalations, and communication preferences.'
        ];

        // 2. Action Buttons
        $actionButtons = [
            'markAllRead' => ['label' => 'Mark All Read', 'icon' => 'Check'],
            'settings' => ['label' => 'Settings', 'icon' => 'Settings']
        ];

        // 3. Summary Stats (Real Data)
        $unreadCount = $user->unreadNotifications()->count();
        
        // Count critical alerts (assuming 'type' or 'level' is in data)
        // We iterate or query directly if possible. Since data is JSON, strict querying depends on DB driver.
        // For broad compatibility, we might fetch recent unread and filter in PHP or use whereJsonContains if supported.
        $criticalCount = $user->unreadNotifications()
            ->where('data->type', 'critical')
            ->count();

        // Active Escalation Rules
        $activeEscalationsCount = EscalationRule::where('is_active', true)->count();

        $summaryCards = [
            [
                'label' => 'Critical Alerts',
                'value' => (string)$criticalCount,
                'trend' => 'Requires action',
                'icon' => 'AlertCircle',
                'color' => '#EF4444'
            ],
            [
                'label' => 'Unread Notifications',
                'value' => (string)$unreadCount,
                'trend' => 'Total unread',
                'icon' => 'Bell',
                'color' => '#3B82F6'
            ],
            [
                'label' => 'Active Escalation Rules',
                'value' => (string)$activeEscalationsCount,
                'trend' => 'configured rules',
                'icon' => 'AlertTriangle',
                'color' => '#F59E0B'
            ],
            [
                'label' => 'System Health',
                'value' => '98%', // Placeholder
                'trend' => 'All systems operational',
                'icon' => 'CheckCircle2',
                'color' => '#10B981'
            ]
        ];

        // 4. Tabs
        $tabs = [
            ['id' => 'notification-center', 'label' => 'Notification Center', 'active' => true],
            ['id' => 'escalation-matrix', 'label' => 'Escalation Matrix', 'active' => false],
            ['id' => 'logs', 'label' => 'System Logs', 'active' => false]
        ];

        // 5. Notification Center (Recent)
        $recentNotifications = $user->notifications()->limit(10)->get()->map(function ($n) {
            $data = $n->data;
            return [
                'id' => $n->id,
                'type' => $data['type'] ?? 'info',
                'icon' => $this->getIconForType($data['type'] ?? 'info'),
                'iconColor' => $this->getColorForType($data['type'] ?? 'info'),
                'iconBg' => $this->getBgForType($data['type'] ?? 'info'),
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'time' => $n->created_at->diffForHumans(),
                'isUnread' => is_null($n->read_at),
                'actions' => $data['actions'] ?? []
            ];
        });

        $notificationCenter = [
            'filter' => [
                'label' => 'All Notifications',
                'options' => ['All Notifications', 'Unread', 'High Priority']
            ],
            'notifications' => $recentNotifications,
            'loadMoreLabel' => 'Load More'
        ];
        
        // 6. Right Sidebar (Preferences)
        // Fetch real preferences
        $prefs = NotificationPreference::where('user_id', $user->id)->get();
        // Fallback default structure if no prefs
        $prefItems = [
            [
                'id' => 'email_deadline',
                'label' => 'Email Notifications',
                'subtext' => 'Get daily summaries',
                'enabled' => $prefs->where('channel', 'email')->where('type', 'deadline')->first()->enabled ?? true
            ],
            [
                'id' => 'push_urgent',
                'label' => 'Push Notifications',
                'subtext' => 'Real-time alerts',
                'enabled' => $prefs->where('channel', 'push')->where('type', 'urgent')->first()->enabled ?? true
            ],
            [
                'id' => 'sms_critical',
                'label' => 'SMS Alerts',
                'subtext' => 'Critical escalations only',
                'enabled' => $prefs->where('channel', 'sms')->where('type', 'critical')->first()->enabled ?? false
            ]
        ];

        $rightSidebar = [
            'preferences' => [
                'title' => 'Quick Preferences',
                'items' => $prefItems,
                'manageLabel' => 'Manage all preferences'
            ]
        ];

        return response()->json([
            'header' => $header,
            'actionButtons' => $actionButtons,
            'summaryCards' => $summaryCards,
            'tabs' => $tabs,
            'notificationCenter' => $notificationCenter,
            'rightSidebar' => $rightSidebar
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);
        return response()->json($notifications);
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning,critical'
        ]);

        $user = User::find($request->user_id);
        
        // Using database notification directly for simplicity if SystemNotification class is complex
        $user->notify(new \App\Notifications\SystemNotification(
            $request->title,
            $request->message,
            $request->type
        ));

        return response()->json(['success' => true, 'message' => 'Notification sent']);
    }

    public function escalations(Request $request): JsonResponse
    {
        $rules = EscalationRule::with('escalateToUser')->paginate(20);
        return response()->json($rules);
    }

    public function updateRule(Request $request, $id = null): JsonResponse
    {
        $request->validate([
            'trigger_type' => 'required|string',
            'delay_hours' => 'required|integer',
            'escalate_to_user_id' => 'required|exists:users,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $rule = $id ? EscalationRule::findOrFail($id) : new EscalationRule();
        
        $rule->fill($request->all());
        $rule->save();

        return response()->json([
            'success' => true,
            'data' => $rule->load('escalateToUser')
        ]);
    }

    private function getIconForType($type) {
        $map = [
            'critical' => 'AlertCircle',
            'warning' => 'AlertTriangle',
            'success' => 'CheckCircle2',
            'info' => 'Bell'
        ];
        return $map[$type] ?? 'Bell';
    }

    private function getColorForType($type) {
        $map = [
            'critical' => '#EF4444',
            'warning' => '#F59E0B',
            'success' => '#10B981',
            'info' => '#3B82F6'
        ];
        return $map[$type] ?? '#64748B';
    }

    private function getBgForType($type) {
        $map = [
            'critical' => '#FEF2F2',
            'warning' => '#FFFBEB',
            'success' => '#ECFDF5',
            'info' => '#EFF6FF'
        ];
        return $map[$type] ?? '#F1F5F9';
    }
}
