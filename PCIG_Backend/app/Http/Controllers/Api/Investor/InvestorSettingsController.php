<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Investor\UpdateProfileRequest;
use App\Http\Requests\Api\Investor\ChangePasswordRequest;
use App\Models\User;
use App\Models\BankAccount;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class InvestorSettingsController extends Controller
{
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user()->load('investorProfile');
        
        $profile = $user->investorProfile;
        if ($profile) {
            $profile->photo_url = $profile->photo_path ? asset('storage/' . $profile->photo_path) : null;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at,
                    'role_type' => $user->role_type,
                ],
                'profile' => $profile,
            ],
        ]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // 5MB
        ]);

        $user = $request->user();
        $file = $request->file('photo');
        $path = $file->store('profile-photos', 'public');

        $profile = $user->investorProfile()->firstOrCreate(['user_id' => $user->id]);
        
        // Delete old photo if exists
        if ($profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
            Storage::disk('public')->delete($profile->photo_path);
        }

        $profile->update(['photo_path' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Profile photo updated successfully',
            'data' => [
                'photo_url' => asset('storage/' . $path),
            ]
        ]);
    }

    public function deletePhoto(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->investorProfile;

        if ($profile && $profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
            Storage::disk('public')->delete($profile->photo_path);
            $profile->update(['photo_path' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile photo removed successfully',
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        $profile = $user->investorProfile;
        if ($profile) {
            $profile->update($request->only(['phone', 'address']));
        } else {
            $user->investorProfile()->create($request->only(['phone', 'address']));
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => $user->fresh(),
                'profile' => $user->investorProfile,
            ],
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke all tokens except current
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check for active investments or other critical data
        if ($user->investments()->where('status', 'active')->exists() || 
            $user->fundInvestments()->where('status', 'active')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete account with active investments. Please contact support.',
            ], 400);
        }

        // Delete profile photo if exists
        $profile = $user->investorProfile;
        if ($profile && $profile->photo_path && Storage::disk('public')->exists($profile->photo_path)) {
            Storage::disk('public')->delete($profile->photo_path);
        }

        try {
            $user->delete();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account due to existing records. Please contact support.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }

    public function getNotifications(Request $request): JsonResponse
    {
        $settings = NotificationPreference::where('user_id', $request->user()->id)->get();
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function updateNotifications(Request $request): JsonResponse
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

    public function getBankAccounts(Request $request): JsonResponse
    {
        $accounts = BankAccount::where('user_id', $request->user()->id)->get();
        // Mask routing number for security if needed, but for edit we might need it or just last 4?
        // Usually routing numbers aren't super secret like account numbers, but let's just return it.
        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    }

    public function addBankAccount(Request $request): JsonResponse
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_type' => 'required|string|in:checking,savings',
            'account_number' => 'required|string|min:4',
            'routing_number' => 'nullable|string',
        ]);

        $account = BankAccount::create([
            'user_id' => $request->user()->id,
            'bank_name' => $request->bank_name,
            'account_type' => $request->account_type,
            'account_number_last_4' => substr($request->account_number, -4),
            'routing_number' => $request->routing_number,
            'status' => 'pending', // Default to pending until verified
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bank account added successfully',
            'data' => $account
        ]);
    }

    public function deleteBankAccount(Request $request, $id): JsonResponse
    {
        $account = BankAccount::where('user_id', $request->user()->id)->where('id', $id)->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Bank account not found',
            ], 404);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank account removed successfully',
        ]);
    }

    public function verifyBankAccount(Request $request, $id): JsonResponse
    {
        $account = BankAccount::where('user_id', $request->user()->id)->where('id', $id)->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Bank account not found',
            ], 404);
        }

        // In a real app, this would involve micro-deposits or Plaid integration.
        // For now, we'll just toggle it to verified.
        $account->update(['status' => 'verified']);

        return response()->json([
            'success' => true,
            'message' => 'Bank account verified successfully',
            'data' => $account
        ]);
    }

    public function updateBankAccount(Request $request, $id): JsonResponse
    {
        $account = BankAccount::where('user_id', $request->user()->id)->where('id', $id)->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'Bank account not found',
            ], 404);
        }

        $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_type' => 'required|string|in:checking,savings',
            'account_number' => 'required|string|min:4',
            'routing_number' => 'nullable|string',
        ]);

        $account->update([
            'bank_name' => $request->bank_name,
            'account_type' => $request->account_type,
            'account_number_last_4' => substr($request->account_number, -4),
            'routing_number' => $request->routing_number,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bank account updated successfully',
            'data' => $account
        ]);
    }

    public function getPrivacy(Request $request): JsonResponse
    {
        $profile = $request->user()->investorProfile;
        
        $defaultSettings = [
            'profileVisibility' => 'private',
            'showNetWorth' => false,
            'shareDataWithThirdParties' => false,
            'marketingEmails' => true,
        ];

        return response()->json([
            'success' => true,
            'data' => $profile && $profile->privacy_settings ? $profile->privacy_settings : $defaultSettings
        ]);
    }

    public function updatePrivacy(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->investorProfile()->firstOrCreate(['user_id' => $user->id]);

        $request->validate([
            'profileVisibility' => 'required|string|in:public,private,contacts',
            'showNetWorth' => 'required|boolean',
            'shareDataWithThirdParties' => 'required|boolean',
            'marketingEmails' => 'required|boolean',
        ]);

        $settings = $request->only(['profileVisibility', 'showNetWorth', 'shareDataWithThirdParties', 'marketingEmails']);
        
        $profile->update(['privacy_settings' => $settings]);

        return response()->json([
            'success' => true,
            'message' => 'Privacy settings updated successfully',
            'data' => $settings
        ]);
    }
}
