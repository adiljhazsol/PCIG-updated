import { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    AlertCircle,
    CheckCircle2,
    FileText,
    Download,
    Upload,
    Plus,
    Search,
    ChevronDown,
    MoreHorizontal,
    X
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';

// Responsive implementation for Auction Module

export default function Auction() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('auction-ready');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [countyFilter, setCountyFilter] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState('');

    // Modal states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [availableProperties, setAvailableProperties] = useState<any[]>([]);
    const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

    // Form states
    const [newAuction, setNewAuction] = useState({
        property_id: '',
        auction_date: '',
        auction_time: '', // separate time field for UI
        location: '',
        starting_bid: '',
        notes: ''
    });

    const [auctionResult, setAuctionResult] = useState({
        winning_bid: '',
        winner_info: '',
        status: 'completed' // default to completed
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (activeTab) params.append('tab', activeTab);
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            if (countyFilter) params.append('county', countyFilter);
            if (dateRangeFilter) params.append('date_range', dateRangeFilter);

            const response = await api.get(`/admin/auction/dashboard-data?${params.toString()}`);
            if (response.data && response.data.auction) {
                setData(response.data.auction);
            } else {
                setError('Failed to load auction data');
            }
        } catch (err) {
            console.error('Error fetching auction data:', err);
            setError('An error occurred while loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [activeTab, searchQuery, statusFilter, countyFilter, dateRangeFilter]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setCountyFilter('');
        setDateRangeFilter('');
    };

    const fetchAvailableProperties = async () => {
        try {
            const response = await api.get('/admin/auction/available-properties');
            setAvailableProperties(response.data);
        } catch (err) {
            console.error('Error fetching available properties:', err);
        }
    };

    const handleScheduleAuction = async () => {
        try {
            // Combine date and time
            const dateTime = newAuction.auction_time 
                ? `${newAuction.auction_date} ${newAuction.auction_time}`
                : newAuction.auction_date;

            await api.post('/admin/auction/schedule', {
                ...newAuction,
                auction_date: dateTime
            });
            setShowScheduleModal(false);
            setNewAuction({
                property_id: '',
                auction_date: '',
                auction_time: '',
                location: '',
                starting_bid: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            console.error('Error scheduling auction:', err);
            alert('Failed to schedule auction');
        }
    };

    const handleEnterResult = async () => {
        if (!selectedAuctionId) return;
        try {
            await api.post(`/admin/auction/${selectedAuctionId}/complete`, auctionResult);
            setShowResultModal(false);
            setAuctionResult({
                winning_bid: '',
                winner_info: '',
                status: 'completed'
            });
            setSelectedAuctionId(null);
            fetchData();
        } catch (err) {
            console.error('Error completing auction:', err);
            alert('Failed to complete auction');
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (activeTab) params.append('tab', activeTab);
        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter) params.append('status', statusFilter);
        if (countyFilter) params.append('county', countyFilter);
        if (dateRangeFilter) params.append('date_range', dateRangeFilter);

        api.get(`/admin/auction/export?${params.toString()}`, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'auction_calendar.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((err) => {
                console.error('Export failed:', err);
                alert('Export failed');
            });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/admin/auction/import', formData);
            alert('Import successful');
            fetchData();
        } catch (err) {
            console.error('Import failed:', err);
            alert('Import failed');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openResultModal = (auctionId: string) => {
        // auctionId is property ID in the row data, wait.
        // The queue row has 'id' which is property ID. 
        // AdminAuctionController complete method expects auction ID?
        // Let's check AdminAuctionController.php again.
        // public function complete(Request $request, $id) -> Auction::findOrFail($id)
        // The queue row has property id. The backend dashboardData maps property id to row id.
        // But the row data DOES NOT include auction ID explicitly?
        // Let's check dashboardData in AdminAuctionController.
        // 'id' => $prop->id.
        // We need the AUCTION ID to call complete.
        // I need to update AdminAuctionController to include auction_id in the row data.
        
        // Temporarily assuming I fix backend to include auction_id.
        setSelectedAuctionId(auctionId);
        setShowResultModal(true);
    };

    const getIcon = (iconName: string) => {
        const icons: any = { Calendar, AlertCircle, CheckCircle2, FileText, Download, Upload, Plus };
        const Icon = icons[iconName];
        return Icon ? <Icon size={20} /> : null;
    };

    const getStatusBadge = (status: string, color: string) => {
        const colors: any = {
            'green': { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7' },
            'orange': { bg: '#FFF7ED', text: '#F59E0B', border: '#FED7AA' },
            'blue': { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
            'purple': { bg: '#F5F3FF', text: '#7C3AED', border: '#C4B5FD' },
            'gray': { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' }
        };
        const style = colors[color] || colors['gray'];
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.text,
                border: `1px solid ${style.border}`,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-block'
            }}>
                {status}
            </span>
        );
    };

    const getPrepStatusBadge = (status: string, color: string) => {
        const colors: any = {
            'green': { bg: '#ECFDF5', text: '#059669' },
            'orange': { bg: '#FFF7ED', text: '#F59E0B' },
            'gray': { bg: '#F1F5F9', text: '#64748B' }
        };
        const style = colors[color] || colors['gray'];
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.text,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: 12,
                fontWeight: 500,
                display: 'inline-block'
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
                {error || 'No data available'}
            </div>
        );
    }

    // Safe extraction with defaults
    const header = data?.header || { title: '', subtitle: '' };
    const stats = Array.isArray(data?.stats) ? data.stats : [];
    const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
    const filters = Array.isArray(data?.filters) ? data.filters : [];
    
    const queue = data?.queue || {};
    const queueHeaders = Array.isArray(queue.tableHeaders) ? queue.tableHeaders : [];
    const queueRows = Array.isArray(queue.rows) ? queue.rows : [];

    // Safe extraction for actionButtons
    const rawActionButtons = data?.actionButtons;
    const actionButtonsMap = (rawActionButtons && !Array.isArray(rawActionButtons)) ? rawActionButtons : {};
    
    const exportSheetsBtn = actionButtonsMap.exportSheets || { label: 'Export Sheets' };
    const importResultsBtn = actionButtonsMap.importResults || { label: 'Import Results' };
    const createAuctionBtn = actionButtonsMap.createAuction || { label: 'New Auction' };

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
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{header.title}</h1>
                        <div style={{ fontSize: 14, color: '#64748B' }}>{header.subtitle}</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'),
                    gap: 16,
                    marginBottom: 24
                }}>
                    {stats.map((stat: any, idx: number) => (
                        <div key={idx} style={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            padding: 20
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{stat.label}</span>
                                <div style={{ color: stat.color }}>
                                    {getIcon(stat.icon)}
                                </div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{stat.value}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>{stat.subtext}</div>
                        </div>
                    ))}
                </div>

                {/* Status Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 24,
                    overflowX: isMobile ? 'auto' : 'visible',
                    whiteSpace: isMobile ? 'nowrap' : 'normal',
                    flexWrap: isMobile ? 'nowrap' : 'wrap'
                }}>
                    {tabs.map((tab: any, idx: number) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    backgroundColor: isActive ? '#1E3A5F' : '#fff',
                                    color: isActive ? '#fff' : '#64748B',
                                    border: isActive ? 'none' : '1px solid #E2E8F0',
                                    borderRadius: 20,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexShrink: 0
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                                    color: isActive ? '#fff' : '#64748B',
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    fontSize: 12
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Bar */}
                <div style={{
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 16 : 0
                }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ position: 'relative', width: isMobile ? '100%' : 300 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Search parcels, addresses, dates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    outline: 'none',
                                    color: '#0F172A'
                                }}
                            />
                        </div>
                        {filters.map((filter: any, idx: number) => {
                             const handleChange = (e: any) => {
                                 const val = e.target.value;
                                 if (filter.label === 'Status') setStatusFilter(val);
                                 if (filter.label === 'County') setCountyFilter(val);
                                 if (filter.label === 'Date Range') setDateRangeFilter(val);
                             };
                             const getValue = () => {
                                 if (filter.label === 'Status') return statusFilter;
                                 if (filter.label === 'County') return countyFilter;
                                 if (filter.label === 'Date Range') return dateRangeFilter;
                                 return '';
                             };

                             return (
                            <div key={idx} style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                                <select 
                                    onChange={handleChange}
                                    value={getValue()}
                                    style={{
                                    appearance: 'none',
                                    padding: '10px 32px 10px 16px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    color: '#0F172A',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    width: isMobile ? '100%' : 'auto'
                                }}>
                                    {filter.options.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            </div>
                        )})}
                        <button 
                            onClick={handleClearFilters}
                            style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            width: isMobile ? '100%' : 'auto',
                            textAlign: isMobile ? 'center' : 'left'
                        }}>
                            Clear
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <button 
                            onClick={handleExport}
                            style={{
                            backgroundColor: '#fff',
                            color: '#1E3A5F',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            padding: '10px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            justifyContent: 'center',
                            flex: isMobile ? 1 : 'initial'
                        }}>
                            <Download size={16} /> {exportSheetsBtn.label}
                        </button>
                        <button 
                            onClick={handleImportClick}
                            style={{
                            backgroundColor: '#fff',
                            color: '#1E3A5F',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            padding: '10px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            justifyContent: 'center',
                            flex: isMobile ? 1 : 'initial'
                        }}>
                            <Upload size={16} /> {importResultsBtn.label}
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                        />
                        <button 
                            onClick={() => {
                                setShowScheduleModal(true);
                                fetchAvailableProperties();
                            }}
                            style={{
                                backgroundColor: '#1E3A5F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '10px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                justifyContent: 'center',
                                flex: isMobile ? 1 : 'initial'
                            }}
                        >
                            <Plus size={16} /> {createAuctionBtn.label}
                        </button>
                    </div>
                </div>

                {/* Queue Table */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #E2E8F0'
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{queue.title}</h3>
                        <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{queue.subtitle}</div>
                    </div>

                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: isMobile ? '400px' : 'none' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: isMobile ? '1000px' : '100%' }}>
                            <thead style={{ position: isMobile ? 'sticky' : 'static', top: 0, zIndex: 10 }}>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    {queueHeaders.map((header: string, idx: number) => (
                                        <th key={idx} style={{
                                            textAlign: 'left',
                                            padding: '12px 16px',
                                            color: '#64748B',
                                            fontWeight: 600,
                                            fontSize: 12,
                                            width: idx === 0 ? 40 : 'auto',
                                            backgroundColor: '#F8FAFC'
                                        }}>
                                            {idx === 0 ? <input type="checkbox" /> : header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {queueRows.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '16px' }}><input type="checkbox" /></td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: '#1E3A5F', marginBottom: 2 }}>{row.pcigId}</div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>{row.address}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{row.auctionDate}</div>
                                            {row.auctionTime && (
                                                <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>{row.auctionTime}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {getStatusBadge(row.status, row.statusColor)}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {row.soldAmount ? (
                                                <>
                                                    <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
                                                        {row.startBid} {row.soldAmount}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>{row.surplus}</div>
                                                </>
                                            ) : (
                                                <>
                                                    {row.maxBid && <div style={{ fontSize: 12, color: '#64748B' }}>Max: {row.maxBid}</div>}
                                                    <div style={{ fontWeight: 600, color: '#0F172A' }}>Start: {row.startBid}</div>
                                                </>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748B' }}>{row.location}</td>
                                        <td style={{ padding: '16px' }}>
                                            {getPrepStatusBadge(row.prepStatus, row.prepStatusColor)}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {row.status === 'Scheduled' ? (
                                                <button 
                                                    onClick={() => openResultModal(row.auction_id)}
                                                    style={{
                                                        backgroundColor: '#1E3A5F',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '6px 12px',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Enter Result
                                                </button>
                                            ) : row.status === 'Post-Auction' ? (
                                                <button style={{
                                                    backgroundColor: '#fff',
                                                    color: '#1E3A5F',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: 6,
                                                    padding: '6px 12px',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}>
                                                    Process
                                                </button>
                                            ) : (
                                                <MoreHorizontal size={18} style={{ color: '#64748B', cursor: 'pointer' }} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Schedule Auction Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: '500px',
                        padding: '24px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Schedule Auction</h2>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                    Property
                                </label>
                                <select
                                    value={newAuction.property_id}
                                    onChange={(e) => setNewAuction({ ...newAuction, property_id: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">Select a property...</option>
                                    {availableProperties.map((prop) => (
                                        <option key={prop.id} value={prop.id}>
                                            {prop.address} {prop.city ? `, ${prop.city}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newAuction.auction_date}
                                        onChange={(e) => setNewAuction({ ...newAuction, auction_date: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: 8,
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newAuction.auction_time}
                                        onChange={(e) => setNewAuction({ ...newAuction, auction_time: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: 8,
                                            border: '1px solid #E2E8F0',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newAuction.location}
                                    onChange={(e) => setNewAuction({ ...newAuction, location: e.target.value })}
                                    placeholder="e.g. County Courthouse Steps"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                    Starting Bid
                                </label>
                                <input
                                    type="number"
                                    value={newAuction.starting_bid}
                                    onChange={(e) => setNewAuction({ ...newAuction, starting_bid: e.target.value })}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                    Notes
                                </label>
                                <textarea
                                    value={newAuction.notes}
                                    onChange={(e) => setNewAuction({ ...newAuction, notes: e.target.value })}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: '#FFFFFF',
                                        color: '#64748B',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleAuction}
                                    disabled={!newAuction.property_id || !newAuction.auction_date || !newAuction.starting_bid}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: (!newAuction.property_id || !newAuction.auction_date || !newAuction.starting_bid) ? '#94A3B8' : '#1D4ED8',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: (!newAuction.property_id || !newAuction.auction_date || !newAuction.starting_bid) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enter Result Modal */}
            {showResultModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: '500px',
                        padding: '24px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Enter Auction Result</h2>
                            <button
                                onClick={() => setShowResultModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                    Outcome
                                </label>
                                <select
                                    value={auctionResult.status}
                                    onChange={(e) => setAuctionResult({ ...auctionResult, status: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="completed">Sold (Completed)</option>
                                    <option value="failed">Failed / No Sale</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {auctionResult.status === 'completed' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                            Winning Bid Amount
                                        </label>
                                        <input
                                            type="number"
                                            value={auctionResult.winning_bid}
                                            onChange={(e) => setAuctionResult({ ...auctionResult, winning_bid: e.target.value })}
                                            placeholder="0.00"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: 8,
                                                border: '1px solid #E2E8F0',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>
                                            Winner Info (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={auctionResult.winner_info}
                                            onChange={(e) => setAuctionResult({ ...auctionResult, winner_info: e.target.value })}
                                            placeholder="Name or details"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: 8,
                                                border: '1px solid #E2E8F0',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                <button
                                    onClick={() => setShowResultModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: '#FFFFFF',
                                        color: '#64748B',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEnterResult}
                                    disabled={auctionResult.status === 'completed' && !auctionResult.winning_bid}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        backgroundColor: (auctionResult.status === 'completed' && !auctionResult.winning_bid) ? '#94A3B8' : '#1D4ED8',
                                        color: '#FFFFFF',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        cursor: (auctionResult.status === 'completed' && !auctionResult.winning_bid) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Submit Result
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
