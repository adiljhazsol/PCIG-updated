<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Models\InvestorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        if (!$user->role_type) {
             return response()->json([
                'success' => false,
                'message' => 'User role not assigned.',
            ], 403);
        }

        // Sync Spatie Role with role_type
        if ($user->role_type === 'investor' && !$user->hasRole('investor')) {
            if (Role::where('name', 'investor')->exists()) {
                $user->assignRole('investor');
            }
        }
        if ($user->role_type === 'admin' && !$user->hasRole('admin')) {
             if (Role::where('name', 'admin')->exists()) {
                $user->assignRole('admin');
            }
        }

        // Delete old tokens? Optional. Let's keep multiple sessions allowed for now.
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->update(['last_login_at' => now()]);

        $user->load('latestKycVerification');
        $user->kyc_status = $user->latestKycVerification ? $user->latestKycVerification->status : 'not_started';
        unset($user->latestKycVerification);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function adminLogin(LoginRequest $request): JsonResponse
    {
        Log::info('Admin login attempt', ['email' => $request->email]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            Log::warning('Admin login failed: User not found', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            Log::warning('Admin login failed: Invalid password', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        // Check if user is admin
        $isAdmin = $user->hasRole('admin') || $user->role_type === 'admin';

        if (!$isAdmin) {
            Log::warning('Admin login failed: Not an admin', ['email' => $request->email, 'role_type' => $user->role_type]);
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin privileges required.',
            ], 403);
        }

        $token = $user->createToken('admin_auth_token')->plainTextToken;
        $user->update(['last_login_at' => now()]);

        Log::info('Admin login successful', ['email' => $request->email, 'id' => $user->id]);

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful.',
            'data' => [
                'user' => $user->fresh(),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_type' => 'investor',
        ]);

        // Assign Role
        if (Role::where('name', 'investor')->exists()) {
            $user->assignRole('investor');
        }

        // Create Investor Profile
        InvestorProfile::create([
            'user_id' => $user->id,
            'phone' => $request->phone,
            'address' => $request->address,
            'ssn_encrypted' => $request->ssn, // Logic for encryption should ideally be in Model mutator or Service, assuming plain text for now or handled by Model casts if defined
            'bank_account_encrypted' => $request->bank_account,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['success' => true, 'message' => __($status)])
            : response()->json(['success' => false, 'message' => __($status)], 400);
    }

    /**
     * Handle an incoming new password request.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['success' => true, 'message' => __($status)])
            : response()->json(['success' => false, 'message' => __($status)], 400);
    }
}
