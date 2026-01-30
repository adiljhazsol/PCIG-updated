<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Admin routes
    // Route::middleware('role:admin')->prefix('admin')->group(function () {
    Route::prefix('admin')->group(function () {
    // Route::prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDashboardController::class, 'dashboardData']);
        
        // Properties
        Route::get('/properties/workflow-hub', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'workflowHub']);
        Route::apiResource('properties', App\Http\Controllers\Api\Admin\AdminPropertyController::class);
        
        // Funds
        Route::get('/funds/dashboard-data', [App\Http\Controllers\Api\Admin\AdminFundController::class, 'dashboardData']);
        Route::apiResource('funds', App\Http\Controllers\Api\Admin\AdminFundController::class);
        
        // Investors (Users)
        Route::get('/users/dashboard-data', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'dashboardData']);
        Route::apiResource('users', App\Http\Controllers\Api\Admin\AdminUserController::class);
        Route::put('/users/{id}/roles', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'assignRoles']);
        
        // Settings
        Route::get('/settings/dashboard-data', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'dashboardData']);
        Route::get('/settings/profile', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'getProfile']);
        Route::put('/settings/profile', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'updateProfile']);
        Route::put('/settings/password', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'changePassword']);
        Route::get('/settings', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'index']);
        Route::post('/settings', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'store']);

        // Locations (City/County/State Config)
        Route::get('/locations', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'index']);
        Route::post('/locations', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'store']);
        Route::put('/locations/{id}', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'update']);
        Route::delete('/locations/{id}', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'destroy']);
        
        // Reports
        Route::get('/reports/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReportsController::class, 'dashboardData']);

        // Properties
        Route::get('/properties/workflow-hub', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'workflowHub']);
        Route::get('/properties/{id}/detail-dashboard', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'detailDashboardData']);
        Route::get('/properties/{id}/documents-dashboard', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'documentsDashboardData']);
        Route::post('/properties/{id}/documents', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'uploadDocument']);
        Route::get('/properties/{id}/documents/download', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'downloadDocuments']);
        Route::delete('/properties/documents/{documentId}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'deleteDocument']);
        Route::get('/properties', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'index']);
        Route::post('/properties', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'store']);
        Route::get('/properties/{id}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'show']);
        Route::put('/properties/{id}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'update']);
        Route::delete('/properties/{id}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'destroy']);

        Route::get('/reports/types', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'types']);
        Route::get('/reports/history', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'history']);
        Route::post('/reports/generate', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'generate']);
        Route::get('/reports/{id}/download', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'download']);
        
        // Import Center
        Route::get('/imports/dashboard-data', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'dashboardData']);
        Route::get('/imports/history', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'history']);
        Route::post('/imports/upload', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'upload']);
        Route::post('/imports/upload-properties', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'uploadProperties']);
        Route::get('/imports/template/{type}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'downloadTemplate']);
        
        // Audit Log
        Route::get('/audit-log/dashboard-data', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'dashboardData']);
        Route::get('/audit-logs', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'index']);
        Route::get('/audit-logs/filters', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'filters']);
        Route::get('/audit-logs/export', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'export']);

        // Deadlines (Calendar)
        Route::get('/deadlines/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'dashboardData']);
        Route::post('/deadlines', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'store']);
        Route::put('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'update']);
        Route::delete('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'destroy']);
        
        // Workflow Modules
        Route::prefix('workflow')->group(function () {
             Route::get('/payoff', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'dashboardData']);
             Route::get('/surplus', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'dashboardData']);
             Route::get('/barment', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'dashboardData']);
             Route::get('/reo-leased', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'dashboardData']);
             Route::get('/redemption', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'dashboardData']);
             Route::get('/sheriff', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'dashboardData']);
             Route::get('/fifa', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'dashboardData']);
        });

        Route::get('/investors/dashboard-data', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'dashboardData']);
        Route::get('/investors/export', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'export']);
        Route::get('/investors/invitations', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'index']);
        Route::post('/investors/invite', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'invite']);
        Route::post('/investors/invitations/{id}/resend', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'resend']);

        Route::get('/investors', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'list']);
        Route::get('/investors/{id}', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'show']);
        Route::post('/investors/{id}/approve', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'approve']);
        Route::post('/investors/{id}/reject', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'reject']);

        Route::get('/distributions', [App\Http\Controllers\Api\Admin\AdminDistributionController::class, 'list']);
        Route::post('/distributions', [App\Http\Controllers\Api\Admin\AdminDistributionController::class, 'store']);
        Route::put('/distributions/{id}/process', [App\Http\Controllers\Api\Admin\AdminDistributionController::class, 'process']);

        Route::get('/transactions/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'dashboardData']);
        Route::get('/transactions', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'list']);
        Route::post('/transactions', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'store']);
        Route::get('/transactions/{id}', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'show']);
        Route::put('/transactions/{id}/status', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'updateStatus']);

        Route::get('/shares/listings', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'shareListings']);
        Route::get('/shares/transactions', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'shareTransactions']);

        Route::get('/fifa/imports', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'index']);
        Route::post('/fifa/import', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'upload']);
        Route::get('/fifa/imports/{id}', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'show']);
        
        Route::get('/fifa/processing-dashboard-data', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'processingDashboardData']);
        Route::get('/fifa/import-dashboard-data', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'importDashboardData']);
        
        Route::post('/fifa/matches/{id}/approve', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'approveMatch']);
        Route::post('/fifa/matches/{id}/reject', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'rejectMatch']);
        Route::post('/fifa/settings', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'updateSettings']);
        Route::post('/fifa/imports/{id}/map', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'mapFields']);
        
        Route::post('/fifa/bulk-assign', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'bulkAssign']);
        Route::post('/fifa/bulk-export', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'bulkExport']);
        Route::post('/fifa/generate-sheriff-export', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'generateSheriffExport']);
        Route::post('/fifa/mark-exported', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'markAsExported']);

        Route::get('/import-center/template/{type}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'downloadTemplate']);

        Route::get('/fifa/processing', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'fifaProcessing']);
        Route::put('/fifa/{id}/process', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'processFIFA']);

        Route::get('/sheriff/dashboard-data', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'dashboardData']);
        Route::get('/sheriff/properties', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'properties']);
        Route::put('/sheriff/{id}/update', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'update']);
        Route::post('/sheriff/{id}/complete', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'complete']);
        Route::post('/sheriff/generate-export', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'generateExport']);
        Route::post('/sheriff/schedule-pickup', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'schedulePickup']);

        Route::get('/redemption/dashboard-data', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'dashboardData']);
        Route::get('/redemption/properties', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'properties']);
        Route::put('/redemption/{id}/update', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'update']);
        Route::post('/redemption/{id}/redeem', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'redeem']);

        Route::get('/barment/dashboard-data', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'dashboardData']);
        Route::get('/barment/properties', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'properties']);
        Route::post('/barment/{id}/file', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'file']);
        Route::put('/barment/case/{id}/update', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'update']);

        Route::get('/quiet-title/dashboard-data', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'dashboardData']);
        Route::get('/quiet-title/properties', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'properties']);
        Route::post('/quiet-title/{id}/file', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'file']);
        Route::put('/quiet-title/case/{id}/update', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'update']);

        Route::get('/auction/dashboard-data', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'dashboardData']);
        Route::get('/auction/properties', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'properties']);
        Route::post('/auction/schedule', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'schedule']);
        Route::put('/auction/{id}/update', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'update']);
        Route::post('/auction/{id}/complete', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'complete']);

        Route::get('/reo/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'dashboardData']);
        Route::get('/reo/properties', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'properties']);
        Route::put('/reo/{id}/update', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'update']);
        Route::post('/reo/{id}/list', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'listForSale']);
        Route::post('/reo/{id}/offers', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'addOffer']);
        Route::put('/reo/offers/{offerId}', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'updateOffer']);

        Route::get('/reo/lease/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'dashboardData']);
        Route::get('/reo/leased', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'leasedProperties']);
        Route::post('/reo/{id}/lease', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'createLease']);
        Route::put('/reo/lease/{id}/update', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'updateLease']);
        Route::post('/reo/lease/{id}/payment', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'addPayment']);

        Route::get('/parcel/dashboard-data', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'dashboardData']);
        Route::get('/parcel/export', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'export']);
        Route::get('/parcel/search', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'search']);
        Route::post('/parcel/research', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'saveResearch']);
        Route::post('/parcel/bulk-update', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'bulkUpdate']);
        Route::post('/parcel/import', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'import']);
        Route::post('/parcel/{id}/interaction', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'logInteraction']);
        Route::post('/parcel/{id}/document', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'uploadDocument']);

        Route::get('/payments/dashboard-data', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'dashboardData']);
        Route::get('/payments', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'index']);
        Route::get('/payments/pending', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'pending']);
        Route::post('/payments/process', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'processBatch']);
        Route::post('/payments', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'store']);

        Route::get('/ledger/dashboard-data', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'dashboardData']);
        Route::get('/ledger', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'index']);
        Route::get('/ledger/accounts', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'accounts']);
        Route::post('/ledger/entry', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'store']);

        Route::get('/payoff/dashboard-data', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'dashboardData']);
        Route::get('/payoff/requests', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'index']);
        Route::get('/payoff/portal-data', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'portalData']);
        Route::post('/payoff/request', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'storeOwnerRequest']);
        Route::put('/payoff/request/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'updateOwnerRequest']);
        Route::put('/payoff/lawyer-request/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'updateLawyerRequest']);

        Route::get('/tax-appeals/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'dashboardData']);
        Route::get('/tax-appeals', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'index']);
        Route::get('/tax-appeals/{id}', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'show']);
        Route::post('/tax-appeals', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'store']);
        Route::put('/tax-appeals/{id}', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'update']);

        Route::get('/time-tracking', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'index']);
        Route::post('/time-tracking', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'store']);
        Route::put('/time-tracking/{id}', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'update']);
        Route::delete('/time-tracking/{id}', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'destroy']);

        Route::get('/interest/dashboard-data', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'dashboardData']);
        Route::get('/interest/history', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'index']);
        Route::get('/interest/pending', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'pending']);
        Route::post('/interest/calculate', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'calculate']);
        Route::post('/interest/post', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'post']);

        Route::get('/depreciation/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDepreciationController::class, 'dashboardData']);
        Route::get('/depreciation/history', [App\Http\Controllers\Api\Admin\AdminDepreciationController::class, 'index']);
        Route::post('/depreciation/calculate', [App\Http\Controllers\Api\Admin\AdminDepreciationController::class, 'calculate']);

        Route::get('/k1/dashboard-data', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'dashboardData']);
        Route::get('/time-tracking/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'dashboardData']);
        Route::get('/notifications/dashboard-data', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'dashboardData']);
        Route::get('/k1/forms', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'index']);
        Route::post('/k1/generate', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'generate']);
        Route::post('/k1/publish', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'publish']);

        Route::get('/expenses/dashboard-data', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'dashboardData']);
        Route::get('/expenses', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'index']);
        Route::post('/expenses', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'store']);

        Route::get('/surplus-funds/dashboard-data', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'dashboardData']);
        Route::get('/surplus-funds', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'index']);
        Route::post('/surplus-funds', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'store']);


        // Tasks
        Route::get('/tasks/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'dashboardData']);
        Route::get('/tasks', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'index']);
        Route::post('/tasks', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'store']);
        Route::get('/tasks/{id}', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'show']);
        Route::put('/tasks/{id}', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'update']);
        Route::delete('/tasks/{id}', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'destroy']);

        Route::post('/surplus-funds/{id}/claim', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'claim']);
        Route::put('/surplus-funds/{id}', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'update']);

        Route::get('/notices/dashboard-data', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'dashboardData']);
        Route::get('/notices', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'index']);
        Route::post('/notices/generate', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'generate']);
        Route::post('/notices/bulk-generate', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'bulkGenerate']);
        Route::post('/notices/export', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'export']);

        Route::get('/efile/dashboard-data', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'dashboardData']);
        Route::get('/efile/cancellations', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'index']);
        Route::post('/efile/cancel', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'cancel']);

        Route::apiResource('templates', App\Http\Controllers\Api\Admin\AdminTemplateController::class);


        Route::get('/deadlines/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'dashboardData']);
        Route::get('/deadlines', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'index']);
        Route::post('/deadlines', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'store']);
        Route::put('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'update']);
        Route::delete('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'destroy']);

        Route::get('/notifications', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'index']);
        Route::post('/notifications/send', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'send']);
        Route::get('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'escalations']);
        Route::post('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'updateRule']); // Create
        Route::put('/notifications/escalations/{id}', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'updateRule']); // Update

        Route::get('/notification-settings', [App\Http\Controllers\Api\Admin\AdminNotificationSettingsController::class, 'index']);
        Route::put('/notification-settings', [App\Http\Controllers\Api\Admin\AdminNotificationSettingsController::class, 'update']);

        Route::get('/locations', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'index']);
        Route::post('/locations', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'store']);
        Route::put('/locations/{id}', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'update']);
        Route::delete('/locations/{id}', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'destroy']);

        Route::get('/exports-log', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'exports']);
        Route::post('/exports-log', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'storeExport']); // For testing
        Route::get('/notices-log', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'notices']);
        Route::post('/notices-log', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'storeNotice']); // For testing
    });
    
    // Investor routes
    Route::prefix('investor')->middleware(['auth:sanctum', 'role:investor'])->group(function () {
        Route::get('/dashboard-data', [App\Http\Controllers\Api\Investor\InvestorDashboardController::class, 'dashboardData']);
        
        // Properties
        Route::get('/properties', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'list']);
        Route::get('/properties/{id}', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'show']);
        Route::get('/properties/{id}/dashboard-data', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'detailDashboardData']);
        
        // Funds
        Route::get('/funds', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'list']);
        Route::get('/funds/{id}', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'show']);
        Route::post('/funds/invest', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'invest']);
        
        // Share Marketplace
        Route::get('/shares/stats', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'stats']);
        Route::get('/shares/available', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'available']);
        Route::get('/shares/my-listings', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'myListings']);
        Route::get('/shares/portfolio', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'portfolio']);
        Route::get('/shares/transactions', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'transactions']);
        Route::post('/shares/list', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'list']);
        Route::post('/shares/{id}/buy', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'buy']);
        Route::post('/shares/{id}/cancel', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'cancel']);

        // Transactions
        Route::get('/transactions', [App\Http\Controllers\Api\Investor\InvestorTransactionController::class, 'list']);
        Route::get('/transactions/summary', [App\Http\Controllers\Api\Investor\InvestorTransactionController::class, 'summary']);

        // Documents
        Route::post('/documents/report', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'generateReport']);
        Route::get('/documents', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'list']);
        Route::get('/documents/{id}/download', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'download']);

        // Notifications
        Route::get('/notifications', [App\Http\Controllers\Api\Investor\NotificationController::class, 'index']);

        // KYC
        Route::get('/kyc/status', [App\Http\Controllers\Api\Investor\InvestorKycController::class, 'status']);
        Route::post('/kyc/submit', [App\Http\Controllers\Api\Investor\InvestorKycController::class, 'submit']);
        Route::post('/kyc/upload', [App\Http\Controllers\Api\Investor\InvestorKycController::class, 'uploadDocument']);

        // Settings
        Route::get('/settings/profile', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'getProfile']);
        Route::put('/settings/profile', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'updateProfile']);
        Route::post('/settings/photo', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'uploadPhoto']);
        Route::put('/settings/password', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'changePassword']);
    });
});
