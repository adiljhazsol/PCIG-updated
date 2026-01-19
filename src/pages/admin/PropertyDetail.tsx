import { Link, useNavigate } from 'react-router-dom';
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
    Key
} from 'lucide-react';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Property Detail Screen - Desktop View Implementation

export default function PropertyDetail() {
    // const { id } = useParams();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    // In a real app, this would check if the ID exists in the data
    // For this mock, we'll default to the one we populated if the ID doesn't match.
    // This ensures the user always sees the design even with different IDs from the table.
    const propertyId = "PCIG-2024-001";
    // const requestedId = id || "PCIG-2024-001";
    // const data = (adminData as any).propertyDetail[requestedId] || (adminData as any).propertyDetail[propertyId];
    const data = (adminData as any).propertyDetail[propertyId];

    if (!data) return <div>Property not found</div>;

    const {
        header,
        alerts,
        redemptionEngine,
        workflowTimeline,
        // assetTransactions,
        moduleConnections,
        documents,
        activityLog,
        propertyInfo
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
                        <button style={{ flex: isMobile ? '1 1 auto' : 'unset', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}>
                            <Share2 size={16} /> Share
                        </button>
                        <button style={{ flex: isMobile ? '1 1 auto' : 'unset', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', fontWeight: 600, cursor: 'pointer' }}>
                            <Edit size={16} /> Edit
                        </button>
                        <button style={{ padding: '8px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#0F172A', cursor: 'pointer', flex: isMobile ? '0 0 auto' : 'unset' }}>
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </div>

                {/* Alerts */}
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
                                        {redemptionEngine.countdown.days} days, {redemptionEngine.countdown.hours} hours, {redemptionEngine.countdown.minutes} mins
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
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{redemptionEngine.dailyAccrual.amount} <span style={{ fontWeight: 400, color: '#64748B' }}>{redemptionEngine.dailyAccrual.per}</span></div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                                    <button onClick={() => navigate('/admin/properties/redemption-tracking')} style={{ backgroundColor: '#1E3A5F', color: '#fff', border: 'none', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                        Generate Payoff Letter
                                    </button>
                                    <button onClick={() => navigate('/admin/properties/redemption-tracking')} style={{ backgroundColor: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', padding: '12px', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                        Process Payoff
                                    </button>
                                </div>
                            </div>
                        </div>

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

                        {/* Asset Transactions */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Asset Transactions</h3>
                            </div>
                            <div style={{ padding: 24 }}>
                                <div style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 6, textAlign: 'center', fontSize: 13, color: '#64748B', marginBottom: 24 }}>
                                    No active transactions found.
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '1fr 1fr 1fr'), gap: 16 }}>
                                    <button onClick={() => navigate('/admin/asset-transactions')} style={{ backgroundColor: '#F0F9FF', border: '1px solid #E0F2FE', padding: '12px', borderRadius: 6, color: '#0369A1', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                        <Download size={16} /> Initiate Buy
                                    </button>
                                    <button onClick={() => navigate('/admin/asset-transactions')} style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', padding: '12px', borderRadius: 6, color: '#15803D', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                        <Upload size={16} /> Initiate Sell
                                    </button>
                                    <button onClick={() => navigate('/admin/asset-transactions')} style={{ backgroundColor: '#FDF4FF', border: '1px solid #FAE8FF', padding: '12px', borderRadius: 6, color: '#A21CAF', fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                        <Key size={16} /> Initiate Lease
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Module Connections */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Module Connections</h3>
                            </div>
                            <div style={{ padding: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '1fr 1fr 1fr'), gap: 16 }}>
                                    {moduleConnections.map((module: any, idx: number) => {
                                        const style = getModuleBadgeColor(module.color);
                                        return (
                                            <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: 6, padding: 12 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{module.label}</div>
                                                <span style={{
                                                    backgroundColor: style.bg,
                                                    color: style.text,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: '2px 8px',
                                                    borderRadius: 4
                                                }}>{module.status}</span>
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
                                <button style={{ backgroundColor: '#1E3A5F', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                    <Upload size={14} /> Upload
                                </button>
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
                                <Link to={`/admin/properties/${propertyId}/documents`} style={{ textDecoration: 'none', width: '100%' }}>
                                    <button style={{ width: '100%', padding: 12, border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', color: '#1E3A5F', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                        View All 14 Folders
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <RefreshCw size={18} color="#64748B" /> Activity Log
                                </h3>
                                <button style={{ border: 'none', background: 'none', color: '#64748B', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>View All</button>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {activityLog.map((log: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: idx === activityLog.length - 1 ? 0 : 20 }}>
                                        <div style={{ paddingTop: 4, color: '#64748B' }}>{getIcon(log.icon)}</div>
                                        <div>
                                            <div style={{ fontSize: 13, color: '#0F172A', marginBottom: 2 }}>{log.action}</div>
                                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{log.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
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
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: isMobile ? 'left' : 'right' }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assigned Staff */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Assigned Staff</h3>
                                <Edit size={14} color="#64748B" style={{ cursor: 'pointer' }} />
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {propertyInfo.assignedStaff.map((staff: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? 4 : 0,
                                        padding: '12px 0',
                                        borderBottom: idx === propertyInfo.assignedStaff.length - 1 ? 'none' : '1px solid #F1F5F9'
                                    }}>
                                        <span style={{ fontSize: 13, color: '#64748B' }}>{staff.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{staff.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Dates */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Key Dates</h3>
                            </div>
                            <div style={{ padding: '16px 24px' }}>
                                {propertyInfo.keyDates.map((date: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? 4 : 0,
                                        padding: '12px 0',
                                        borderBottom: '1px solid #F1F5F9'
                                    }}>
                                        <span style={{ fontSize: 13, color: '#64748B' }}>{date.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: date.highlight ? '#F59E0B' : '#0F172A' }}>{date.value}</span>
                                    </div>
                                ))}
                                <div style={{ paddingTop: 16 }}>
                                    <div style={{ fontSize: 12, color: '#1E3A5F', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <Calendar size={14} /> View Full Calendar
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Valuation */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Valuation</h3>
                            </div>
                            <div style={{ padding: 24 }}>
                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>ESTIMATED ARV</div>
                                    <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A' }}>{propertyInfo.valuation.estimatedArv}</div>
                                    <span style={{ backgroundColor: '#F0FDF4', color: '#15803D', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{propertyInfo.valuation.confidence}</span>
                                </div>

                                {propertyInfo.valuation.metrics.map((metric: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? 4 : 0,
                                        padding: '8px 0'
                                    }}>
                                        <span style={{ fontSize: 13, color: '#64748B' }}>{metric.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{metric.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', width: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Quick Links</h3>
                            </div>
                            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#1E3A5F', fontSize: 13, fontWeight: 600 }}>
                                    <ExternalLink size={16} /> View in Properties Marketplace
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#1E3A5F', fontSize: 13, fontWeight: 600 }}>
                                    <FileBarChart size={16} /> Export Property Report
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#1E3A5F', fontSize: 13, fontWeight: 600 }}>
                                    <Printer size={16} /> Print Summary
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
