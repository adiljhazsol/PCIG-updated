<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Investor\UpdateProfileRequest;
use App\Http\Requests\Api\Investor\ChangePasswordRequest;
use App\Models\User;
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
}
