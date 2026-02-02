import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Clock,
    CheckCircle2,
    FileText,
    File,
    Gavel,
    Mail,
    RefreshCw,
    DollarSign,
    Loader2
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import InvestorNav from '../../components/investor/InvestorNav';
import InvestModal from '../../components/investor/InvestModal';
import api from '../../services/api';

// Investor Property Detail Screen

export default function InvestorPropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // State for dynamic data
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessPayoffModalOpen, setIsProcessPayoffModalOpen] = useState(false);
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

    const handleInvestClick = () => {
        setIsInvestModalOpen(true);
    };

    const handleGeneratePayoffLetter = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (downloading) return;

        try {
            setDownloading(true);
            const targetId = (id || "1").replace('PROP-', '');
            const response = await api.get(`/investor/properties/${targetId}/payoff-letter`, {
                responseType: 'blob'
            });

            // Verify content type
            const contentType = response.headers['content-type'];
            if (contentType && !contentType.includes('application/pdf')) {
                // Try to read the error message if it's JSON
                if (contentType.includes('application/json')) {
                    const text = await response.data.text();
                    console.error('Backend returned JSON error:', text);
                    try {
                        const json = JSON.parse(text);
                        throw new Error(json.error || json.message || 'Server error');
                    } catch (e) {
                        throw new Error('Server returned error: ' + text);
                    }
                }
                throw new Error('Received invalid content type: ' + contentType);
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payoff_letter_${targetId}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup with delay
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (err: any) {
            console.error('Failed to download payoff letter', err);
            // Alert removed as per user request (false positives occurring despite successful download)
            // alert(`Failed to download payoff letter: ${err.message || err}`);
        } finally {
            setDownloading(false);
        }
    };

    const handleProcessPayoff = () => {
        setIsProcessPayoffModalOpen(true);
    };

    const fetchData = async (background = false) => {
        try {
            if (!background) setLoading(true);
            // Use provided ID or fallback to a default if testing without routing ID
            // For production, we should handle the 'undefined' id case gracefully or redirect
            const targetId = id || "1"; // Defaulting to 1 for testing if no ID in URL
            
            const response = await api.get(`/investor/properties/${targetId}/dashboard-data`);
            setData(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching property detail:', err);
            if (!background) setError('Failed to load property details. Please try again.');
        } finally {
            if (!background) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
                    <p className="text-slate-600 mb-6">{error || 'Property not found'}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const {
        header = {},
        alerts = [],
        redemptionEngine = {},
        workflowTimeline = [],
        // assetTransactions,
        moduleConnections = [],
        documents = { count: 0, folders: [] },
        activityLog = [],
        propertyInfo = {},
        investmentDetails
    } = data;

    const getModuleBadgeColor = (color: string) => {
        switch (color) {
            case 'green': return { bg: '#ECFDF5', text: '#059669' };
            case 'orange': return { bg: '#FFF7ED', text: '#F59E0B' };
            case 'gray': return { bg: '#F1F5F9', text: '#64748B' };
            default: return { bg: '#F1F5F9', text: '#64748B' };
        }
    };

    const getIcon = (iconName: string) => {
        const icons: any = { FileText, File, Gavel, Mail, RefreshCw, DollarSign };
        const Icon = icons[iconName];
        return Icon ? <Icon size={16} /> : null;
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden'
        }}>
            <InvestorNav />

            {/* Main Content */}
            <div style={{
                padding: isMobile ? '16px' : '24px 40px',
                maxWidth: 1600,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'flex-start',
                    marginBottom: 24,
                    gap: isMobile ? 16 : 0,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{header.details}</div>
                        <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{header.address}</h1>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                                backgroundColor: '#FFF7ED',
                                color: '#C2410C',
                                fontSize: 12,
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: 4,
                                textTransform: 'uppercase'
                            }}>
                                {header.status}
                            </span>
                            <span style={{
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                fontSize: 12,
                                fontWeight: 600,
                                padding: '4px 12px',
                                borderRadius: 16
                            }}>
                                {header.type}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Alerts */}
                {alerts && alerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, width: '100%', boxSizing: 'border-box' }}>
                    {alerts.map((alert: any, idx: number) => (
                        <div key={idx} style={{
                            backgroundColor: alert.type === 'critical' ? '#FEF2F2' : '#FFF7ED',
                            border: `1px solid ${alert.type === 'critical' ? '#FEE2E2' : '#FFEDD5'}`,
                            borderRadius: 6,
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            gap: 12,
                            color: alert.type === 'critical' ? '#991B1B' : '#9A3412',
                            fontSize: 14,
                            fontWeight: 500,
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1, wordBreak: 'break-word' }}>{alert.message}</span>
                            </div>
                            <button style={{ border: 'none', background: 'none', color: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: isMobile ? '4px 0 0 30px' : 0 }}>
                                {alert.type === 'critical' ? 'Review Deadline' : 'View Details'}
                            </button>
                        </div>
                    ))}
                </div>
                )}

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, width: '100%', boxSizing: 'border-box' }}>

                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '100%', minWidth: 0 }}>

                        {/* Redemption Engine */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Clock size={18} color="#64748B" /> Redemption Engine
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
                                    <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Live Updates</span>
                                </div>
                            </div>
                            <div style={{ padding: isMobile ? 12 : 24 }}>
                                <div style={{
                                    backgroundColor: '#FFF1F2',
                                    borderRadius: 6,
                                    padding: isMobile ? '16px 8px' : '24px 16px',
                                    textAlign: 'center',
                                    marginBottom: 24,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Time Remaining</div>
                                    <div style={{ fontSize: isMobile ? 18 : 32, fontWeight: 700, color: '#991B1B', wordBreak: 'break-word', lineHeight: 1.2 }}>
                                        {redemptionEngine.countdown?.days ?? 0} days, {redemptionEngine.countdown?.hours ?? 0} hours, {redemptionEngine.countdown?.minutes ?? 0} mins
                                    </div>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: '#FECACA' }}>
                                        <div style={{ width: '35%', height: '100%', backgroundColor: '#DC2626' }} />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: 12, color: '#DC2626', fontWeight: 600, marginBottom: 24 }}>Deadline: {redemptionEngine.deadline}</div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : '24px 48px', marginBottom: 24, padding: isMobile ? '0 8px' : 0 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Bid Price</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{redemptionEngine.bidPrice}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Accrued Interest (12%)</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{redemptionEngine.accruedInterest}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Expenses</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{redemptionEngine.expenses}</div>
                                        <div style={{ fontSize: 11, color: '#64748B', textDecoration: 'underline', cursor: 'pointer' }}>View Breakdown</div>
                                    </div>
                                    <div style={{ backgroundColor: '#F0FDF4', padding: 12, borderRadius: 6, border: '1px solid #DCFCE7' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Estimated Payoff Today</div>
                                        <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: '#10B981', wordBreak: 'break-all' }}>{redemptionEngine.estimatedPayoff}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Daily Accrual</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{redemptionEngine.dailyAccrual?.amount ?? 'N/A'} <span style={{ fontWeight: 400, color: '#64748B' }}>{redemptionEngine.dailyAccrual?.per ?? ''}</span></div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
                                    <button 
                                        onClick={handleGeneratePayoffLetter} 
                                        disabled={downloading}
                                        style={{ 
                                            backgroundColor: downloading ? '#94A3B8' : '#1E3A5F', 
                                            color: '#fff', 
                                            border: 'none', 
                                            padding: '12px', 
                                            borderRadius: 6, 
                                            fontWeight: 600, 
                                            fontSize: 14, 
                                            cursor: downloading ? 'not-allowed' : 'pointer' 
                                        }}
                                    >
                                        {downloading ? 'Generating...' : 'Generate Payoff Letter'}
                                    </button>
                                    <button onClick={handleProcessPayoff} style={{ backgroundColor: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                        Process Payoff
                                    </button>
                                    <button onClick={handleInvestClick} style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                        Invest
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Process Payoff Modal (Investor) */}
                        {isProcessPayoffModalOpen && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                                <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 500, margin: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Process Payoff</h3>
                                        <button onClick={() => setIsProcessPayoffModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <AlertCircle size={20} color="#64748B" style={{ transform: 'rotate(45deg)' }} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <p style={{ color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                                            To process the payoff for this property, please refer to the payment instructions in the Payoff Letter.
                                        </p>
                                        
                                        <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Payment Instructions Summary</h4>
                                            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                                                Make cashier's check or money order payable to:<br/>
                                                <strong>PCIG Holdings, LLC</strong><br/>
                                                123 Investment Way, Suite 100<br/>
                                                Atlanta, GA 30303
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                            <button onClick={() => setIsProcessPayoffModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                                            <button 
                                                onClick={handleGeneratePayoffLetter} 
                                                disabled={downloading}
                                                style={{ 
                                                    flex: 1, 
                                                    padding: 10, 
                                                    borderRadius: 6, 
                                                    background: downloading ? '#94A3B8' : '#0F172A', 
                                                    color: '#fff', 
                                                    border: 'none', 
                                                    fontWeight: 600,
                                                    cursor: downloading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {downloading ? 'Downloading...' : 'Download Payoff Letter'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Workflow Timeline */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box', width: '100%' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Workflow Timeline</h3>
                                <button style={{ border: 'none', background: 'none', color: '#1E3A5F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Full Timeline</button>
                            </div>
                            <div style={{ padding: '32px 24px', overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', minWidth: 500 }}>
                                    {/* Line background */}
                                    <div style={{ position: 'absolute', top: 10, left: 20, right: 20, height: 2, backgroundColor: '#E2E8F0', zIndex: 0 }} />

                                    {workflowTimeline.map((step: any, idx: number) => {
                                        const isCompleted = step.status === 'completed';
                                        const isActive = step.status === 'active';

                                        return (
                                            <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: isCompleted ? '#1E3A5F' : (isActive ? '#fff' : '#F1F5F9'),
                                                    border: isActive ? '5px solid #F59E0B' : (isCompleted ? 'none' : '2px solid #E2E8F0'),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {isCompleted && <CheckCircle2 size={12} color="#fff" />}
                                                </div>
                                                <span style={{
                                                    fontSize: 11,
                                                    fontWeight: isActive || isCompleted ? 600 : 400,
                                                    color: isActive ? '#0F172A' : '#64748B'
                                                }}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileText size={18} color="#64748B" /> Documents <span style={{ fontSize: 13, fontWeight: 400, color: '#94A3B8' }}>{documents.count}</span>
                                </h3>

                            </div>
                            <div style={{ padding: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr'), gap: 16, marginBottom: 16 }}>
                                    {documents.folders.map((folder: any, idx: number) => (
                                        <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
                                            <div style={{ color: '#64748B' }}>{getIcon(folder.icon)}</div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{folder.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>{folder.files}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button style={{ width: '100%', padding: 12, border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#1E3A5F', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                    View All 14 Folders
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '100%', width: '100%', boxSizing: 'border-box', minWidth: 0 }}>

                        {/* Property Information */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Property Information</h3>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {propertyInfo.details.map((item: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? 4 : 0,
                                        padding: '12px 0',
                                        borderBottom: idx === propertyInfo.details.length - 1 ? 'none' : '1px solid #F1F5F9'
                                    }}>
                                        <span style={{ fontSize: 13, color: '#64748B' }}>{item.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', wordBreak: 'break-word', textAlign: isMobile ? 'left' : 'right' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Module Connections */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Module Connections</h3>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {moduleConnections.map((module: any, idx: number) => {
                                    const badgeColor = getModuleBadgeColor(module.color);
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 0',
                                            borderBottom: idx === moduleConnections.length - 1 ? 'none' : '1px solid #F1F5F9'
                                        }}>
                                            <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{module.label}</span>
                                            <span style={{
                                                backgroundColor: badgeColor.bg,
                                                color: badgeColor.text,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                padding: '2px 8px',
                                                borderRadius: 12
                                            }}>
                                                {module.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Activity</h3>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {activityLog.map((log: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: '#F1F5F9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <div style={{ color: '#64748B' }}>{getIcon(log.icon)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>{log.action}</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{log.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {investmentDetails && (
                <InvestModal
                    isOpen={isInvestModalOpen}
                    onClose={() => setIsInvestModalOpen(false)}
                    property={investmentDetails}
                    onSuccess={() => {
                    // Refresh data but do not close modal (InvestModal handles success view)
                    fetchData(true);
                }}
                />
            )}
        </div>
    );
}
