<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestorInvitation;
use App\Models\User;
use App\Models\Investment;
use App\Models\FundInvestment;
use App\Models\KycVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Mail\InvitationEmail;
use App\Notifications\SystemNotification;
use Carbon\Carbon;

class AdminInvestorController extends Controller
{
    /**
     * Get dashboard data for Investors Management
     */
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Header
        $header = [
            'title' => 'Investors Management',
            'subtitle' => 'Manage investor profiles, verify KYC documents, and track funding status.'
        ];

        // 2. Action Buttons
        $actionButtons = [
            'export' => ['label' => 'Export CSV', 'icon' => 'Download'],
            'invite' => ['label' => 'Invite Investor', 'icon' => 'Plus']
        ];

        // 3. Summary Cards
        $totalInvestors = User::where('role_type', 'investor')->count();
        // Active investments count (sum of property and fund investments count)
        $activeInvestments = Investment::where('status', 'active')->count() + FundInvestment::where('status', 'active')->count();
        $pendingKyc = KycVerification::where('status', 'pending')->count();
        
        // Total Capital Raised (sum of all investments)
        $totalCapital = Investment::sum('amount') + FundInvestment::sum('amount');
        
        $summaryCards = [
            ['label' => 'Total Investors', 'value' => (string)$totalInvestors, 'subtext' => '+12% from last month', 'subtextColor' => '#16A34A'],
            ['label' => 'Active Investments', 'value' => (string)$activeInvestments, 'subtext' => 'Across 45 properties'],
            ['label' => 'Pending KYC', 'value' => (string)$pendingKyc, 'subtext' => 'Requires attention', 'subtextColor' => '#DC2626'],
            ['label' => 'Total Capital Raised', 'value' => '$' . number_format($totalCapital / 1000000, 1) . 'M', 'subtext' => '+$450k this month', 'subtextColor' => '#16A34A']
        ];

        // 4. Tabs
        $tabs = ['All Investors', 'Pending Approval', 'Active', 'Rejected'];

        // 5. Filters
        $filters = [
            [
                'key' => 'status',
                'label' => 'Status',
                'options' => ['All Investors', 'Pending Approval', 'Active', 'Rejected']
            ],
            [
                'key' => 'kyc',
                'label' => 'KYC Level',
                'options' => ['All Levels', 'Verified', 'Pending', 'Rejected', 'Unverified']
            ],
            [
                'key' => 'accreditation',
                'label' => 'Accreditation',
                'options' => ['All Types', 'Accredited', 'Non-Accredited']
            ]
        ];
        $moreFiltersLabel = 'More Filters';
        $searchPlaceholder = 'Search by name, email or ID...';

        // 6. Table Headers
        $tableHeaders = ['Investor Name', 'Status', 'KYC', 'Funding', 'Method', 'Total Inv.', 'Registration', 'Last Activity', 'Actions'];

        // 7. Table Rows
        $query = User::where('role_type', 'investor')
            ->with(['investorProfile', 'investments', 'fundInvestments', 'latestKycVerification']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filters
        // Status Filter
        if ($request->filled('status') && $request->status !== 'All Investors') {
            if ($request->status === 'Pending Approval') {
                 $query->whereHas('latestKycVerification', function($q) {
                     $q->where('status', 'pending');
                 });
            } elseif ($request->status === 'Active') {
                 $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'Rejected') {
                 $query->whereHas('latestKycVerification', function($q) {
                     $q->where('status', 'rejected');
                 });
            }
        }

        // KYC Filter
        if ($request->filled('kyc') && $request->kyc !== 'All Levels') {
            $status = strtolower($request->kyc);
            if ($status === 'unverified') {
                $query->doesntHave('latestKycVerification');
            } elseif ($status === 'verified') {
                $query->whereHas('latestKycVerification', function($q) {
                    $q->where('status', 'approved');
                });
            } else {
                $query->whereHas('latestKycVerification', function($q) use ($status) {
                    $q->where('status', $status);
                });
            }
        }

        // Accreditation Filter
        if ($request->filled('accreditation') && $request->accreditation !== 'All Types') {
            $isAccredited = $request->accreditation === 'Accredited';
            $query->whereHas('investorProfile', function($q) use ($isAccredited) {
                $q->where('is_accredited', $isAccredited);
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(50);

        $tableRows = collect($users->items())->map(function ($user) {
            // Determine Status
            // Mocking user status for now, or assume active if not deleted
            $status = 'Active'; 
            $statusBg = '#DCFCE7';
            $statusColor = '#166534';
            
            // Determine KYC Status
            $kycStatus = $user->latestKycVerification ? ucfirst($user->latestKycVerification->status) : 'Unverified';
            $kycBg = $kycStatus === 'Approved' ? '#DCFCE7' : ($kycStatus === 'Pending' ? '#FEF3C7' : ($kycStatus === 'Rejected' ? '#FEE2E2' : '#F1F5F9'));
            $kycColor = $kycStatus === 'Approved' ? '#166534' : ($kycStatus === 'Pending' ? '#B45309' : ($kycStatus === 'Rejected' ? '#DC2626' : '#64748B'));

            // Determine Funding Status (Mock logic based on profile existence or bank info)
            // If routing number exists in profile, assume Verified
            $hasBankInfo = $user->investorProfile && $user->investorProfile->routing_number;
            $fundingStatus = $hasBankInfo ? 'Verified' : 'Pending';
            $fundingBg = $hasBankInfo ? '#DCFCE7' : '#F1F5F9';
            $fundingColor = $hasBankInfo ? '#166534' : '#64748B';

            // Total Invested
            $totalInvested = $user->investments->sum('amount') + $user->fundInvestments->sum('amount');
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $status,
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'kyc' => $kycStatus,
                'kycBg' => $kycBg,
                'kycColor' => $kycColor,
                'funding' => $fundingStatus,
                'fundingBg' => $fundingBg,
                'fundingColor' => $fundingColor,
                'method' => 'ACH', // Mock
                'total' => '$' . number_format($totalInvested),
                'registration' => $user->created_at->format('M d, Y'),
                'lastActivity' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
                // Additional data for selection
                'type' => 'Individual', // Mock
                'sidebarTabs' => ['Overview', 'Documents', 'Activity', 'Notes'],
                'fundingRequest' => [
                    'title' => 'Initial Deposit',
                    'amount' => '$50,000.00',
                    'method' => 'Wire Transfer',
                    'bank' => 'Chase Bank (...8832)',
                    'date' => 'Oct 24, 2024'
                ],
                'kycStatus' => [
                    'status' => $kycStatus,
                    'statusBg' => $kycBg,
                    'statusColor' => $kycColor,
                    'submitted' => $user->latestKycVerification ? $user->latestKycVerification->created_at->format('M d, Y') : 'N/A',
                    'approvedBy' => 'Admin User', // Mock
                ],
                'investmentSummary' => [
                    'totalInvested' => '$' . number_format($totalInvested),
                    'currentBalance' => '$' . number_format($totalInvested * 1.1), // Mock growth
                    'properties' => $user->investments->count(),
                    'funds' => $user->fundInvestments->count(),
                ],
                'contactInfo' => [
                    'email' => $user->email,
                    'emailVerified' => !is_null($user->email_verified_at),
                    'phone' => $user->investorProfile?->phone ?? 'N/A',
                    'address' => [
                        'line1' => $user->investorProfile?->address_line1 ?? 'N/A',
                        'line2' => ($user->investorProfile?->city ?? '') . ', ' . ($user->investorProfile?->state ?? '') . ' ' . ($user->investorProfile?->zip_code ?? ''),
                    ],
                ],
                'recentActivity' => [
                    ['date' => 'Oct 24', 'action' => 'Logged in'],
                    ['date' => 'Oct 23', 'action' => 'Viewed 123 Main St'],
                    ['date' => 'Oct 20', 'action' => 'Downloaded Q3 Report'],
                ],
            ];
        });

        // 8. Selected Investor (First one or null)
        $selectedInvestor = $tableRows->first() ?? null;

        return response()->json([
            'success' => true,
            'data' => [
                'header' => $header,
                'actionButtons' => $actionButtons,
                'summaryCards' => $summaryCards,
                'tabs' => $tabs,
                'filters' => $filters,
                'moreFiltersLabel' => $moreFiltersLabel,
                'searchPlaceholder' => $searchPlaceholder,
                'tableHeaders' => $tableHeaders,
                'tableRows' => $tableRows,
                'selectedInvestor' => $selectedInvestor,
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ]
            ]
        ]);
    }

    /**
     * List all invitations
     */
    public function index(Request $request): JsonResponse
    {
        $invitations = InvestorInvitation::with('inviter')->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    /**
     * Send an invitation
     */
    public function invite(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:investor_invitations,email|unique:users,email',
            'firstName' => 'nullable|string',
            'lastName' => 'nullable|string',
            'phone' => 'nullable|string',
            'type' => 'nullable|string',
            'role' => 'nullable|string',
            'assignedFund' => 'nullable|string',
            'isAccredited' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $token = Str::random(32);

        $metadata = [
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'phone' => $request->phone,
            'type' => $request->type,
            'role' => $request->role,
            'assigned_fund' => $request->assignedFund,
            'is_accredited' => $request->isAccredited,
            'notes' => $request->notes,
        ];

        $invitation = InvestorInvitation::create([
            'email' => $request->email,
            'token' => $token,
            'invited_by' => $request->user()->id,
            'invited_at' => now(),
            'status' => 'pending',
            'metadata' => $metadata,
        ]);

        // Send email
        try {
            Mail::to($request->email)->send(new InvitationEmail($invitation));
        } catch (\Exception $e) {
            // Log error but don't fail the request completely
            Log::error('Failed to send invitation email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully',
            'data' => $invitation,
            'debug_link' => url("/register?token={$token}") // Keep for dev convenience
        ]);
    }

    /**
     * Export investors to CSV
     */
    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function () use ($request) {
            $handle = fopen('php://output', 'w');
            
            // Header
            fputcsv($handle, ['ID', 'Name', 'Email', 'Type', 'KYC Status', 'Accreditation', 'Total Invested', 'Registered Date']);

            // Build query with same filters as dashboard
            $query = User::where('role_type', 'investor')
                ->with(['investorProfile', 'investments', 'fundInvestments', 'latestKycVerification']);

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Status Filter
            if ($request->filled('status') && $request->status !== 'All Investors') {
                if ($request->status === 'Pending Approval') {
                     $query->whereHas('latestKycVerification', function($q) {
                        $q->where('status', 'pending');
                     });
                } elseif ($request->status === 'Active') {
                     $query->whereHas('latestKycVerification', function($q) {
                        $q->where('status', 'approved');
                     });
                } elseif ($request->status === 'Rejected') {
                     $query->whereHas('latestKycVerification', function($q) {
                        $q->where('status', 'rejected');
                     });
                }
            }

            // KYC Filter
            if ($request->filled('kyc') && $request->kyc !== 'All Levels') {
                $status = strtolower($request->kyc);
                if ($status === 'unverified') {
                    $query->doesntHave('latestKycVerification');
                } elseif ($status === 'verified') {
                    $query->whereHas('latestKycVerification', function($q) {
                        $q->where('status', 'approved');
                    });
                } else {
                    $query->whereHas('latestKycVerification', function($q) use ($status) {
                        $q->where('status', $status);
                    });
                }
            }

            // Accreditation Filter
            if ($request->filled('accreditation') && $request->accreditation !== 'All Types') {
                $isAccredited = $request->accreditation === 'Accredited';
                $query->whereHas('investorProfile', function($q) use ($isAccredited) {
                    $q->where('is_accredited', $isAccredited);
                });
            }

            // Data
            $query->chunk(100, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        $totalInvested = $user->investments->sum('amount') + $user->fundInvestments->sum('amount');
                        $kycStatus = $user->latestKycVerification ? ucfirst($user->latestKycVerification->status) : 'Pending';
                        $accreditation = $user->investorProfile && $user->investorProfile->is_accredited ? 'Accredited' : 'Non-Accredited';
                        
                        fputcsv($handle, [
                            $user->id,
                            $user->name,
                            $user->email,
                            'Individual', // Mock type
                            $kycStatus,
                            $accreditation,
                            $totalInvested,
                            $user->created_at->format('Y-m-d H:i:s'),
                        ]);
                    }
                });

            fclose($handle);
        }, 'investors_' . date('Y-m-d') . '.csv');
    }

    /**
     * List all investors
     */
    public function list(Request $request): JsonResponse
    {
        $query = User::where('role_type', 'investor')
            ->with(['investorProfile', 'investments', 'fundInvestments', 'latestKycVerification']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Show investor details
     */
    public function show($id): JsonResponse
    {
        $user = User::where('role_type', 'investor')
            ->with(['investorProfile', 'investments', 'fundInvestments', 'latestKycVerification'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Approve Investor KYC
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $verification = $user->latestKycVerification;

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'No KYC verification found for this user.'
            ], 404);
        }

        $verification->update([
            'status' => 'approved',
            'verified_at' => now(),
            'rejection_reason' => null
        ]);

        // Update user status if needed (e.g. email verified or specific flag)
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
        }

        // TODO: Send approval email notification

        return response()->json([
            'success' => true,
            'message' => 'Investor KYC approved successfully',
            'data' => $verification
        ]);
    }

    /**
     * Reject Investor KYC
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        $user = User::findOrFail($id);
        $verification = $user->latestKycVerification;

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'No KYC verification found for this user.'
            ], 404);
        }

        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        // TODO: Send rejection email notification

        return response()->json([
            'success' => true,
            'message' => 'Investor KYC rejected',
            'data' => $verification
        ]);
    }

    /**
     * Resend invitation (update token and time)
     */
    public function resend($id): JsonResponse
    {
        $invitation = InvestorInvitation::findOrFail($id);
        
        if ($invitation->status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Invitation already accepted',
            ], 400);
        }

        $invitation->update([
            'token' => Str::random(32),
            'invited_at' => now(),
            'status' => 'pending',
        ]);

        // Send email
        try {
            Mail::to($invitation->email)->send(new InvitationEmail($invitation));
        } catch (\Exception $e) {
             Log::error('Failed to resend invitation email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Invitation resent successfully',
            'data' => $invitation,
            'debug_link' => url("/register?token={$invitation->token}")
        ]);
    }
}
