<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\NoticeTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class AdminNoticeController extends Controller
{
    public function dashboardData(Request $request): JsonResponse
    {
        $now = Carbon::now();
        
        // Filter Logic
        $statusFilter = $request->input('status', 'All Status');
        $dateRange = $request->input('date_range', 'Last 30 Days');
        $search = $request->input('search', '');
        $sortColumn = $request->input('sort_col', 'created_at');
        $sortDirection = $request->input('sort_dir', 'desc');

        // Date Range Logic
        $startDate = $now->copy()->subDays(30);
        if ($dateRange === 'Last Quarter') {
            $startDate = $now->copy()->subMonths(3);
        } elseif ($dateRange === 'YTD') {
            $startDate = $now->copy()->startOfYear();
        } elseif ($dateRange === 'This Month') {
             $startDate = $now->copy()->startOfMonth();
        }

        // Summary Cards Data (Global stats, not filtered by table filters usually, or maybe they should be? 
        // Usually summary cards are global or time-bound. I'll keep them standard time-bound for now)
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $sentThisMonth = Notice::whereIn('status', ['sent', 'delivered'])->whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $sentLastMonth = Notice::whereIn('status', ['sent', 'delivered'])->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $pendingReview = Notice::where('status', 'draft')->count();
        
        $totalDelivered = Notice::where('status', 'delivered')->count();
        $totalSent = Notice::whereIn('status', ['sent', 'delivered', 'returned'])->count();
        $deliveryRate = $totalSent > 0 ? round(($totalDelivered / $totalSent) * 100) . '%' : '0%';
        
        $returnedCount = Notice::where('status', 'returned')->count();

        // Header
        $header = [
            'title' => 'Notice Letters',
            'subtitle' => 'Generate and track legal notices for property actions.',
            'actionButtons' => [
                ['label' => 'Export Logs', 'icon' => 'FileText'],
                ['label' => 'Create Notice', 'icon' => 'Plus'],
                // Hidden/Conditional buttons logic handled in frontend usually
            ]
        ];

        // Summary Cards
        $trendDiff = $sentThisMonth - $sentLastMonth;
        $trendStr = ($trendDiff >= 0 ? '+' : '-') . abs($trendDiff) . ' vs last month';

        $summaryCards = [
            ['icon' => 'Send', 'label' => 'Sent This Month', 'value' => (string)$sentThisMonth, 'subtitle' => $trendStr, 'color' => '#3B82F6', 'bg' => '#EFF6FF'],
            ['icon' => 'Clock', 'label' => 'Pending Review', 'value' => (string)$pendingReview, 'subtitle' => 'Requires attention', 'color' => '#F59E0B', 'bg' => '#FFFBEB'],
            ['icon' => 'CheckCircle', 'label' => 'Delivered', 'value' => $deliveryRate, 'subtitle' => 'Delivery success rate', 'color' => '#10B981', 'bg' => '#ECFDF5'],
            ['icon' => 'AlertCircle', 'label' => 'Returned', 'value' => (string)$returnedCount, 'subtitle' => 'Action required', 'color' => '#EF4444', 'bg' => '#FEF2F2'],
        ];

        // Search & Filters Config
        $statuses = Notice::distinct('status')->pluck('status')->map(fn($s) => ucfirst($s))->toArray();
        $searchAndFilters = [
            'searchPlaceholder' => 'Search notices...',
            'filters' => [
                ['icon' => 'Filter', 'label' => 'Status', 'value' => $statusFilter, 'options' => array_merge(['All Status'], $statuses)],
                ['icon' => 'Calendar', 'label' => 'Date Range', 'value' => $dateRange, 'options' => ['Last 30 Days', 'This Month', 'Last Quarter', 'YTD']],
            ]
        ];

        // Notices Query
        $query = Notice::with(['property', 'template'])
            ->select('notices.*') // Select notices columns to avoid collision
            ->leftJoin('properties', 'notices.property_id', '=', 'properties.id');

        // Apply Search
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('recipient_name', 'like', "%{$search}%")
                  ->orWhere('recipient_address', 'like', "%{$search}%")
                  ->orWhere('properties.address', 'like', "%{$search}%")
                  ->orWhere('properties.parcel_id', 'like', "%{$search}%");
            });
        }

        // Apply Status Filter
        if ($statusFilter !== 'All Status') {
            $query->where('status', strtolower($statusFilter));
        }

        // Apply Date Filter
        $query->where('created_at', '>=', $startDate);

        // Apply Sort
        // Map frontend sort columns to DB columns
        $sortMap = [
            'Created' => 'notices.created_at',
            'Status' => 'notices.status',
            'Recipient' => 'notices.recipient_name',
            'Sent' => 'notices.sent_date',
            'Tracking' => 'notices.tracking_number',
            'Property' => 'properties.address',
            'Type' => 'notice_templates.name',
        ];
        $dbSortCol = $sortMap[$sortColumn] ?? 'notices.created_at';
        $query->orderBy($dbSortCol, $sortDirection);

        $notices = $query->limit(50)->get();
        
        $rows = $notices->map(function ($notice) {
            $statusColor = match($notice->status) {
                'draft' => '#64748B',
                'sent' => '#3B82F6',
                'delivered' => '#10B981',
                'returned' => '#EF4444',
                'generated' => '#8B5CF6',
                default => '#64748B'
            };
            $statusBg = match($notice->status) {
                'draft' => '#F1F5F9',
                'sent' => '#EFF6FF',
                'delivered' => '#ECFDF5',
                'returned' => '#FEF2F2',
                'generated' => '#F5F3FF',
                default => '#F1F5F9'
            };

            // Build timeline events dynamically
            $events = [
                ['date' => $notice->created_at->format('M d, Y'), 'event' => 'Notice Generated']
            ];
            if ($notice->sent_date) {
                $events[] = ['date' => $notice->sent_date->format('M d, Y'), 'event' => 'Sent to Recipient'];
            }
            if ($notice->status === 'delivered') {
                $events[] = ['date' => $notice->updated_at->format('M d, Y'), 'event' => 'Delivered'];
            }
             if ($notice->status === 'returned') {
                $events[] = ['date' => $notice->updated_at->format('M d, Y'), 'event' => 'Returned'];
            }

            // Build documents list
            $documents = [];
            if ($notice->file_path) {
                $documents[] = [
                    'name' => basename($notice->file_path),
                    'size' => 'Unknown',
                    'type' => 'PDF'
                ];
            }

            return [
                'id' => (string)$notice->id,
                'property' => [
                    'address' => $notice->property->address ?? 'Unknown Address',
                    'parcel' => $notice->property->parcel_id ?? 'Unknown Parcel',
                    'city' => $notice->property->city ?? '',
                    'state' => $notice->property->state ?? '',
                    'zip' => $notice->property->zip ?? '',
                    'county' => $notice->property->county ?? '',
                ],
                'recipient' => $notice->recipient_name,
                'noticeType' => $notice->template->name ?? 'Standard Notice',
                'noticeTypeBg' => '#F1F5F9',
                'noticeTypeColor' => '#475569',
                'createdDate' => $notice->created_at->format('M d, Y'),
                'sendDate' => $notice->sent_date ? $notice->sent_date->format('M d, Y') : '-',
                'status' => ucfirst($notice->status ?? 'Draft'),
                'statusBg' => $statusBg,
                'statusColor' => $statusColor,
                'tracking' => $notice->tracking_number ?? '-',
                'actions' => 'View',
                'selected' => false,
                'detail' => [
                    'title' => 'Notice Details',
                    'status' => ucfirst($notice->status ?? 'Draft'),
                    'statusBg' => $statusBg,
                    'statusColor' => $statusColor,
                    'propertyInfo' => [
                        'address' => $notice->property->address ?? '',
                        'city' => $notice->property->city ?? '',
                        'state' => $notice->property->state ?? '',
                        'zip' => $notice->property->zip ?? '',
                        'apn' => $notice->property->parcel_id ?? '',
                        'county' => $notice->property->county ?? ''
                    ],
                    'recipientInfo' => [
                        'name' => $notice->recipient_name,
                        'relation' => 'Owner',
                        'address' => $notice->recipient_address,
                        'email' => 'N/A',
                        'phone' => 'N/A'
                    ],
                    'noticeDetails' => [
                        'noticeType' => $notice->template->name ?? 'Standard Notice',
                        'noticeTypeBg' => '#F1F5F9',
                        'noticeTypeColor' => '#475569',
                        'status' => ucfirst($notice->status ?? 'Draft'),
                        'statusBg' => $statusBg,
                        'statusColor' => $statusColor,
                        'date' => $notice->created_at->format('M d, Y'),
                        'trackingNumber' => $notice->tracking_number ?? '-'
                    ],
                    'documents' => [
                        'title' => 'Documents',
                        'items' => $documents
                    ],
                    'timeline' => [
                        'title' => 'History',
                        'events' => $events
                    ]
                ]
            ];
        });

        $noticesTable = [
            'headers' => ['Select', 'Property', 'Recipient', 'Type', 'Created', 'Sent', 'Status', 'Tracking', 'Actions'],
            'rows' => $rows
        ];

        return response()->json([
            'header' => $header,
            'summaryCards' => $summaryCards,
            'searchAndFilters' => $searchAndFilters,
            'noticesTable' => $noticesTable
        ]);
    }

    public function bulkGenerate(Request $request): JsonResponse
    {
        $request->validate([
            'notice_ids' => 'required|array',
            'notice_ids.*' => 'exists:notices,id'
        ]);

        // Logic to regenerate or process selected notices
        // For now, we'll just update status to 'generated' if they were draft
        $count = Notice::whereIn('id', $request->notice_ids)
            ->where('status', 'draft')
            ->update(['status' => 'generated', 'updated_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "Successfully processed {$count} notices."
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        // Mock export functionality
        // In real app, generate CSV/Excel
        return response()->json([
            'success' => true,
            'message' => 'Export started. You will receive an email when ready.',
            'url' => '#', // Link to download if immediate
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Notice::with(['property', 'template']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'template_id' => 'required|exists:notice_templates,id',
            'recipient_name' => 'required|string',
            'recipient_address' => 'required|string',
        ]);

        $template = NoticeTemplate::find($request->template_id);
        
        // Mock PDF Generation
        // In real app: use dompdf/snappy to generate PDF from template content + data
        $content = str_replace(
            ['{{recipient_name}}', '{{property_address}}'],
            [$request->recipient_name, $request->recipient_address],
            $template->content
        );
        $filePath = 'notices/' . uniqid() . '.pdf'; 

        $notice = Notice::create([
            'property_id' => $request->property_id,
            'template_id' => $request->template_id,
            'recipient_name' => $request->recipient_name,
            'recipient_address' => $request->recipient_address,
            'status' => 'generated',
            'file_path' => $filePath,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $notice,
            'message' => 'Notice generated successfully'
        ], 201);
    }
}
