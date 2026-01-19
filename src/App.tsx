import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import InvestorDashboard from './pages/investor/investor_dashboard';
import InvestorsMarketplace from './pages/investor/investors_marketplace';
import FundsMarketplace from './pages/investor/funds_marketplace';
import ShareMarketplace from './pages/investor/ShareMarketplace';
import InvestorsTransactions from './pages/investor/investors_transactions';
import InvestorsDocuments from './pages/investor/investors_documents';
import InvestorsSettings from './pages/investor/investors_settings';
import KYCVerification from './pages/investor/kyc_verification';
import InvestorPropertyDetail from './pages/investor/InvestorPropertyDetail';
import InvestorFundDetail from './pages/investor/InvestorFundDetail';
import AdminDashboard from './pages/admin/Dashboard';
import PropertiesWorkflowHub from './pages/admin/PropertiesWorkflow';
import InvestorsManagement from './pages/admin/InvestorsManagement';
import REODisposition from './pages/admin/REODisposition';
import Payments from './pages/admin/Payments';
import AssetTransactions from './pages/admin/AssetTransactions';
import FundAdmin from './pages/admin/FundAdmin';
import CreateFund from './pages/admin/CreateFund';
import AddProperty from './pages/admin/AddProperty';
import REOLeased from './pages/admin/REOLeased';
import InviteInvestor from './pages/admin/InviteInvestor';
import CreateTransaction from './pages/admin/CreateTransaction';
import SurplusFundsResearch from './pages/admin/SurplusFundsResearch';
import RequestPropertyPayoff from './pages/admin/RequestPropertyPayoff';
import LawyerPayoffPortal from './pages/admin/LawyerPayoffPortal';
import PayoffRequestQueue from './pages/admin/PayoffRequestQueue';
import ReportsCenter from './pages/admin/ReportsCenter';
import ImportCenter from './pages/admin/ImportCenter';
import AuditLog from './pages/admin/AuditLog';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import UserManagementAdmin from './pages/admin/UserManagementAdmin';
import CalendarDeadlineEngine from './pages/admin/CalendarDeadlineEngine';
import NotificationsEscalationSystem from './pages/admin/NotificationsEscalationSystem';
import CityCountyStateConfig from './pages/admin/CityCountyStateConfig';
import PropertyTaxAppeal from './pages/admin/PropertyTaxAppeal';
import ExpenseInputShareAllocation from './pages/admin/ExpenseInputShareAllocation';
import TimeTrackingWorkerHours from './pages/admin/TimeTrackingWorkerHours';
import NoticeLetters from './pages/admin/NoticeLetters';
import EFileCancellations from './pages/admin/EFileCancellations';
import FIFAImport from './pages/admin/FIFAImport';
import FIFAProcessing from './pages/admin/FIFAProcessing';
import SheriffWorkflow from './pages/admin/SheriffWorkflow';
import RedemptionTracking from './pages/admin/RedemptionTracking';
import Barment from './pages/admin/Barment';
import QuietTitle from './pages/admin/QuietTitle';
import Auction from './pages/admin/Auction';
import DepreciationTaxAllocation from './pages/admin/DepreciationTaxAllocation';
import InterestCalculation from './pages/admin/InterestCalculation';
import K1Generation from './pages/admin/K1Generation';
import LightweightLedger from './pages/admin/LightweightLedger';
import PropertyDetail from './pages/admin/PropertyDetail';
import PropertyDocuments from './pages/admin/PropertyDocuments';
import ParcelResearch from './pages/admin/ParcelResearch';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/admin-login" element={<AdminLogin />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Investor Routes */}
        <Route path="/investor/dashboard" element={<InvestorDashboard />} />
        <Route path="/investor/properties" element={<InvestorsMarketplace />} />
        <Route path="/investor/funds" element={<FundsMarketplace />} />
        <Route path="/investor/share-marketplace" element={<ShareMarketplace />} />
        <Route path="/investor/transactions" element={<InvestorsTransactions />} />
        <Route path="/investor/documents" element={<InvestorsDocuments />} />
        <Route path="/investor/settings" element={<InvestorsSettings />} />
        <Route path="/investor/kyc-verification" element={<KYCVerification />} />
        <Route path="/investor/properties/:id" element={<InvestorPropertyDetail />} />
        <Route path="/investor/funds/:id" element={<InvestorFundDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/properties" element={<PropertiesWorkflowHub />} />
        <Route path="/admin/investors" element={<InvestorsManagement />} />
        <Route path="/admin/investors/management" element={<InvestorsManagement />} />
        <Route path="/admin/properties/reo-disposition" element={<REODisposition />} />
        <Route path="/admin/properties/fifa-import" element={<FIFAImport />} />
        <Route path="/admin/properties/fifa-processing" element={<FIFAProcessing />} />
        <Route path="/admin/properties/sheriff-workflow" element={<SheriffWorkflow />} />
        <Route path="/admin/properties/redemption-tracking" element={<RedemptionTracking />} />
        <Route path="/admin/properties/barment" element={<Barment />} />
        <Route path="/admin/properties/quiet-title" element={<QuietTitle />} />
        <Route path="/admin/properties/auction" element={<Auction />} />
        <Route path="/admin/properties/parcel-research" element={<ParcelResearch />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/payments/k1-generation" element={<K1Generation />} />
        <Route path="/admin/payments/lightweight-ledger" element={<LightweightLedger />} />
        <Route path="/admin/payments/interest-calculation" element={<InterestCalculation />} />
        <Route path="/admin/payments/depreciation-tax-allocation" element={<DepreciationTaxAllocation />} />
        <Route path="/admin/asset-transactions" element={<AssetTransactions />} />
        <Route path="/admin/asset-transactions/create" element={<CreateTransaction />} />
        <Route path="/admin/investors/fund-admin" element={<FundAdmin />} />
        <Route path="/admin/funds/create" element={<CreateFund />} />
        <Route path="/admin/properties/add" element={<AddProperty />} />
        <Route path="/admin/invite-investor" element={<InviteInvestor />} />
        <Route path="/admin/reo-leased" element={<REOLeased />} />
        <Route path="/admin/operations/surplus-funds-research" element={<SurplusFundsResearch />} />
        <Route path="/admin/operations/property-tax-appeal" element={<PropertyTaxAppeal />} />
        <Route path="/admin/operations/expense-input-allocation" element={<ExpenseInputShareAllocation />} />
        <Route path="/admin/operations/time-tracking" element={<TimeTrackingWorkerHours />} />
        <Route path="/admin/operations/notice-letters" element={<NoticeLetters />} />
        <Route path="/admin/operations/efile-cancellations" element={<EFileCancellations />} />
        <Route path="/admin/payoffs/owner-portal" element={<RequestPropertyPayoff />} />
        <Route path="/admin/payoffs/lawyer-portal" element={<LawyerPayoffPortal />} />
        <Route path="/admin/payoffs/queue" element={<PayoffRequestQueue />} />
        <Route path="/admin/administration/reports-center" element={<ReportsCenter />} />
        <Route path="/admin/administration/import-center" element={<ImportCenter />} />
        <Route path="/admin/administration/audit-log" element={<AuditLog />} />
        <Route path="/admin/administration/settings" element={<SettingsAdmin />} />
        <Route path="/admin/administration/user-management" element={<UserManagementAdmin />} />
        <Route path="/admin/administration/calendar-deadline" element={<CalendarDeadlineEngine />} />
        <Route path="/admin/administration/notifications-escalation" element={<NotificationsEscalationSystem />} />
        <Route path="/admin/administration/county-state-config" element={<CityCountyStateConfig />} />

        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
        <Route path="/admin/properties/:id" element={<PropertyDetail />} />
        <Route path="/admin/properties/:id/documents" element={<PropertyDocuments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
