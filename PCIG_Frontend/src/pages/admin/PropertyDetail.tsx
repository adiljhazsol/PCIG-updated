import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Share2,
    ArrowLeft,
    Edit,
    MoreVertical,
    AlertCircle,
    Clock,
    CheckCircle2,
    Download,
    Upload,
    FileText,
    File,
    Gavel,
    Mail,
    RefreshCw,
    DollarSign,
    Calendar,
    ExternalLink,
    Printer,
    FileBarChart,
    Key,
    Loader2,
    Building2
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';

// Property Detail Screen - Desktop View Implementation

export default function PropertyDetail() {
    const { id } = useParams();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();
    
    // State for dynamic data
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use provided ID or fallback to a default if testing without routing ID
                // For production, we should handle the 'undefined' id case gracefully or redirect
                const targetId = id || "1"; // Defaulting to 1 for testing if no ID in URL
                
                const response = await api.get(`/admin/properties/${targetId}/detail-dashboard`);
                setData(response.data.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching property detail:', err);
                setError('Failed to load property details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        address: '',
        status: '',
        workflow_stage: ''
    });
    const [isPayoffLetterModalOpen, setIsPayoffLetterModalOpen] = useState(false);
    const [isProcessPayoffModalOpen, setIsProcessPayoffModalOpen] = useState(false);
    const [processPayoffData, setProcessPayoffData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Initialize countdown from data
    useEffect(() => {
        if (data?.redemptionEngine?.countdown) {
            setCountdown({
                ...data.redemptionEngine.countdown,
                seconds: 0
            });
        }
    }, [data]);

    // Live countdown effect
    useEffect(() => {
        if (!data?.redemptionEngine?.deadlineIso) {
             setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
             return;
        }

        const interval = setInterval(() => {
            const deadline = new Date(data.redemptionEngine.deadlineIso).getTime();
            const now = new Date().getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [data?.redemptionEngine?.deadlineIso]);

    const handleGeneratePayoffLetter = () => {
        setIsPayoffLetterModalOpen(true);
    };

    const handleDownloadPayoffLetter = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (downloading) return;

        try {
            setDownloading(true);
            const targetId = (id || "1").replace('PROP-', '');
            const response = await api.get(`/admin/redemption/${targetId}/payoff-letter`, {
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
        // Pre-fill amount if available
        if (data?.redemptionEngine?.estimatedPayoff) {
            const amount = data.redemptionEngine.estimatedPayoff.replace(/[^0-9.]/g, '');
            setProcessPayoffData(prev => ({ ...prev, amount }));
        }
        setIsProcessPayoffModalOpen(true);
    };

    const handleProcessPayoffSubmit = async () => {
        try {
            const targetId = id?.replace('PROP-', '') || '';
            await api.post(`/admin/redemption/${targetId}/redeem`, {
                redemption_amount: parseFloat(processPayoffData.amount),
                redeemed_at: processPayoffData.date
            });
            setIsProcessPayoffModalOpen(false);
            alert('Redemption processed successfully');
            // Refresh data
            const response = await api.get(`/admin/properties/${targetId}/detail-dashboard`);
            setData(response.data.data);
        } catch (err) {
            console.error('Failed to process payoff', err);
            alert('Failed to process payoff. Please try again.');
        }
    };

    // Update edit form data when data loads
    useEffect(() => {
        if (data) {
            setEditFormData({
                address: data.header.address,
                status: data.header.status,
                workflow_stage: data.header.status // simplified mapping
            });
        }
    }, [data]);

    const handleEditSubmit = async () => {
        try {
            // Optimistic update
            const updatedData = { ...data };
            updatedData.header.address = editFormData.address;
            updatedData.header.status = editFormData.status;
            setData(updatedData);
            
            // Clean ID for API call
            const targetId = id?.replace('PROP-', '') || '';

            // API call
            await api.put(`/admin/properties/${targetId}`, {
                address: editFormData.address,
                status: editFormData.status.toLowerCase(),
                // Map status to workflow stage for now if needed, or keep separate
                workflow_stage: editFormData.status.toLowerCase().replace(' ', '_')
            });
            
            setIsEditModalOpen(false);
        } catch (err) {
            console.error('Failed to update property', err);
            // Revert would go here
        }
    };

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

    const header = data?.header || { address: '', details: '', status: '', type: '' };
    const alerts = data?.alerts || [];
    const redemptionEngine = data?.redemptionEngine; // Optional, handled in render
    const workflowTimeline = data?.workflowTimeline || { steps: [] };
    const moduleConnections = data?.moduleConnections || [];
    const documents = data?.documents || [];
    const activityLog = data?.activityLog || [];
    const propertyInfo = data?.propertyInfo || [];

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
            <AdminNav />

            {/* Main Content */}
            <div style={{
                padding: isMobile ? '16px' : '24px 40px',
                maxWidth: 1600,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginBottom: 16,
                        padding: 0
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

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
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied to clipboard!');
                            }}
                            style={{ flex: isMobile ? '1 1 auto' : 'unset', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <Share2 size={16} /> Share
                        </button>
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            style={{ flex: isMobile ? '1 1 auto' : 'unset', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <Edit size={16} /> Edit
                        </button>
                        <button style={{ padding: '8px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', cursor: 'pointer', flex: isMobile ? '0 0 auto' : 'unset' }}>
                            <MoreVertical size={16} />
                        </button>
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
                            <button 
                                onClick={() => {
                                    if (alert.type === 'critical') {
                                        navigate('/admin/properties/redemption-tracking');
                                    } else {
                                        navigate('/admin/properties/workflow-hub');
                                    }
                                }}
                                style={{ border: 'none', background: 'none', color: 'inherit', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: isMobile ? '4px 0 0 30px' : 0 }}
                            >
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
                                        {data?.redemptionEngine?.deadlineIso ? (
                                            `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} mins, ${countdown.seconds} s`
                                        ) : (
                                            <span style={{ fontSize: 24, color: '#64748B' }}>No Deadline Set</span>
                                        )}
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
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{redemptionEngine.expenses}</div>
                                        <div onClick={() => setIsBreakdownModalOpen(true)} style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, marginTop: 4, cursor: 'pointer' }}>View Breakdown</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Estimated Payoff Today</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>{redemptionEngine.estimatedPayoff}</div>
                                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Daily Accrual <span style={{ fontWeight: 600, color: '#0F172A' }}>{redemptionEngine.dailyAccrual.amount}</span> {redemptionEngine.dailyAccrual.per}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
                                    <button 
                                        onClick={handleGeneratePayoffLetter}
                                        style={{ flex: 1, padding: '12px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: '#fff', color: '#0F172A', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    >
                                        <FileText size={16} /> Generate Payoff Letter
                                    </button>
                                    <button 
                                        onClick={handleProcessPayoff}
                                        style={{ flex: 1, backgroundColor: '#0F172A', color: '#fff', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                                    >
                                        Process Payoff
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Timeline */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box', width: '100%' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Workflow Timeline</h3>
                                <button onClick={() => navigate('/admin/administration/audit-log')} style={{ border: 'none', background: 'none', color: '#1E3A5F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View Full Timeline</button>
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
                                                    color: isActive || isCompleted ? '#0F172A' : '#94A3B8',
                                                    marginTop: 4
                                                }}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Module Connections */}
                        {moduleConnections && (
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Module Connections</h3>
                                <button onClick={() => navigate('/admin/properties/workflow-hub')} style={{ border: 'none', background: 'none', color: '#1E3A5F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Manage</button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {moduleConnections.map((module: any, idx: number) => {
                                        const styles = getModuleBadgeColor(module.color);
                                        return (
                                            <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 6,
                                                    backgroundColor: styles.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: styles.text
                                                }}>
                                                    {getIcon(module.icon)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{module.name}</div>
                                                    <div style={{ fontSize: 12, color: styles.text }}>{module.status}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        )}

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '100%', minWidth: 0 }}>

                        {/* Property Info Card */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Property Details</h3>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {propertyInfo.details.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{item.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '24px 0' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {propertyInfo.financials.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{item.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Documents Card */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Documents</h3>
                                <button onClick={() => navigate(`/admin/properties/${id || '1'}/documents`)} style={{ border: 'none', background: 'none', color: '#1E3A5F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View All</button>
                            </div>
                            <div style={{ padding: '0 24px' }}>
                                {documents.map((doc: any, idx: number) => (
                                    <div key={idx} style={{ padding: '16px 0', borderBottom: idx !== documents.length - 1 ? '1px solid #E2E8F0' : 'none', display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <FileText size={20} color="#64748B" />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                                            <div style={{ fontSize: 11, color: '#64748B' }}>{doc.date} • {doc.size}</div>
                                        </div>
                                        <Download size={16} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => alert('Download started...')} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Activity Log</h3>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ position: 'absolute', top: 8, bottom: 8, left: 7, width: 2, backgroundColor: '#E2E8F0' }} />
                                    {activityLog.map((log: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', border: '2px solid #CBD5E1', flexShrink: 0, zIndex: 1 }} />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 2 }}>{log.action}</div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>{log.user} • {log.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Modals */}
                
                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 500, margin: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Property</h3>
                                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <AlertCircle size={20} color="#64748B" style={{ transform: 'rotate(45deg)' }} /> {/* Using AlertCircle as close icon if X not imported, or replace with X */}
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Address</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.address}
                                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Status</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6 }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="archived">Archived</option>
                                        {/* Add specific workflow stages if needed */}
                                        <option value="research">Research</option>
                                        <option value="redemption">Redemption</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 600 }}>Cancel</button>
                                    <button onClick={handleEditSubmit} style={{ flex: 1, padding: 10, borderRadius: 6, background: '#0F172A', color: '#fff', border: 'none', fontWeight: 600 }}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payoff Letter Modal */}
                {isPayoffLetterModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 0, width: '100%', maxWidth: 800, height: '90vh', margin: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Payoff Letter Preview</h3>
                                <button onClick={() => setIsPayoffLetterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 40, backgroundColor: '#f8fafc' }}>
                                <div id="payoff-letter-content" style={{ backgroundColor: '#fff', padding: 48, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: 700, margin: '0 auto', minHeight: 800 }}>
                                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>OFFICIAL PAYOFF STATEMENT</h1>
                                        <p style={{ color: '#64748B' }}>Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ marginBottom: 40 }}>
                                        <p><strong>Property Address:</strong> {data?.header?.address}</p>
                                        <p><strong>Parcel ID:</strong> {data?.header?.details ? data.header.details.replace('Detail Overview • ', '') : 'N/A'}</p>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 40 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #0F172A' }}>
                                                <th style={{ textAlign: 'left', padding: 12 }}>Description</th>
                                                <th style={{ textAlign: 'right', padding: 12 }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: 12 }}>Principal Bid Amount</td>
                                                <td style={{ textAlign: 'right', padding: 12 }}>{redemptionEngine?.bidPrice}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: 12 }}>Accrued Interest (12%)</td>
                                                <td style={{ textAlign: 'right', padding: 12 }}>{redemptionEngine?.accruedInterest}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: 12 }}>Legal & Administrative Expenses</td>
                                                <td style={{ textAlign: 'right', padding: 12 }}>{redemptionEngine?.expenses}</td>
                                            </tr>
                                            <tr style={{ fontWeight: 700, backgroundColor: '#F1F5F9' }}>
                                                <td style={{ padding: 12 }}>TOTAL PAYOFF AMOUNT</td>
                                                <td style={{ textAlign: 'right', padding: 12 }}>{redemptionEngine?.estimatedPayoff}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div style={{ marginBottom: 40 }}>
                                        <p style={{ marginBottom: 16 }}><strong>Payment Instructions:</strong></p>
                                        <p>Please make cashier's check or money order payable to:</p>
                                        <p style={{ marginLeft: 20, marginTop: 8 }}>
                                            PCIG Holdings, LLC<br/>
                                            123 Investment Way, Suite 100<br/>
                                            Atlanta, GA 30303
                                        </p>
                                    </div>
                                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 24, fontSize: 12, color: '#64748B', textAlign: 'center' }}>
                                        <p>This payoff statement is valid for 10 days from the date of issuance. Daily accrual rate applies thereafter.</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: 16, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setIsPayoffLetterModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 600 }}>Cancel</button>
                                <button 
                                    onClick={handleDownloadPayoffLetter} 
                                    disabled={downloading}
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: 6, 
                                        background: downloading ? '#94A3B8' : '#0F172A', 
                                        color: '#fff', 
                                        border: 'none', 
                                        fontWeight: 600, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 8,
                                        cursor: downloading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <Printer size={16} /> {downloading ? 'Downloading...' : 'Print / Download PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Process Payoff Modal */}
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
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Redemption Amount</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 12, top: 10, color: '#64748B' }}>$</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={processPayoffData.amount}
                                            onChange={(e) => setProcessPayoffData({...processPayoffData, amount: e.target.value})}
                                            style={{ width: '100%', padding: '8px 12px 8px 24px', border: '1px solid #E2E8F0', borderRadius: 6, boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Redemption Date</label>
                                    <input 
                                        type="date" 
                                        value={processPayoffData.date}
                                        onChange={(e) => setProcessPayoffData({...processPayoffData, date: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 6, padding: 12, fontSize: 13, color: '#9A3412' }}>
                                    Warning: This will mark the property as redeemed and close the redemption period.
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    <button onClick={() => setIsProcessPayoffModalOpen(false)} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontWeight: 600 }}>Cancel</button>
                                    <button onClick={handleProcessPayoffSubmit} style={{ flex: 1, padding: 10, borderRadius: 6, background: '#10B981', color: '#fff', border: 'none', fontWeight: 600 }}>Confirm Redemption</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Breakdown Modal */}
                {isBreakdownModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 400, margin: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Expense Breakdown</h3>
                                <button onClick={() => setIsBreakdownModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {redemptionEngine?.breakdown && redemptionEngine.breakdown.length > 0 ? (
                                    redemptionEngine.breakdown.map((item: any, idx: number) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                                            <span style={{ color: '#64748B' }}>{item.description} <span style={{fontSize: 11, color: '#94A3B8'}}>({item.date})</span></span>
                                            <span style={{ fontWeight: 600 }}>{item.amount}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 20, color: '#64748B' }}>No expenses recorded</div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, fontWeight: 700, fontSize: 16 }}>
                                    <span>Total Expenses</span>
                                    <span>{redemptionEngine?.expenses}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}