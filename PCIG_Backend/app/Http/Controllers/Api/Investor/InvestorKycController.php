<?php

namespace App\Http\Controllers\Api\Investor;

use App\Http\Controllers\Controller;
use App\Models\KycVerification;
use App\Models\KycDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class InvestorKycController extends Controller
{
    /**
     * Get current KYC status
     */
    public function status(Request $request): JsonResponse
    {
        $verification = KycVerification::where('user_id', $request->user()->id)
            ->with('documents')
            ->first();

        $profile = $request->user()->investorProfile;

        if (!$verification) {
            return response()->json([
                'success' => true,
                'data' => [
                    'status' => 'not_started',
                    'documents' => [],
                    'profile' => $profile
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'verification' => $verification,
                'profile' => $profile
            ]
        ]);
    }

    /**
     * Upload a KYC document
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,pdf|max:10240', // 10MB max
            'type' => 'required|string|in:passport,driver_license,utility_bill,other',
        ]);

        try {
            DB::beginTransaction();

            $user = $request->user();
            
            // Find or create verification record
            $verification = KycVerification::firstOrCreate(
                ['user_id' => $user->id],
                ['status' => 'pending', 'submitted_at' => now()]
            );

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('kyc-documents/' . $user->id, $filename, 'public');

            $document = KycDocument::create([
                'verification_id' => $verification->id,
                'type' => $request->type,
                'file_path' => $path,
                'status' => 'pending'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit KYC profile data
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'dob' => 'nullable|date',
            'citizenship' => 'nullable|string',
            'address_street' => 'nullable|string',
            'address_city' => 'nullable|string',
            'address_state' => 'nullable|string',
            'address_zip' => 'nullable|string',
            'address_country' => 'nullable|string',
            'employment_status' => 'nullable|string',
            'annual_income' => 'nullable|string',
            'source_of_funds' => 'nullable|string',
            'ssn' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'routing_number' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $user = $request->user();
            
            // Update Investor Profile
            $profileData = $request->only([
                'dob', 'citizenship', 
                'address_street', 'address_city', 'address_state', 'address_zip', 'address_country',
                'employment_status', 'annual_income', 'source_of_funds', 'routing_number'
            ]);

            if ($request->has('ssn')) {
                $profileData['ssn_encrypted'] = $request->ssn; // In real app, encrypt this!
            }
            if ($request->has('bank_account_number')) {
                $profileData['bank_account_encrypted'] = $request->bank_account_number; // In real app, encrypt this!
            }

            // Construct full address for backward compatibility
            $fullAddress = implode(', ', array_filter([
                $request->address_street,
                $request->address_city,
                $request->address_state,
                $request->address_zip,
                $request->address_country
            ]));
            if (!empty($fullAddress)) {
                $profileData['address'] = $fullAddress;
            }

            $user->investorProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            // Find or create verification record
            $verification = KycVerification::firstOrCreate(
                ['user_id' => $user->id],
                ['status' => 'pending', 'submitted_at' => now()]
            );

            // Update status to pending if it was not verified
            if ($verification->status !== 'verified') {
                $verification->update([
                    'status' => 'pending',
                    'submitted_at' => now(),
                    'rejection_reason' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'KYC profile submitted successfully.',
                'data' => [
                    'verification' => $verification->load('documents'),
                    'profile' => $user->investorProfile
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit KYC data: ' . $e->getMessage()
            ], 500);
        }
    }
}
