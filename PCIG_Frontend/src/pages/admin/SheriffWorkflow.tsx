import { useState, CSSProperties, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Download,
    Calendar,
    Cloud,
    Truck,
    Gavel,
    FileText,
    CheckCircle2,
    Search,
    ChevronDown,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon map
const iconMap: { [key: string]: any } = {
    Download,
    Calendar,
    Cloud,
    Truck,
    Gavel,
    FileText,
    CheckCircle2
};

export default function SheriffWorkflow() {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    
    // Dashboard Data (Stats, etc.)
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Table Data (Search, Filter, Pagination)
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [propertiesData, setPropertiesData] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [activeTab, setActiveTab] = useState('Export Queue');

    // Actions
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupNotes, setPickupNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch Dashboard Data (Initial Load)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/sheriff/dashboard-data');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sheriff workflow data:', err);
                setError('Failed to load sheriff workflow data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch Properties Table Data
    useEffect(() => {
        const fetchProperties = async () => {
            setLoadingProperties(true);
            try {
                const response = await api.get('/admin/sheriff/properties', {
                    params: {
                        search: debouncedSearch,
                        status: statusFilter,
                        page: page,
                        tab: activeTab
                    }
                });
                if (response.data.success) {
                    setPropertiesData(response.data.data);
                    setPagination(response.data.meta);
                }
            } catch (err) {
                console.error('Error fetching properties:', err);
            } finally {
                setLoadingProperties(false);
            }
        };

        fetchProperties();
    }, [debouncedSearch, statusFilter, page, activeTab]);

    const pageWrapperStyle: CSSProperties = {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
    };

    const cardStyle: CSSProperties = {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        boxSizing: 'border-box'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
                <div style={{ color: '#64748B' }}>Loading sheriff workflow...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
                <div style={{ color: '#EF4444' }}>{error || 'No data available'}</div>
            </div>
        );
    }

    // Data Extraction
    const sheriffData = data?.sheriffWorkflow || {};
    const header = sheriffData?.header || { title: 'Sheriff Workflow', subtitle: '' };
    
    const rawActionButtons = sheriffData?.actionButtons || {};
    const actionButtons = {
        generateExport: rawActionButtons?.generateExport || { label: 'Generate Export File', icon: 'Download' },
        schedulePickup: rawActionButtons?.schedulePickup || { label: 'Schedule Pickup', icon: 'Calendar' }
    };

    const statsCards = sheriffData?.statsCards || [];
    const tabs = sheriffData?.tabs || [];
    
    const rawFilters = sheriffData?.filters || {};
    const filters = {
        searchPlaceholder: rawFilters?.searchPlaceholder || 'Search...',
        dropdowns: rawFilters?.dropdowns || [],
        clearButton: rawFilters?.clearButton || 'Clear Filters'
    };

    const rawQueue = sheriffData?.queue || {};
    const queue = {
        title: rawQueue?.title || 'Queue',
        count: rawQueue?.count || '0 items',
        tableHeaders: rawQueue?.tableHeaders || [],
        rows: rawQueue?.rows || []
    };

    const workflowIntegration = sheriffData?.workflowIntegration || { messages: [], link: '' };

    const getStatusBadge = (status: { label: string, color: string, subtext?: string }) => {
        let bg = '#F1F5F9';
        let color = '#64748B';
        let borderColor = 'transparent';

        if (status.color === 'warning') {
            bg = '#FFFBEB';
            color = '#B45309';
            borderColor = '#FDE68A';
        } else if (status.color === 'success') {
            bg = '#ECFDF5';
            color = '#059669';
            borderColor = '#6EE7B7';
        } else if (status.color === 'critical') {
            bg = '#FEF2F2';
            color = '#DC2626';
            borderColor = '#FECACA';
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{
                    backgroundColor: bg,
                    color: color,
                    border: `1px solid ${borderColor}`,
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'inline-block'
                }}>
                    {status.label}
                </span>
                {status.subtext && (
                    <span style={{ fontSize: 11, color: '#64748B', marginTop: 2, marginLeft: 2 }}>
                        {status.subtext}
                    </span>
                )}
            </div>
        );
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedItems(newSelection);
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === propertiesData.length && propertiesData.length > 0) {
            setSelectedItems(new Set());
        } else {
            const newSelection = new Set<string>();
            propertiesData.forEach(row => newSelection.add(row.id));
            setSelectedItems(newSelection);
        }
    };

    const handleGenerateExport = async () => {
        try {
            setActionLoading(true);
            const response = await api.post('/admin/sheriff/generate-export', {
                ids: Array.from(selectedItems)
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sheriff_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            
            // Refresh data
            setSelectedItems(new Set());
        } catch (error) {
            console.error('Error generating export:', error);
            alert('Failed to generate export file.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSchedulePickup = async () => {
        if (!pickupDate) {
            alert('Please select a date.');
            return;
        }

        try {
            setActionLoading(true);
            await api.post('/admin/sheriff/schedule-pickup', {
                ids: Array.from(selectedItems),
                date: pickupDate,
                notes: pickupNotes
            });
            
            setShowPickupModal(false);
            setPickupDate('');
            setPickupNotes('');
            setSelectedItems(new Set());
            alert('Pickup scheduled successfully.');
            
            // Refresh data
            // Just reload page 1 or current page
            const response = await api.get('/admin/sheriff/properties', {
                params: {
                    search: debouncedSearch,
                    status: statusFilter,
                    page: page
                }
            });
            if (response.data.success) {
                setPropertiesData(response.data.data);
                setPagination(response.data.meta);
            }
        } catch (error) {
            console.error('Error scheduling pickup:', error);
            alert('Failed to schedule pickup.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDetails = (id: string) => {
        navigate(`/admin/properties/${id}`);
    };

    return (
        <div style={pageWrapperStyle}>
            <AdminNav />

            {/* Main Content */}
            <div style={{
                padding: isMobile ? '16px' : '24px 40px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>

                {/* Header & Actions */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? 12 : 0,
                    marginBottom: 24
                }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{header.title}</h1>
                        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>{header.subtitle}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <button 
                            onClick={handleGenerateExport}
                            disabled={actionLoading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                backgroundColor: '#1E3A5F', color: '#FFFFFF',
                                border: 'none', borderRadius: 6, padding: '10px 16px',
                                fontSize: 14, fontWeight: 500, cursor: actionLoading ? 'wait' : 'pointer',
                                flex: isMobile ? 1 : 'initial', justifyContent: 'center',
                                opacity: actionLoading ? 0.7 : 1
                            }}
                        >
                            <Download size={16} />
                            {actionButtons.generateExport.label}
                        </button>
                        <button 
                            onClick={() => {
                                if (selectedItems.size === 0) {
                                    alert('Please select items to schedule pickup.');
                                    return;
                                }
                                setShowPickupModal(true);
                            }}
                            disabled={actionLoading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                backgroundColor: '#FFFFFF', color: '#0F172A',
                                border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px',
                                fontSize: 14, fontWeight: 500, cursor: actionLoading ? 'wait' : 'pointer',
                                flex: isMobile ? 1 : 'initial', justifyContent: 'center',
                                opacity: actionLoading ? 0.7 : 1
                            }}
                        >
                            <Calendar size={16} />
                            {actionButtons.schedulePickup.label}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)'),
                    gap: 16,
                    marginBottom: 24
                }}>
                    {statsCards.map((card: any, idx: number) => {
                        const Icon = iconMap[card.icon];
                        return (
                            <div key={idx} style={{ ...cardStyle, padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{card.label}</span>
                                    {Icon && <Icon size={16} color={card.color} />}
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: card.color, marginBottom: 4 }}>
                                    {card.value}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>
                                    {card.subtext}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div style={{
                    ...cardStyle,
                    padding: '0 24px',
                    marginBottom: 24,
                    display: 'flex',
                    gap: 32,
                    overflowX: 'auto',
                    whiteSpace: 'nowrap'
                }}>
                    {tabs.map((tab: any, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(tab.label)}
                            style={{
                                padding: '16px 0',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.label ? '2px solid #1E3A5F' : '2px solid transparent',
                                color: activeTab === tab.label ? '#1E3A5F' : '#64748B',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                flexShrink: 0
                            }}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span style={{
                                    backgroundColor: activeTab === tab.label ? '#EFF6FF' : '#F1F5F9',
                                    color: activeTab === tab.label ? '#1E3A5F' : '#64748B',
                                    padding: '2px 8px',
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 600
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    ...cardStyle,
                    padding: '12px',
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: (isMobile || isTablet) ? 'column' : 'row',
                    gap: 12,
                    alignItems: (isMobile || isTablet) ? 'stretch' : 'center'
                }}>
                    <div style={{ position: 'relative', flex: (isMobile || isTablet) ? 'initial' : 0.5 }}>
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder={filters.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 36px',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 12, flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <select 
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 32px 10px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    fontSize: 14,
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    appearance: 'none',
                                    minWidth: isMobile ? 'auto' : 140,
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="All">Status: All</option>
                                <option value="Pending">Status: Pending</option>
                                <option value="Exported">Status: Exported</option>
                            </select>
                            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <ChevronDown size={14} color="#64748B" />
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('All');
                                setPage(1);
                            }}
                            style={{ color: '#64748B', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, alignSelf: isMobile ? 'flex-start' : 'center' }}
                        >
                            {filters.clearButton}
                        </button>
                    </div>
                </div>

                {/* Queue Table */}
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: isMobile ? 12 : 0
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {queue.title} <span style={{ color: '#64748B', fontWeight: 400, marginLeft: 8 }}>{pagination?.total || queue.count}</span>
                        </h3>
                        {/* Selection Actions */}
                        {selectedItems.size > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{selectedItems.size} items selected</span>
                                <button 
                                    onClick={handleGenerateExport}
                                    style={{
                                        backgroundColor: '#1E3A5F', color: '#fff',
                                        border: 'none', borderRadius: 4, padding: '6px 12px',
                                        fontSize: 12, fontWeight: 500, cursor: 'pointer'
                                    }}
                                >
                                    Generate Export File
                                </button>
                                <button style={{
                                    background: 'none', border: 'none', color: '#64748B',
                                    fontSize: 13, textDecoration: 'underline', cursor: 'pointer'
                                }} onClick={() => setSelectedItems(new Set())}>
                                    Clear Selection
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 1000 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '12px 24px', width: 40 }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedItems.size === propertiesData.length && propertiesData.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    {queue.tableHeaders.slice(1).map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingProperties ? (
                                    <tr>
                                        <td colSpan={queue.tableHeaders.length || 10} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                            Loading properties...
                                        </td>
                                    </tr>
                                ) : propertiesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={queue.tableHeaders.length || 10} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                            No properties found in Sheriff Workflow.
                                        </td>
                                    </tr>
                                ) : (
                                    propertiesData.map((row: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedItems.has(row.id) ? '#F8FAFC' : 'white' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(row.id)}
                                                    onChange={() => toggleSelection(row.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.parcelId}</div>
                                                <div style={{ color: '#64748B', fontSize: 12 }}>{row.pcigId}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ color: '#0F172A', fontWeight: 500 }}>{row.address}</div>
                                                <div style={{ color: '#64748B', fontSize: 12 }}>{row.city}</div>
                                            </td>
                                            <td style={{ padding: '16px', color: '#0F172A' }}>{row.owner}</td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ color: '#1E3A5F', fontWeight: 500 }}>{row.sheriffFile}</div>
                                            </td>
                                            <td style={{ padding: '16px', color: '#0F172A' }}>{row.taxYear}</td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: '#0F172A' }}>{row.amount}</td>
                                            <td style={{ padding: '16px' }}>{getStatusBadge(row.exportStatus)}</td>
                                            <td style={{ padding: '16px' }}>{getStatusBadge(row.deliveryStatus)}</td>
                                            <td style={{ padding: '16px' }}>
                                                {row.actionOverride ? (
                                                    <button style={{ color: '#10B981', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                        {row.actionOverride}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleViewDetails(row.id)}
                                                        style={{ color: '#1E3A5F', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {pagination && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: 14, color: '#64748B' }}>
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} entries
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '8px 12px', borderRadius: 6,
                                        border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
                                        color: pagination.current_page === 1 ? '#CBD5E1' : '#64748B',
                                        cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '8px 12px', borderRadius: 6,
                                        border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF',
                                        color: pagination.current_page === pagination.last_page ? '#CBD5E1' : '#64748B',
                                        cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Workflow Integration Footer */}
                <div style={{
                    marginTop: 24,
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: 8,
                    padding: '16px 24px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? 12 : 0
                }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 24 }}>
                        <div style={{ fontWeight: 600, color: '#065F46' }}>Workflow Integration</div>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 16 }}>
                            {workflowIntegration.messages.map((msg: string, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 13, fontWeight: 500 }}>
                                    <CheckCircle2 size={16} />
                                    {msg}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/operations/notice-letters')}
                        style={{
                        background: 'none', border: 'none',
                        fontSize: 13, fontWeight: 600, color: '#065F46',
                        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'
                    }}>
                        {workflowIntegration.link} <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Schedule Pickup Modal */}
            {showPickupModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF', borderRadius: 8, width: '90%', maxWidth: 500,
                        padding: 24, position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowPickupModal(false)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="#64748B" />
                        </button>
                        
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Schedule Pickup</h2>
                        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
                            Schedule pickup for {selectedItems.size} selected properties.
                        </p>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 8 }}>
                                Date
                            </label>
                            <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: 6,
                                    border: '1px solid #E2E8F0', fontSize: 14,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 8 }}>
                                Notes
                            </label>
                            <textarea
                                value={pickupNotes}
                                onChange={(e) => setPickupNotes(e.target.value)}
                                rows={4}
                                placeholder="Enter any instructions..."
                                style={{
                                    width: '100%', padding: '10px', borderRadius: 6,
                                    border: '1px solid #E2E8F0', fontSize: 14,
                                    boxSizing: 'border-box', fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                onClick={() => setShowPickupModal(false)}
                                style={{
                                    padding: '10px 16px', borderRadius: 6, border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF', color: '#0F172A', fontWeight: 500, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedulePickup}
                                disabled={actionLoading}
                                style={{
                                    padding: '10px 16px', borderRadius: 6, border: 'none',
                                    backgroundColor: '#1E3A5F', color: '#FFFFFF', fontWeight: 500, cursor: 'pointer',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                            >
                                {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
