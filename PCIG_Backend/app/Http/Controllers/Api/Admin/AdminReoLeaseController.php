<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Models\ReoLease;
use App\Models\RentPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReoLeaseController extends Controller
{
    public function dashboardData(): JsonResponse
    {
        $leasedPropertiesCount = Property::where('workflow_stage', 'reo_leased')->count();
        $monthlyRevenue = ReoLease::where('status', 'active')->sum('monthly_rent');
        // Mocking occupancy rate and lease term for now as we might need more complex logic
        $occupancyRate = $leasedPropertiesCount > 0 ? '92%' : '0%';
        $avgLeaseTerm = '12 mos';

        $expiringLeasesCount = ReoLease::where('status', 'active')
            ->where('lease_end', '<=', now()->addDays(30))
            ->count();

        // Get recent leases for the list
        $recentLeases = Property::where('workflow_stage', 'reo_leased')
            ->with(['primaryImage', 'reoLease', 'reoLease.payments'])
            ->latest()
            ->take(10)
            ->get();

        $leasesData = $recentLeases->map(function ($p) {
            $lease = $p->reoLease;
            $paymentStatus = 'Paid'; // Logic to determine status
            $paymentStatusColor = '#10B981';
            
            return [
                'id' => (string)$p->id,
                'property' => $p->address,
                'name' => $p->address,
                'address' => $p->address, // Added for detail view compatibility
                'location' => $p->city . ', ' . $p->state,
                'image' => $p->primaryImage ? $p->primaryImage->file_path : '/api/placeholder/400/320',
                'status' => ucfirst($p->status ?? 'leased'),
                'statusColor' => '#10B981', // Mock logic
                'tenant' => $lease ? $lease->tenant_name : 'Vacant',
                'tenantType' => 'Individual', // Mock
                'rent' => $lease ? '$' . number_format($lease->monthly_rent, 0) : '$0',
                'rentStatusLabel' => $paymentStatus, // Renamed for list view
                'rentStatusColor' => $paymentStatusColor,
                'opex' => '$0', 
                'noi' => '$' . number_format(($lease ? $lease->monthly_rent : 0), 0),
                'noiColor' => '#10B981',
                'yield' => 'N/A', // ROI calculation requires more data
                'leaseEnd' => $lease ? $lease->lease_end->format('M Y') : '--',
                'leaseEndDetail' => $lease ? $lease->lease_end->diffForHumans() : '',
                'tabs' => ['details', 'payment', 'documents'],
                
                // Detailed View Objects
                'leaseDetails' => [
                    'tenant' => $lease ? $lease->tenant_name : '--',
                    'contact' => 'N/A', 
                    'leaseStart' => $lease ? $lease->lease_start->format('M d, Y') : '--',
                    'leaseEnd' => $lease ? $lease->lease_end->format('M d, Y') : '--',
                    'baseRent' => $lease ? '$' . number_format($lease->monthly_rent, 2) : '$0.00',
                    'securityDep' => $lease ? '$' . number_format($lease->security_deposit, 2) : '$0.00',
                ],
                'rentStatus' => [
                    'period' => now()->format('F Y'),
                    'status' => 'Paid',
                    'statusColor' => '#10B981',
                    'amountDue' => '$0.00',
                    'balance' => '$0.00',
                    'balanceColor' => '#10B981'
                ],
                'recentActivity' => $lease ? $lease->payments()->latest()->limit(5)->get()->map(function($payment) {
                    return [
                        'date' => $payment->paid_date ? $payment->paid_date->format('M j, Y') : $payment->due_date->format('M j, Y'),
                        'type' => 'Rent Payment',
                        'amount' => '$' . number_format($payment->amount, 2),
                        'amountColor' => '#10B981'
                    ];
                }) : [],
                'performanceYTD' => [
                    'grossIncome' => '$28,800',
                    'expenses' => '$4,200',
                    'netOperatingIncome' => '$24,600',
                    'cashYield' => '8.2%',
                    'cashYieldColor' => '#10B981'
                ]
            ];
        });

        $data = [
            'header' => [
                'title' => 'REO Leased',
                'subtitle' => 'Manage rental properties, tenants, and payment collection'
            ],
            'actionButtons' => [
                'exportRentRoll' => [
                    'label' => 'Export Rent Roll',
                    'icon' => 'Download'
                ],
                'addLease' => [
                    'label' => 'Add New Lease',
                    'icon' => 'Plus'
                ]
            ],
            'alertBanner' => [
                'message' => $expiringLeasesCount . ' leases expiring in next 30 days',
                'buttonLabel' => 'View Leases'
            ],
            'summaryCards' => [
                [
                    'label' => 'Total Leased',
                    'value' => (string)$leasedPropertiesCount,
                    'icon' => 'Building2',
                    'subtext' => '+2 this month',
                    'subtextColor' => '#10B981'
                ],
                [
                    'label' => 'Monthly Revenue',
                    'value' => '$' . number_format($monthlyRevenue, 0),
                    'icon' => 'DollarSign',
                    'subtext' => '+$3,200',
                    'subtextColor' => '#10B981'
                ],
                [
                    'label' => 'Occupancy Rate',
                    'value' => $occupancyRate,
                    'icon' => 'TrendingUp',
                    'subtext' => '+5%',
                    'subtextColor' => '#10B981'
                ],
                [
                    'label' => 'Avg Lease Term',
                    'value' => $avgLeaseTerm,
                    'icon' => 'Calendar',
                    'subtext' => 'Stable',
                    'subtextColor' => '#64748B'
                ]
            ],
            'searchPlaceholder' => 'Search properties, tenants...',
            'filters' => [
                [
                    'label' => 'All Statuses',
                    'selected' => 'All Statuses',
                    'options' => ['All Statuses', 'Active', 'Late Payment', 'Expiring Soon', 'Vacant']
                ],
                [
                    'label' => 'Rent Range',
                    'selected' => 'Any Rent',
                    'options' => ['Any Rent', 'Under $1000', '$1000-$2000', '$2000+']
                ],
                [
                    'label' => 'Lease End',
                    'selected' => 'Any Date',
                    'options' => ['Any Date', 'Next 30 Days', 'Next 90 Days', 'This Year']
                ]
            ],
            'tableHeaders' => ['', 'Property', 'Status', 'Tenant', 'Monthly Rent', 'Payment Status', 'Opex', 'NOI', 'Yield', 'Lease End'],
            'leases' => $leasesData,
        ];

        return response()->json($data);
    }

    public function leasedProperties(Request $request): JsonResponse
    {
        $query = Property::where('workflow_stage', 'reo_leased')
            ->with(['primaryImage', 'reoLease', 'reoLease.payments']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('parcel_id', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $properties = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PropertyResource::collection($properties->items()),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function createLease(Request $request, $id): JsonResponse
    {
        $request->validate([
            'tenant_name' => 'required|string|max:255',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',
            'lease_start' => 'required|date',
            'lease_end' => 'required|date|after:lease_start',
            'notes' => 'nullable|string',
        ]);

        $property = Property::findOrFail($id);
        
        // Move to reo_leased stage if not already there or completed
        if ($property->workflow_stage !== 'reo_leased' && $property->workflow_stage !== 'completed') {
            $property->update(['workflow_stage' => 'reo_leased', 'status' => 'leased']);
        }

        // Deactivate any existing active leases
        ReoLease::where('property_id', $property->id)
            ->where('status', 'active')
            ->update(['status' => 'terminated']);

        $lease = ReoLease::create([
            'property_id' => $property->id,
            'tenant_name' => $request->tenant_name,
            'monthly_rent' => $request->monthly_rent,
            'security_deposit' => $request->security_deposit,
            'lease_start' => $request->lease_start,
            'lease_end' => $request->lease_end,
            'status' => 'active',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lease created successfully',
            'data' => $lease,
        ], 201);
    }

    public function updateLease(Request $request, $id): JsonResponse
    {
        $request->validate([
            'tenant_name' => 'nullable|string|max:255',
            'monthly_rent' => 'nullable|numeric|min:0',
            'lease_end' => 'nullable|date',
            'status' => 'nullable|in:active,terminated,expired',
            'notes' => 'nullable|string',
        ]);

        $lease = ReoLease::findOrFail($id);
        $lease->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Lease updated successfully',
            'data' => $lease,
        ]);
    }

    public function addPayment(Request $request, $id): JsonResponse
    {
        // $id is lease_id
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'paid_date' => 'nullable|date',
            'status' => 'required|in:paid,pending,late,partial',
            'notes' => 'nullable|string',
        ]);

        $lease = ReoLease::findOrFail($id);

        $payment = $lease->payments()->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $payment,
        ], 201);
    }
}
