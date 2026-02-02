import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Activity,
    Home,
    PieChart,
    Search,
    Download,
    RotateCcw,
    MoreHorizontal,
    Pause,
    Loader2,
    AlertCircle,
    Eye,
    Edit,
    Trash
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping
const iconMap: { [key: string]: any } = {
    TrendingUp,
    Activity,
    Home,
    PieChart
};

export default function InterestCalculation() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    const [activeTab, setActiveTab] = useState('Property Interest');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [showLogs, setShowLogs] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await api.get('/admin/interest/dashboard-data');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching interest data:', err);
            setError('Failed to load interest calculation data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActionMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            await api.post('/admin/interest/calculate');
            await fetchData();
        } catch (err) {
            console.error('Error recalculating interest:', err);
            // Optionally show error toast
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/interest/export', {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `interest_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Error exporting report:', err);
        }
    };

    if (loading) {
        return (
            <div style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                backgroundColor: '#F8FAFC',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}>
                <AdminNav />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    color: '#64748B'
                }}>
                    <Loader2 className="animate-spin" size={48} style={{ marginBottom: 16 }} />
                    <div>Loading interest calculation data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                backgroundColor: '#F8FAFC',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
            }}>
                <AdminNav />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    color: '#EF4444'
                }}>
                    <AlertCircle size={48} style={{ marginBottom: 16 }} />
                    <div style={{ marginBottom: 16, fontSize: 18, fontWeight: 500 }}>{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14,
                            color: '#0F172A'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = data?.stats || [];
    const propertyInterest = data?.propertyInterest || [];
    const fundInterest = data?.fundInterest || [];
    const investorInterest = data?.investorInterest || [];
    const configuration = data?.configuration || {};
    const logs = data?.logs || [];
    const engineStatus = data?.engineStatus || {};

    const toggleRowSelection = (id: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllSelection = () => {
        let currentList = [];
        if (activeTab === 'Property Interest') currentList = propertyInterest;
        else if (activeTab === 'Fund Interest') currentList = fundInterest;
        else if (activeTab === 'Investor Interest') currentList = investorInterest;

        if (selectedRows.size === currentList.length && currentList.length > 0) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(currentList.map((item: any) => item.id)));
        }
    };

    const toggleActionMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (actionMenuOpen === id) {
            setActionMenuOpen(null);
        } else {
            setActionMenuOpen(id);
        }
    };

    const handleAction = async (action: string, id: string) => {
        console.log(`Action: ${action} on item: ${id}`);
        
        if (action === 'view') {
             // Mock view details - just an alert for now or navigation if we had the route
             alert(`Viewing details for Investor ID: ${id}`);
        } else if (action === 'edit') {
            try {
                // Call API to toggle status
                // We need to know which tab we are on, but for now this is only implemented for Investor Interest as per request
                if (activeTab === 'Investor Interest') {
                    await api.post(`/admin/interest/investors/${id}/toggle-status`);
                    // Refresh data
                    fetchData();
                } else {
                     alert(`Edit action for ${activeTab} item ${id} not implemented yet.`);
                }
            } catch (err) {
                console.error('Error updating status:', err);
                alert('Failed to update status');
            }
        }
        
        setActionMenuOpen(null);
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden'
        }}>
            <AdminNav />

            <div style={{
                flex: 1,
                padding: isMobile ? '16px' : isTablet ? '24px' : '32px 48px',
                maxWidth: isMobile ? '100vw' : '1600px',
                width: '100%',
                margin: '0 auto',
                boxSizing: 'border-box',
                overflowX: 'hidden'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 20 : 32 }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>Interest Calculation</h1>
                        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Automated interest tracking and daily accrual engine</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: isMobile ? 12 : 24,
                    marginBottom: isMobile ? 20 : 32,
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}>
                    {stats.map((stat: any, idx: number) => {
                        const Icon = iconMap[stat.icon] || TrendingUp;
                        return (
                            <div key={idx} style={{
                                backgroundColor: '#fff',
                                border: '1px solid #E2E8F0',
                                borderRadius: 8,
                                padding: isMobile ? 16 : 24,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                width: '100%',
                                maxWidth: '100%',
                                boxSizing: 'border-box'
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 12 }}>{stat.label}</div>
                                    <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: stat.color && idx === 0 ? stat.color : '#0F172A', marginBottom: 4 }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>{stat.change || stat.subtext}</div>
                                </div>
                                <Icon size={20} color={stat.color || '#64748B'} />
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div style={{
                    marginBottom: isMobile ? 16 : 24,
                    display: 'flex',
                    gap: isMobile ? 8 : 12,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    paddingBottom: isMobile ? 4 : 0
                }}>
                    {['Property Interest', 'Fund Interest', 'Investor Interest', 'Configuration'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: isMobile ? '6px 12px' : '8px 16px',
                                backgroundColor: activeTab === tab ? '#1E3A5F' : '#fff',
                                border: activeTab === tab ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                                borderRadius: 20,
                                color: activeTab === tab ? '#fff' : '#64748B',
                                fontWeight: 500,
                                fontSize: isMobile ? 13 : 14,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters Row */}
                <div style={{
                    backgroundColor: '#fff',
                    // border: '1px solid #E2E8F0', // Design seems to have filters standalone or seamless? Let's keep consistent with other pages but maybe cleaner. 
                    // Actually design shows filters in a row, not in a box.
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: isMobileOrTablet ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobileOrTablet ? 'stretch' : 'center',
                    gap: isMobile ? 16 : 0
                }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center', flex: 1, width: '100%', maxWidth: '100%' }}>
                        <div style={{ position: 'relative', width: isMobile ? '100%' : 300 }}>
                            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder={isMobile ? "Search..." : "Search parcel ID, address..."}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {!isMobile && (
                            <>
                                <select style={{
                                    padding: '10px 36px 10px 12px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    color: '#0F172A',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center'
                                }}>
                                    <option>Interest Type</option>
                                </select>
                                <select style={{
                                    padding: '10px 36px 10px 12px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    color: '#0F172A',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center'
                                }}>
                                    <option>Date Range</option>
                                </select>
                                <button style={{
                                    padding: '10px 16px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: '#64748B',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}>
                                    Clear
                                </button>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <button 
                            onClick={handleExport}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '10px 16px',
                                backgroundColor: '#fff',
                                border: '1px solid #E2E8F0',
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#0F172A',
                                cursor: 'pointer',
                                flex: isMobile ? 1 : 'initial'
                            }}
                        >
                            <Download size={16} />
                            {!isMobile && "Export Report"}
                        </button>
                        <button 
                            onClick={handleRecalculate}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                padding: '10px 16px',
                                backgroundColor: '#1E3A5F',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#fff',
                                cursor: 'pointer',
                                flex: isMobile ? 1 : 'initial'
                            }}
                        >
                            <RotateCcw size={16} />
                            {isMobile ? "Recalculate" : "Recalculate All"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    {activeTab === 'Configuration' ? (
                        <div style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24 }}>
                                {Object.entries(configuration).map(([key, value]: [string, any]) => (
                                    <div key={key} style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4, textTransform: 'capitalize' }}>
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
                                            {String(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : 'auto' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '16px', width: 40, textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    (activeTab === 'Property Interest' && propertyInterest.length > 0 && selectedRows.size === propertyInterest.length) ||
                                                    (activeTab === 'Fund Interest' && fundInterest.length > 0 && selectedRows.size === fundInterest.length) ||
                                                    (activeTab === 'Investor Interest' && investorInterest.length > 0 && selectedRows.size === investorInterest.length)
                                                }
                                                onChange={toggleAllSelection}
                                                style={{ accentColor: '#1E3A5F', cursor: 'pointer' }}
                                            />
                                        </th>
                                        {activeTab === 'Property Interest' && (
                                            <>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Property</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Interest Type</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Rate</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Principal</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Accrued Interest</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Per-Day</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Start Date</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                            </>
                                        )}
                                        {activeTab === 'Fund Interest' && (
                                            <>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Fund Name</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Fund Code</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Target IRR</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Assets</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Accrued Return (30d)</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                            </>
                                        )}
                                        {activeTab === 'Investor Interest' && (
                                            <>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Investor</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Email</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Role</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Invested Capital</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Accrued Interest</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                            </>
                                        )}
                                        <th style={{ padding: '12px 16px', width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'Property Interest' && propertyInterest.map((item: any) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(item.id)}
                                                    onChange={() => toggleRowSelection(item.id)}
                                                    style={{ accentColor: '#1E3A5F', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.id}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>{item.address}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: item.typeColor,
                                                    backgroundColor: item.typeBg
                                                }}>
                                                    {item.interestType}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{item.rate}</div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>{item.rateType}</div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
                                                {item.principal}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', fontFamily: 'monospace' }}>{item.accruedInterest}</div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>{item.lastUpdate}</div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
                                                {item.perDay}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{item.startDate}</div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>{item.daysElapsed}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: item.status === 'Active' ? '#059669' : item.status === 'Paused' ? '#D97706' : '#64748B',
                                                    backgroundColor: item.status === 'Active' ? '#ECFDF5' : item.status === 'Paused' ? '#FEF3C7' : '#F1F5F9',
                                                    border: `1px solid ${item.status === 'Active' ? '#10B981' : item.status === 'Paused' ? '#F59E0B' : '#E2E8F0'}`,
                                                    gap: 4
                                                }}>
                                                    {item.status === 'Active' && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }}></span>}
                                                    {item.status === 'Paused' && <Pause size={10} fill='#D97706' />}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                                                <button 
                                                    onClick={(e) => toggleActionMenu(item.id, e)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                {actionMenuOpen === item.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 30,
                                                        top: 10,
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                        borderRadius: 6,
                                                        border: '1px solid #E2E8F0',
                                                        zIndex: 10,
                                                        minWidth: 140,
                                                        textAlign: 'left'
                                                    }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAction('view', item.id); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                                                                cursor: 'pointer', fontSize: 13, color: '#0F172A',
                                                                borderBottom: '1px solid #F1F5F9'
                                                            }}
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAction('edit', item.id); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                                                                cursor: 'pointer', fontSize: 13, color: '#0F172A'
                                                            }}
                                                        >
                                                            <Edit size={14} /> Edit Status
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Fund Interest' && fundInterest.map((item: any) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(item.id)}
                                                    onChange={() => toggleRowSelection(item.id)}
                                                    style={{ accentColor: '#1E3A5F', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#64748B' }}>
                                                {item.fundCode}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
                                                {item.targetIrr}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
                                                {item.totalAssets}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', fontFamily: 'monospace' }}>{item.accruedReturn}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: item.status === 'Active' ? '#059669' : '#64748B',
                                                    backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                                                    border: `1px solid ${item.status === 'Active' ? '#10B981' : '#E2E8F0'}`,
                                                    gap: 4
                                                }}>
                                                    {item.status === 'Active' && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }}></span>}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                                                <button 
                                                    onClick={(e) => toggleActionMenu(item.id, e)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                {actionMenuOpen === item.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 30,
                                                        top: 10,
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                        borderRadius: 6,
                                                        border: '1px solid #E2E8F0',
                                                        zIndex: 10,
                                                        minWidth: 140,
                                                        textAlign: 'left'
                                                    }}>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAction('view', item.id); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                                                                cursor: 'pointer', fontSize: 13, color: '#0F172A',
                                                                borderBottom: '1px solid #F1F5F9'
                                                            }}
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAction('edit', item.id); }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 8,
                                                                width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                                                                cursor: 'pointer', fontSize: 13, color: '#0F172A'
                                                            }}
                                                        >
                                                            <Edit size={14} /> Edit Status
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {activeTab === 'Investor Interest' && investorInterest.map((item: any) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(item.id)}
                                                    onChange={() => toggleRowSelection(item.id)}
                                                    style={{ accentColor: '#1E3A5F', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#64748B' }}>
                                                {item.email}
                                            </td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#64748B' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    backgroundColor: '#F1F5F9',
                                                    borderRadius: 4,
                                                    fontSize: 11,
                                                    fontWeight: 500
                                                }}>
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#64748B', fontFamily: 'monospace' }}>
                                                {item.investedCapital}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', fontFamily: 'monospace' }}>{item.accruedInterest}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '4px 10px',
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    color: item.status === 'Active' ? '#059669' : '#64748B',
                                                    backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                                                    border: `1px solid ${item.status === 'Active' ? '#10B981' : '#E2E8F0'}`,
                                                    gap: 4
                                                }}>
                                                    {item.status === 'Active' && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }}></span>}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Engine Status */}
                <div style={{
                    marginTop: 24,
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: isMobile ? 16 : '16px 24px',
                    display: 'flex',
                    flexDirection: isMobileOrTablet ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobileOrTablet ? 'center' : 'center',
                    gap: isMobile ? 16 : 0
                }}>
                    <div style={{ display: 'flex', gap: isMobile ? 16 : 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            backgroundColor: '#ECFDF5',
                            borderRadius: 20,
                            border: '1px solid #A7F3D0'
                        }}>
                            <Activity size={14} color="#059669" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Engine Running</span>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Last Calc Run</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{engineStatus?.lastRun || 'Just now'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Next Run In</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{engineStatus?.nextRun || '00:58'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Calculations Today</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{engineStatus?.calculationsToday || '2,458'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ fontSize: 12, color: '#64748B' }}>Avg Calc Time: 45ms</div>
                        <button 
                            onClick={() => setShowLogs(true)}
                            style={{
                            padding: '8px 16px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            backgroundColor: '#fff',
                            color: '#0F172A',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}>
                            View Logs
                        </button>
                    </div>
                </div>

                {/* Logs Modal */}
                {showLogs && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: 20
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            width: '100%',
                            maxWidth: 600,
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Calculation Logs</h3>
                                <button 
                                    onClick={() => setShowLogs(false)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: '#64748B',
                                        fontSize: 24,
                                        lineHeight: 1
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <div style={{
                                padding: 24,
                                overflowY: 'auto',
                                flex: 1
                            }}>
                                {logs.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: '#64748B', padding: 20 }}>No logs available.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {logs.map((log: any, idx: number) => (
                                            <div key={idx} style={{
                                                padding: 12,
                                                backgroundColor: '#F8FAFC',
                                                borderRadius: 6,
                                                border: '1px solid #E2E8F0',
                                                fontSize: 13
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 600, color: log.status === 'Success' ? '#059669' : log.status === 'Info' ? '#3B82F6' : '#EF4444' }}>
                                                        {log.status} - {log.action}
                                                    </span>
                                                    <span style={{ color: '#64748B' }}>{log.timestamp}</span>
                                                </div>
                                                <div style={{ color: '#0F172A' }}>{log.details}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #E2E8F0',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => setShowLogs(false)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#1E3A5F',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
