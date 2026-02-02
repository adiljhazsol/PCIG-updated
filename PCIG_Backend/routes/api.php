<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [App\Http\Controllers\Api\Auth\AuthController::class, 'register']);
    Route::post('/login', [App\Http\Controllers\Api\Auth\AuthController::class, 'login'])->name('login');
    Route::post('/admin-login', [App\Http\Controllers\Api\Auth\AuthController::class, 'adminLogin']);
    Route::post('/forgot-password', [App\Http\Controllers\Api\Auth\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [App\Http\Controllers\Api\Auth\AuthController::class, 'resetPassword']);
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [App\Http\Controllers\Api\Auth\AuthController::class, 'logout']);
    Route::get('/user', [App\Http\Controllers\Api\Auth\AuthController::class, 'me']); // Alias for consistent usage
    Route::get('/auth/me', [App\Http\Controllers\Api\Auth\AuthController::class, 'me']);

    // Admin Routes
    Route::prefix('admin')->group(function () {
        
        // Expenses
        Route::get('/expenses/dashboard-data', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'dashboardData']);
        Route::post('/expenses/import', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'import']);
        Route::post('/expenses/{id}/approve', [App\Http\Controllers\Api\Admin\AdminExpenseController::class, 'approve']);
        Route::apiResource('expenses', App\Http\Controllers\Api\Admin\AdminExpenseController::class);

        // Payments
        Route::get('/payments/dashboard-data', [App\Http\Controllers\Api\Admin\AdminPaymentController::class, 'dashboardData']);
        Route::apiResource('payments', App\Http\Controllers\Api\Admin\AdminPaymentController::class)->only(['index', 'show']);

        // Ledger
        Route::get('/ledger/dashboard-data', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'dashboardData']);
        Route::get('/ledger/accounts', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'accounts']);
        Route::post('/ledger/entries', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'store']);
        Route::post('/ledger/recalculate', [App\Http\Controllers\Api\Admin\AdminLedgerController::class, 'recalculate']);
        
        // Import Center (Frontend uses /imports/dashboard-data)
        Route::get('/imports/dashboard-data', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'dashboardData']);
        Route::post('/imports/properties', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'uploadProperties']);
        Route::post('/imports/upload/{type}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'upload']);
        Route::get('/imports/template/{type}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'downloadTemplate']);
        Route::post('/imports/review/{id}/confirm', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'confirm']);
        Route::post('/imports/review/confirm-batch', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'confirmBatch']);
        Route::post('/imports/review/{id}/update', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'updateReviewItem']);
        
        // FIFA Import Routes
        Route::prefix('fifa')->group(function () {
            Route::get('/imports', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaImportsIndex']);
            Route::get('/imports/{id}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaImportDetails']);
            Route::get('/import-dashboard-data', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaDashboardData']);
        });

        // Depreciation
        Route::get('/depreciation/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDepreciationController::class, 'dashboardData']);

        // Dashboard
        Route::get('/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDashboardController::class, 'dashboardData']);
        
        // Property Routes
        Route::get('/properties/dropdown', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'listForDropdown']);
        Route::get('/properties/dashboard-data', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'dashboardData']);
        Route::get('/properties/{id}/detail-dashboard', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'detailDashboardData']);
        Route::get('/properties/workflow-hub', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'workflowHub']);
        Route::apiResource('properties', App\Http\Controllers\Api\Admin\AdminPropertyController::class);
        
        // Property Workflow Stages
        Route::post('/properties/{id}/stage', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'updateStage']);
        
        // Property Documents & Images
        Route::post('/properties/{id}/images', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'uploadImage']);
        Route::delete('/properties/{id}/images/{imageId}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'deleteImage']);
        Route::post('/properties/{id}/documents', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'uploadDocument']);
        Route::delete('/properties/{id}/documents/{documentId}', [App\Http\Controllers\Api\Admin\AdminPropertyController::class, 'deleteDocument']);
        
        // Funds
        Route::get('/funds/dashboard-data', [App\Http\Controllers\Api\Admin\AdminFundController::class, 'dashboardData']);
        Route::post('/funds/{id}/assign-property', [App\Http\Controllers\Api\Admin\AdminFundController::class, 'assignProperty']);
        Route::apiResource('funds', App\Http\Controllers\Api\Admin\AdminFundController::class);
        
        // Share Listings
        Route::get('/shares/dashboard-data', [App\Http\Controllers\Api\Admin\AdminShareController::class, 'dashboardData']);
        Route::post('/shares/create', [App\Http\Controllers\Api\Admin\AdminShareController::class, 'store']);
        Route::get('/shares/search-users', [App\Http\Controllers\Api\Admin\AdminShareController::class, 'searchUsers']);

        // Transactions
        Route::get('/transactions/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTransactionController::class, 'dashboardData']);
        Route::apiResource('transactions', App\Http\Controllers\Api\Admin\AdminTransactionController::class);
        
        // Distributions
        Route::get('/distributions/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDistributionController::class, 'dashboardData']);
        Route::apiResource('distributions', App\Http\Controllers\Api\Admin\AdminDistributionController::class);
        
        // Investors
        Route::get('/investors/dashboard-data', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'dashboardData']);
        Route::post('/investors/{investorId}/bank-accounts/{accountId}/verify', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'verifyBankAccount']);
        Route::put('/investors/{investorId}/bank-accounts/{accountId}', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'updateBankAccount']);
        Route::delete('/investors/{investorId}/bank-accounts/{accountId}', [App\Http\Controllers\Api\Admin\AdminInvestorController::class, 'deleteBankAccount']);
        Route::apiResource('investors', App\Http\Controllers\Api\Admin\AdminInvestorController::class);
        
        // Interest
        Route::get('/interest/dashboard-data', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'dashboardData']);
        Route::post('/interest/calculate', [App\Http\Controllers\Api\Admin\AdminInterestController::class, 'calculate']);
        
        // Payoff Requests
        Route::get('/payoff/dashboard-data', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'dashboardData']);
        Route::get('/payoff/portal-data', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'portalData']);
        Route::get('/payoff/export-csv', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'exportCsv']);
        Route::post('/payoff/generate-letters', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'generateLetters']);
        Route::get('/payoff', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'index']);
        Route::get('/payoff/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'show']);
                Route::delete('/payoff/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'destroy']);
                Route::post('/payoff/owner', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'storeOwnerRequest']);
        Route::post('/payoff/lawyer', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'storeLawyerRequest']);
        Route::put('/payoff/owner/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'updateOwnerRequest']);
        Route::put('/payoff/lawyer/{id}', [App\Http\Controllers\Api\Admin\AdminPayoffController::class, 'updateLawyerRequest']);

        // Tax Appeal
        Route::get('/tax-appeals/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'dashboardData']);
        Route::post('/tax-appeals/{id}/documents', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'uploadDocument']);
        Route::get('/tax-appeals/{id}/package', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'generatePackage']);
        Route::apiResource('tax-appeals', App\Http\Controllers\Api\Admin\AdminTaxAppealController::class);

        // E-File & Cancellations
        Route::get('/efile/dashboard-data', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'dashboardData']);
        Route::post('/efile/cancel', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'cancel']);
        Route::post('/efile/batch-efile', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'batchEfile']);
        Route::post('/efile/{id}/submit-gsccca', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'submitToGsccca']);
        Route::get('/efile/{id}/view-xml', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'viewXml']);
        Route::post('/efile/{id}/check-status', [App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class, 'checkStatus']);
        Route::apiResource('efile', App\Http\Controllers\Api\Admin\AdminEfileCancellationController::class);

        // K1 Generation
        Route::get('/k1/dashboard-data', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'dashboardData']);
        Route::post('/k1/generate', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'generate']);
        Route::post('/k1/publish', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'publish']);
        Route::get('/k1/download/{id}', [App\Http\Controllers\Api\Admin\AdminK1Controller::class, 'download']);
        
        // Notices
        Route::get('/notices/dashboard-data', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'dashboardData']);
        Route::get('/notices/templates', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'templates']);
        Route::post('/notices/bulk-generate', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'bulkGenerate']);
        Route::post('/notices/export', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'export']);
        Route::post('/notices/{id}/send', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'send']);
        Route::get('/notices/{id}/preview', [App\Http\Controllers\Api\Admin\AdminNoticeController::class, 'preview']);
        Route::apiResource('notices', App\Http\Controllers\Api\Admin\AdminNoticeController::class);

        Route::get('/reports/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'dashboardData']);
        Route::get('/reports/export', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'export']);
        Route::post('/reports/favorite', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'toggleFavorite']);
        Route::post('/reports/schedule', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'storeScheduledReport']);
        Route::delete('/reports/schedule/{id}', [App\Http\Controllers\Api\Admin\AdminReportController::class, 'destroyScheduledReport']);
        
        // Settings
        Route::get('/settings/dashboard-data', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'dashboardData']);
        Route::get('/settings/profile', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'profile']);
        Route::get('/settings', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'index']);
        Route::post('/settings', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'update']);
        Route::post('/settings/locations', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'storeLocation']);
        Route::put('/settings/locations/{id}', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'updateLocation']);
        Route::delete('/settings/locations/{id}', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'destroyLocation']);
        Route::post('/settings/interest', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'updateInterest']);
        Route::post('/settings/workflow', [App\Http\Controllers\Api\Admin\AdminSettingController::class, 'updateWorkflow']);
        
        // Templates
        Route::apiResource('templates', App\Http\Controllers\Api\Admin\AdminTemplateController::class);
        
        // Logs
        Route::get('/logs', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'index']);
        
        // Audit Log
        Route::get('/audit-log/dashboard-data', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'dashboardData']);
        Route::get('/audit-log', [App\Http\Controllers\Api\Admin\AdminAuditLogController::class, 'index']);
        
        // Users
        Route::get('/users/dashboard-data', [App\Http\Controllers\Api\Admin\AdminUserController::class, 'dashboardData']);
        Route::apiResource('users', App\Http\Controllers\Api\Admin\AdminUserController::class);

        // Notifications
        Route::get('/notifications/dashboard-data', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'dashboardData']);
        Route::get('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'escalations']);
        Route::post('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'updateRule']);
        Route::post('/notifications/preferences', [App\Http\Controllers\Api\Admin\AdminNotificationSettingsController::class, 'update']);
        Route::get('/notifications', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'markAllAsRead']);
        
        // Import Center
        Route::get('/import-center/dashboard-data', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'dashboardData']);
        Route::post('/import-center/upload', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'upload']);
        Route::post('/import-center/process/{id}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'process']);
        
        // FIFA Import
        Route::prefix('fifa')->group(function () {
            Route::get('/imports', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaImportsIndex']);
            Route::get('/imports/{id}', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaImportDetails']);
            Route::get('/import-dashboard-data', [App\Http\Controllers\Api\Admin\AdminImportCenterController::class, 'fifaDashboardData']);
        });

        // Parcel Research
        Route::get('/parcel/dashboard-data', [App\Http\Controllers\Api\Admin\AdminParcelResearchController::class, 'dashboardData']);

        // Fixes for missing dashboard data routes
        Route::get('/fifa/processing-dashboard-data', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'processingDashboardData']);
        
        // Sheriff
        Route::get('/sheriff/dashboard-data', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'dashboardData']);
        Route::get('/sheriff/properties', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'properties']);
        
        // Redemption
        Route::get('/redemption/dashboard-data', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'dashboardData']);
        Route::get('/redemption/{id}/payoff-letter', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'generatePayoffLetter']);
        Route::post('/redemption/{id}/redeem', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'redeem']);
        
        // Barment
        Route::get('/barment/dashboard-data', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'dashboardData']);
        Route::get('/barment/{id}', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'show']);
        
        // Quiet Title
        Route::get('/quiet-title/dashboard-data', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'dashboardData']);
        
        // REO
        Route::get('/reo/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'dashboardData']);
        Route::get('/reo/all-properties', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'allProperties']);
        Route::get('/reo/lease/dashboard-data', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'dashboardData']);
        
        // Auction
        Route::get('/auction/dashboard-data', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'dashboardData']);
        Route::get('/auction/available-properties', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'availableProperties']);

        
        // Workflow Hub Routes
        Route::get('/workflow/auction', [App\Http\Controllers\Api\Admin\AdminAuctionController::class, 'dashboardData']);
        Route::get('/workflow/fifa', [App\Http\Controllers\Api\Admin\AdminFIFAController::class, 'dashboardData']);
        Route::get('/workflow/redemption', [App\Http\Controllers\Api\Admin\AdminRedemptionController::class, 'dashboardData']);
        
        // Surplus Funds
        Route::post('/workflow/surplus/generate-letters', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'generateLetters']);
        Route::get('/workflow/surplus/{id}/letter', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'viewLetter']);
        Route::post('/workflow/surplus/import', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'import']);
        Route::get('/workflow/surplus/export', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'export']);
        Route::post('/workflow/surplus/{id}/recipient', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'updateRecipient']);
        Route::post('/workflow/surplus/{id}/contact', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'logContact']);
        Route::get('/workflow/surplus', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'dashboardData']);
        Route::post('/workflow/surplus', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'store']);
        Route::put('/workflow/surplus/{id}', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'update']);
        Route::post('/workflow/surplus/{id}/claim', [App\Http\Controllers\Api\Admin\AdminSurplusFundController::class, 'claim']);
        
        // Barment
        Route::get('/workflow/barment', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'dashboardData']);
        Route::post('/workflow/barment/generate-letters', [App\Http\Controllers\Api\Admin\AdminBarmentController::class, 'generateLetters']);
        
        // Quiet Title
        Route::get('/workflow/quiet-title', [App\Http\Controllers\Api\Admin\AdminQuietTitleController::class, 'dashboardData']);
        
        // REO
        Route::get('/workflow/reo', [App\Http\Controllers\Api\Admin\AdminReoController::class, 'dashboardData']);
        Route::get('/workflow/reo/leases', [App\Http\Controllers\Api\Admin\AdminReoLeaseController::class, 'index']);
        
        // Sheriff Sale
        Route::get('/workflow/sheriff', [App\Http\Controllers\Api\Admin\AdminSheriffController::class, 'dashboardData']);
        
        // Tax Appeal
        Route::get('/workflow/tax-appeal', [App\Http\Controllers\Api\Admin\AdminTaxAppealController::class, 'dashboardData']);
        
        // Deadlines
        Route::get('/deadlines/dashboard-data', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'dashboardData']);
        Route::get('/deadlines/export', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'export']);
        Route::get('/deadlines', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'index']);
        Route::post('/deadlines', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'store']);
        Route::put('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'update']);
        Route::delete('/deadlines/{id}', [App\Http\Controllers\Api\Admin\AdminDeadlineController::class, 'destroy']);
        
        // Tasks
        Route::get('/tasks', [App\Http\Controllers\Api\Admin\AdminTaskController::class, 'index']);

        // Notifications
        Route::get('/notifications/dashboard-data', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'dashboardData']);
        Route::get('/notifications', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'index']);
        Route::post('/notifications/send', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'send']);
        Route::post('/notifications/read-all', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'markAllAsRead']);
        Route::get('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'escalations']);
        Route::post('/notifications/escalations', [App\Http\Controllers\Api\Admin\AdminNotificationController::class, 'updateRule']);
        Route::post('/notifications/preferences', [App\Http\Controllers\Api\Admin\AdminNotificationSettingsController::class, 'update']);

        // Location Configuration Routes
        Route::get('/locations/dashboard-data', [App\Http\Controllers\Api\Admin\AdminLocationController::class, 'dashboardData']);
        Route::apiResource('locations', App\Http\Controllers\Api\Admin\AdminLocationController::class);

        // System Logs
        Route::get('/logs', [App\Http\Controllers\Api\Admin\AdminLogsController::class, 'index']);

        // Time Tracking
        Route::get('/time-tracking/dashboard-data', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'dashboardData']);
        Route::get('/time-tracking/users-dropdown', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'listUsersDropdown']);
        Route::post('/time-tracking/entries', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'store']);
        Route::post('/time-tracking/entries/{id}/approve', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'approve']);
        Route::post('/time-tracking/entries/{id}/reject', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'reject']);
        Route::get('/time-tracking/export', [App\Http\Controllers\Api\Admin\AdminTimeTrackingController::class, 'export']);
        
    });
    
    // Investor Routes
    Route::prefix('investor')->group(function () {
        Route::get('/dashboard-data', [App\Http\Controllers\Api\Investor\InvestorDashboardController::class, 'dashboardData']);
        Route::get('/notifications', [App\Http\Controllers\Api\Investor\NotificationController::class, 'index']);
        
        // Properties
        Route::get('/properties', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'list']);
        Route::get('/properties/{id}', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'show']);
        Route::get('/properties/{id}/dashboard-data', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'detailDashboardData']);
        Route::get('/properties/{id}/payoff-letter', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'generatePayoffLetter']);
        Route::post('/properties/{id}/invest', [App\Http\Controllers\Api\Investor\InvestorPropertyController::class, 'invest']);

        Route::get('/funds', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'index']);
        Route::get('/funds/{id}', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'show']);
        Route::post('/funds/{id}/invest', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'invest']);
        Route::get('/my-investments', [App\Http\Controllers\Api\Investor\InvestorFundController::class, 'myInvestments']);
        Route::get('/documents', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'index']);
        Route::get('/documents/{id}/download', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'download']);
        Route::post('/documents/report', [App\Http\Controllers\Api\Investor\InvestorDocumentController::class, 'generateReport']);

        // Transactions - Moved outside ShareMarketplace to be general
        Route::get('/transactions', [App\Http\Controllers\Api\Investor\InvestorTransactionController::class, 'list']);
        Route::get('/transactions/summary', [App\Http\Controllers\Api\Investor\InvestorTransactionController::class, 'summary']);
        Route::post('/transactions/deposit', [App\Http\Controllers\Api\Investor\InvestorTransactionController::class, 'deposit']);

        // Share Marketplace
        Route::get('/shares/stats', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'stats']);
        Route::get('/shares/available', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'available']);
        Route::post('/shares/list', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'list']);
        Route::post('/shares/buy/{id}', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'buy']);
        Route::post('/shares/cancel/{id}', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'cancel']);
        Route::get('/shares/my-listings', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'myListings']);
        Route::get('/shares/portfolio', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'portfolio']);
        Route::get('/shares/transactions', [App\Http\Controllers\Api\Investor\ShareMarketplaceController::class, 'transactions']);

        // Settings
        Route::get('/settings/profile', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'getProfile']);
        Route::put('/settings/profile', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'updateProfile']);
        Route::post('/settings/photo', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'uploadPhoto']);
        Route::delete('/settings/photo', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'deletePhoto']);
        Route::put('/settings/password', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'changePassword']);
        Route::delete('/settings/account', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'deleteAccount']);
        Route::get('/settings/notifications', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'getNotifications']);
        
        // Bank Accounts
        Route::get('/settings/bank-accounts', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'getBankAccounts']);
        Route::post('/settings/bank-accounts', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'addBankAccount']);
        Route::delete('/settings/bank-accounts/{id}', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'deleteBankAccount']);
        Route::put('/settings/bank-accounts/{id}', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'updateBankAccount']);
        Route::post('/settings/bank-accounts/{id}/verify', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'verifyBankAccount']);
        Route::put('/settings/notifications', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'updateNotifications']);
        
        // Privacy
        Route::get('/settings/privacy', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'getPrivacy']);
        Route::put('/settings/privacy', [App\Http\Controllers\Api\Investor\InvestorSettingsController::class, 'updatePrivacy']);
    });
});

