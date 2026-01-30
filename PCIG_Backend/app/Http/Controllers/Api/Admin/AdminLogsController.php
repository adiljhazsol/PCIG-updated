<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExportLog;
use App\Models\NoticeLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLogsController extends Controller
{
    /**
     * Get export logs
     */
    public function exports(Request $request): JsonResponse
    {
        $logs = ExportLog::with('user')->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Get notice logs
     */
    public function notices(Request $request): JsonResponse
    {
        $logs = NoticeLog::orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    /**
     * Store Export Log (Internal use mainly, but exposed for testing/manual entry)
     */
    public function storeExport(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'file_path' => 'required|string',
        ]);

        $log = ExportLog::create([
            'type' => $request->type,
            'file_path' => $request->file_path,
            'exported_by' => $request->user()->id,
            'exported_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * Store Notice Log (Internal use mainly)
     */
    public function storeNotice(Request $request): JsonResponse
    {
        $request->validate([
            'sent_to' => 'required|string',
            'status' => 'required|string',
        ]);

        $log = NoticeLog::create([
            'notice_id' => $request->notice_id,
            'sent_to' => $request->sent_to,
            'sent_at' => now(),
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }
}
