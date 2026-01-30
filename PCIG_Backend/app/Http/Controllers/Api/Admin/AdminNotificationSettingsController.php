<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationSettingsController extends Controller
{
    /**
     * Get notification settings for current user
     */
    public function index(Request $request): JsonResponse
    {
        $settings = NotificationPreference::where('user_id', $request->user()->id)->get();

        // If no settings exist, return defaults (or empty list which frontend can handle)
        // Alternatively, we could seed defaults here if needed.
        
        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update notification settings (bulk update or single)
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'preferences' => 'required|array',
            'preferences.*.channel' => 'required|string|in:email,sms,in_app',
            'preferences.*.type' => 'required|string',
            'preferences.*.enabled' => 'required|boolean',
        ]);

        $userId = $request->user()->id;
        $updated = [];

        foreach ($request->preferences as $pref) {
            $setting = NotificationPreference::updateOrCreate(
                [
                    'user_id' => $userId,
                    'channel' => $pref['channel'],
                    'type' => $pref['type'],
                ],
                [
                    'enabled' => $pref['enabled']
                ]
            );
            $updated[] = $setting;
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification preferences updated successfully',
            'data' => $updated,
        ]);
    }
}
