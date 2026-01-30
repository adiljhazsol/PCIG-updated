<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\KycVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Get dashboard data for User Management
     */
    public function dashboardData(Request $request): JsonResponse
    {
        // 1. Header
        $header = [
            'title' => 'User Management',
            'subtitle' => 'Manage users, roles, permissions, and KYC approvals'
        ];

        // 2. Pending KYC Banner
        // Find users with pending KYC
        $pendingKycUsers = User::whereHas('latestKycVerification', function ($query) {
            $query->where('status', 'pending');
        })->with('latestKycVerification')->limit(5)->get();

        $pendingCount = $pendingKycUsers->count(); // This is just limit, ideally we count all
        $totalPendingCount = User::whereHas('latestKycVerification', function ($query) {
            $query->where('status', 'pending');
        })->count();

        $pendingBanner = [
            'label' => 'Pending KYC Approvals',
            'count' => $totalPendingCount,
            'action' => 'View All Pending'
        ];

        $bannerColumns = ['User', 'Role', 'Submitted', 'Documents', 'Actions'];

        $bannerRows = $pendingKycUsers->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ucfirst($user->role_type),
                'submitted' => $user->latestKycVerification ? $user->latestKycVerification->created_at->format('M d, Y') : 'N/A',
                'documentsLabel' => 'View Docs' // simplified
            ];
        });

        // 3. Search Config
        $search = [
            'placeholder' => 'Search by name, email, or user ID...',
            'filters' => [
                'role' => [
                    'label' => 'Role',
                    'options' => ['All Roles', 'Admin', 'Investor', 'Manager', 'Worker']
                ],
                'status' => [
                    'label' => 'Status',
                    'options' => ['All Statuses', 'Active', 'Pending', 'Disabled']
                ],
                'kyc' => [
                    'label' => 'KYC',
                    'options' => ['All', 'Approved', 'Pending', 'Not Started']
                ]
            ],
            'clearFilters' => 'Clear Filters'
        ];

        // 4. Table Data
        $query = User::with(['latestKycVerification']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('role') && $request->role !== 'All Roles') {
            $query->where('role_type', strtolower($request->role));
        }

        if ($request->filled('status') && $request->status !== 'All Statuses') {
            if ($request->status === 'Active') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'Pending') {
                $query->whereNull('email_verified_at');
            } elseif ($request->status === 'Disabled') {
                // Assuming soft deletes or a status column, for now relying on email_verified_at logic or adding custom logic
                // If you have a specific status column, use it. For now, sticking to standard User model
            }
        }

        if ($request->filled('kyc') && $request->kyc !== 'All') {
            $kycStatus = strtolower($request->kyc);
            if ($kycStatus === 'not started') {
                $query->whereDoesntHave('latestKycVerification');
            } else {
                $query->whereHas('latestKycVerification', function($q) use ($kycStatus) {
                    $q->where('status', $kycStatus);
                });
            }
        }

        $users = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'userManagementAdmin' => [
                    'header' => $header,
                    'pendingBanner' => [
                        'label' => $pendingBanner['label'],
                        'count' => $pendingBanner['count'],
                        'action' => $pendingBanner['action'],
                        'columns' => $bannerColumns,
                        'rows' => $bannerRows
                    ],
                    'search' => $search,
                    'users' => [
                        'headers' => ['Name', 'Role', 'Status', 'Last Active', 'KYC', 'Actions'],
                        'rows' => $users->map(function($user) {
                            return [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'avatar' => $user->avatar_url ?? null, // Assuming avatar_url attribute or null
                                'role' => ucfirst($user->role_type),
                                'status' => $user->email_verified_at ? 'Active' : 'Pending',
                                'statusColor' => $user->email_verified_at ? '#DCFCE7' : '#FEF3C7',
                                'statusTextColor' => $user->email_verified_at ? '#166534' : '#92400E',
                                'lastActive' => $user->last_login_at ? \Carbon\Carbon::parse($user->last_login_at)->diffForHumans() : 'Never',
                                'kycStatus' => $user->latestKycVerification ? ucfirst($user->latestKycVerification->status) : 'Not Started',
                                'kycColor' => match($user->latestKycVerification?->status) {
                                    'approved' => '#DCFCE7',
                                    'rejected' => '#FEE2E2',
                                    'pending' => '#FEF3C7',
                                    default => '#F1F5F9'
                                },
                                'kycTextColor' => match($user->latestKycVerification?->status) {
                                    'approved' => '#166534',
                                    'rejected' => '#991B1B',
                                    'pending' => '#92400E',
                                    default => '#64748B'
                                }
                            ];
                        })
                    ],
                    'pagination' => [
                        'current_page' => $users->currentPage(),
                        'last_page' => $users->lastPage(),
                        'total' => $users->total(),
                        'per_page' => $users->perPage()
                    ]
                ]
            ]
        ]);
    }

    /**
     * Get all users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->role($request->role);
        }

        $perPage = $request->get('per_page', 20);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Create a new user
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_type' => 'required|string|max:50',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_type' => $request->role_type,
        ]);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load('roles'),
        ], 201);
    }

    /**
     * Get user details
     */
    public function show($id): JsonResponse
    {
        $user = User::with(['roles', 'permissions'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_type' => 'sometimes|string|max:50',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $data = $request->only(['name', 'email', 'role_type']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('roles'),
        ]);
    }

    /**
     * Delete user
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if (Auth::id() == $user->getKey()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    /**
     * Assign roles to user
     */
    public function assignRoles(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->syncRoles($request->roles);

        return response()->json([
            'success' => true,
            'message' => 'Roles assigned successfully',
            'data' => $user->load('roles'),
        ]);
    }
}
