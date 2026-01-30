import { useState, CSSProperties, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Clock,
    CheckCircle2,
    DollarSign,
    Search,
    ChevronDown,
    History,
    ArrowRight,
    X,
    TrendingUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon map
const iconMap: { [key: string]: any } = {
    Activity,
    AlertTriangle,
    Clock,
    CheckCircle2,
    DollarSign,
    History,
    TrendingUp
};

export default function RedemptionTracking() {
    // Media Queries
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    // const isMobileOrTablet = isMobile || isTablet; 

    // Dashboard Data (Stats, etc.)
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Table Data (Search, Filter, Pagination)
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [page, setPage] = useState(1);
    const [propertiesData, setPropertiesData] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loadingProperties, setLoadingProperties] = useState(false);

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
                const response = await api.get('/admin/redemption/dashboard-data');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching redemption data:', err);
                setError('Failed to load redemption data. Please try again later.');
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
                const response = await api.get('/admin/redemption/properties', {
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
            } catch (err) {
                console.error('Error fetching properties:', err);
            } finally {
                setLoadingProperties(false);
            }
        };

        fetchProperties();
    }, [debouncedSearch, statusFilter, page]);

    const navigate = useNavigate();

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    // Sidebar State
    const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

    const pageWrapperStyle: CSSProperties = {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden' // Prevent horizontal scroll when sidebar enters?
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8FAFC' }}>
                <div style={{ color: '#64748B' }}>Loading redemption tracking...</div>
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
    const redemptionData = data || {};
    const header = redemptionData?.header || { title: '', subtitle: '' };
    
    const rawActionButtons = header?.actionButtons || [];
    
    // Map array to object for easy access if needed, or use directly
    const actionButtons = {
        processPayoff: rawActionButtons.find((b: any) => b.label === 'Process Payoff') || { label: 'Process Payoff', icon: 'DollarSign' },
        viewHistory: rawActionButtons.find((b: any) => b.label === 'View History') || { label: 'View History', icon: 'History' }
    };
    
    const summaryCards = redemptionData?.summaryCards || [];
    const alertBanner = redemptionData?.alertBanner || null;

    const rawFilters = redemptionData?.filters || {};
    const filters = {
        searchPlaceholder: rawFilters?.searchPlaceholder || 'Search by address, parcel ID...',
        dropdowns: Array.isArray(rawFilters?.dropdowns)
            ? rawFilters.dropdowns.map((d: any) => {
                if (typeof d === 'string') {
                    return { options: [d] };
                }
                if (Array.isArray(d?.options)) {
                    return { options: d.options };
                }
                return { options: [] };
            })
            : [],
        clearButton: rawFilters?.clearButton || 'Clear Filters'
    };

    const rawQueue = redemptionData?.queue || {};
    const queue = {
        title: rawQueue?.title || '',
        subtitle: rawQueue?.subtitle || '',
        tableHeaders: rawQueue?.tableHeaders || [],
        rows: rawQueue?.rows || [],
        count: rawQueue?.count || 0
    };

    const rawHistory = redemptionData?.history || {};
    const history = {
        title: rawHistory?.title || '',
        subtitle: rawHistory?.subtitle || '',
        tableHeaders: rawHistory?.tableHeaders || [],
        rows: rawHistory?.rows || []
    };

    const cardStyle: CSSProperties = {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        boxSizing: 'border-box'
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

    const getStatusBadge = (status: { label: string, color: string }) => {
        let bg = '#F1F5F9';
        let color = '#64748B';
        let borderColor = 'transparent';

        if (status.color === 'active') {
            bg = '#EFF6FF';
            color = '#1E3A5F';
            borderColor = '#BFDBFE';
        } else if (status.color === 'critical') { // Approaching Deadline
            bg = '#FEF2F2';
            color = '#DC2626';
            borderColor = '#FECACA';
        } else if (status.color === 'warning') { // Pending Payoff
            bg = '#FFF7ED';
            color = '#C2410C';
            borderColor = '#FED7AA';
        } else if (status.color === 'info') { // Payoff Requested
            bg = '#EFF6FF';
            color = '#2563EB';
            borderColor = '#BFDBFE';
        } else if (status.color === 'success') { // Redeemed
            bg = '#ECFDF5';
            color = '#059669';
            borderColor = '#6EE7B7';
        } else if (status.color === 'neutral') {
            bg = '#F1F5F9';
            color = '#64748B';
            borderColor = '#E2E8F0';
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                border: `1px solid ${borderColor}`,
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-block',
                whiteSpace: 'nowrap'
            }}>
                {status.label}
            </span>
        );
    };

    // --- Sidebar Component ---
    const SidePanel = ({ property, onClose }: { property: any, onClose: () => void }) => {
        if (!property) return null;

        return (
            <div style={{
                width: isMobile ? '100%' : '420px',
                backgroundColor: '#FFFFFF',
                borderLeft: isMobile ? 'none' : '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                height: '100%',
                zIndex: isMobile ? 100 : 50, // Higher z-index on mobile to cover nav
                position: isMobile ? 'fixed' : 'relative',
                top: 0,
                left: isMobile ? 0 : 'auto', // Ensure left 0 on mobile
                right: 0,
                bottom: 0,
                boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Redemption Details</div>
                        <div style={{ fontSize: 14, color: '#64748B', lineHeight: '1.5' }}>
                            {property.address}<br />
                            {property.pcigId}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Badge based on status */}
                        {property.status.color === 'critical' && (
                            <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                                {property.status.label}
                            </span>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                            <X size={24} color="#64748B" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>

                    {/* Engine Status */}
                    <div style={{ ...cardStyle, padding: '16px', marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Redemption Engine</div>
                            <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#059669' }} />
                                LIVE
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748B' }}>Real-time payoff calculations</div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Bid Price</div>
                            <div style={{ fontSize: 18, fontWeight: 500, color: '#0F172A' }}>$45,000.00</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Interest Rate</div>
                            <div style={{ fontSize: 18, fontWeight: 500, color: '#1E3A5F' }}>20.0%</div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ color: '#64748B', fontSize: 14 }}>Total Expenses</span>
                            <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>$2,500.00</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ color: '#64748B', fontSize: 14 }}>Accrued Interest</span>
                            <span style={{ color: '#10B981', fontWeight: 600, fontSize: 14 }}>$10,921.12</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontSize: 14 }}>Daily Accrual</span>
                            <span style={{ color: '#0F172A', fontWeight: 600, fontSize: 14 }}>$26.03 / day</span>
                        </div>
                    </div>

                    {/* Total Payoff */}
                    <div style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: '24px', textAlign: 'center', border: '1px solid #1E3A5F', marginBottom: 24 }}>
                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Estimated Payoff Today</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>
                            {property.estimatedPayoff}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>As of 10:42 AM EST</div>
                    </div>

                    {/* Deadline Progress */}
                    <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FECACA', borderRadius: 8, padding: '16px' }}>
                        <div style={{ textAlign: 'center', fontSize: 13, color: '#0F172A', marginBottom: 4 }}>
                            Redemption Deadline: {property.deadline}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 12 }}>
                            {property.daysRemaining}
                        </div>
                        <div style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: '20%', height: '100%', backgroundColor: '#DC2626' }} />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button style={{
                        width: '100%', padding: '14px', borderRadius: 6, border: 'none',
                        backgroundColor: '#1E3A5F', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14
                    }}>
                        Generate Payoff Letter
                    </button>
                    <button style={{
                        width: '100%', padding: '14px', borderRadius: 6, border: 'none',
                        backgroundColor: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14
                    }}>
                        Process Redemption
                    </button>
                </div>

            </div>
        );
    };

    return (
        <div style={{
            ...pageWrapperStyle,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
        }}>
            <AdminNav />

            {/* Content Wrapper */}
            <div style={{
                display: 'flex',
                flex: 1,
                backgroundColor: '#F8FAFC',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Main Content Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: isMobile ? '16px' : '24px 32px', // Slightly tight padding to accommodate sidebar
                    width: '100%',
                    boxSizing: 'border-box',
                    minWidth: 0 // Crucial for flex child shrinking
                }}>

                    {/* Header & Actions */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'flex-start',
                        marginBottom: 24,
                        gap: isMobile ? 16 : 0
                    }}>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{header.title}</h1>
                            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>{header.subtitle}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                backgroundColor: '#1E3A5F', color: '#FFFFFF',
                                border: 'none', borderRadius: 6, padding: '10px 16px',
                                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                justifyContent: 'center', width: isMobile ? '100%' : 'auto'
                            }}>
                                <DollarSign size={16} />
                                {actionButtons.processPayoff.label}
                            </button>
                            <button style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                backgroundColor: '#FFFFFF', color: '#0F172A',
                                border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px',
                                fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                justifyContent: 'center', width: isMobile ? '100%' : 'auto'
                            }}>
                                <History size={16} />
                                {actionButtons.viewHistory.label}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile
                            ? '1fr'
                            : (isTablet || selectedProperty ? 'repeat(auto-fit, minmax(240px, 1fr))' : 'repeat(4, 1fr)'),
                        gap: 16,
                        marginBottom: 24
                    }}>
                        {summaryCards.map((card: any, idx: number) => {
                            const Icon = iconMap[card.icon];
                            return (
                                <div key={idx} style={{ ...cardStyle, padding: '20px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{card.label}</span>
                                        {Icon && <Icon size={16} color={card.color} />}
                                    </div>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: card.color, marginBottom: 4, marginTop: 'auto' }}>
                                        {card.value}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>
                                        {card.subtitle}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Alert Banner */}
                    {alertBanner && (
                    <div style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FEE2E2',
                        borderRadius: 4,
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                        gap: isMobile ? 8 : 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#B91C1C', fontSize: 14, fontWeight: 600 }}>
                            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                            <span>{alertBanner.message}</span>
                        </div>
                        <button style={{
                            background: 'none', border: 'none',
                            fontSize: 13, fontWeight: 600, color: '#B91C1C',
                            textDecoration: 'underline', cursor: 'pointer',
                            padding: 0,
                            alignSelf: isMobile ? 'flex-end' : 'auto'
                        }}>
                            {alertBanner.action}
                        </button>
                    </div>
                    )}

                    {/* Filters */}
                    <div style={{
                        ...cardStyle,
                        padding: '12px',
                        marginBottom: 24,
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '1 1 200px', minWidth: isMobile ? '100%' : '200px' }}>
                            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder={filters.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                        {filters.dropdowns.map((drop: any, idx: number) => {
                            const options = Array.isArray(drop?.options) ? drop.options : [];
                            return (
                                <div key={idx} style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 auto' }}>
                                    <select style={{
                                        padding: '10px 32px 10px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #E2E8F0',
                                        fontSize: 14,
                                        backgroundColor: '#FFFFFF',
                                        color: '#0F172A',
                                        appearance: 'none',
                                        width: '100%',
                                        minWidth: isMobile ? 'auto' : 130,
                                        cursor: 'pointer'
                                    }}>
                                        <option>{options[0] || ''}</option>
                                        {options.slice(1).map((opt: string) => <option key={opt}>{opt}</option>)}
                                    </select>
                                    <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                        <ChevronDown size={14} color="#64748B" />
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{ flex: 1 }}></div>
                        <button style={{
                            color: '#64748B', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500,
                            width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'right',
                            marginTop: isMobile ? 8 : 0
                        }}>
                            {filters.clearButton}
                        </button>
                    </div>

                    {/* Queue Table */}
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {queue.title} <span style={{ color: '#64748B', fontWeight: 400, marginLeft: 8 }}>
                                    {searchTerm ? queue.rows.filter((r: any) => r.address.toLowerCase().includes(searchTerm.toLowerCase()) || r.parcelId.toLowerCase().includes(searchTerm.toLowerCase())).length : queue.count}
                                </span>
                            </h3>
                            <button
                                onClick={() => setSortAsc(!sortAsc)}
                                style={{
                                    backgroundColor: '#FFFFFF', color: '#0F172A',
                                    border: '1px solid #E2E8F0', borderRadius: 4, padding: '6px 12px',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                Sort
                                <ArrowRight size={12} style={{ transform: sortAsc ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '12px 24px', width: 40 }}><input type="checkbox" /></th>
                                        {queue.tableHeaders.map((h: string) => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {queue.rows
                                        .filter((row: any) => {
                                            const term = searchTerm.toLowerCase();
                                            return row.address.toLowerCase().includes(term) ||
                                                row.parcelId.toLowerCase().includes(term);
                                        })
                                        .sort((a: any, b: any) => {
                                            // Simple deadline sort for demo
                                            return sortAsc ? a.daysRemaining.localeCompare(b.daysRemaining) : b.daysRemaining.localeCompare(a.daysRemaining);
                                        })
                                        .map((row: any, idx: number) => (
                                            <tr
                                                key={idx}
                                                style={{
                                                    borderBottom: '1px solid #E2E8F0',
                                                    backgroundColor: selectedItems.has(row.id) ? '#F8FAFC' : 'white',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={(e) => {
                                                    // Prevent navigation if clicking checkbox or button
                                                    if ((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('button')) {
                                                        return;
                                                    }
                                                    navigate(`/admin/properties/${row.pcigId || 'PCIG-2024-001'}`); // Use ID or fallback
                                                }}
                                            >
                                                <td style={{ padding: '16px 24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.has(row.id)}
                                                        onChange={() => toggleSelection(row.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: 600, color: '#1E3A5F' }}>{row.parcelId}</div>
                                                    <div style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>{row.pcigId}</div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ color: '#0F172A', fontWeight: 600 }}>{row.address}</div>
                                                    <div style={{ color: '#64748B', fontSize: 12 }}>{row.county}</div>
                                                </td>
                                                <td style={{ padding: '16px', color: '#0F172A' }}>{row.owner}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ color: row.status.color === 'critical' ? '#DC2626' : '#0F172A', fontWeight: 600 }}>{row.deadline}</div>
                                                    <div style={{ color: '#64748B', fontSize: 12 }}>{row.daysRemaining}</div>
                                                    {/* Progress Bar Mockup */}
                                                    {row.status.color === 'critical' && (
                                                        <div style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                                                            <div style={{ width: '90%', height: '100%', backgroundColor: '#DC2626' }} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px' }}>{getStatusBadge(row.status)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.estimatedPayoff}</div>
                                                    <div style={{ color: '#64748B', fontSize: 12 }}>{row.payoffDateVal}</div>
                                                </td>
                                                <td style={{ padding: '16px' }}>{getStatusBadge(row.payoffStatus)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        {row.actions.map((action: any) => (
                                                            <button
                                                                key={action.label}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (action.label === 'View Property') {
                                                                        navigate(`/admin/properties/${row.pcigId || 'PCIG-2024-001'}`);
                                                                    } else {
                                                                        setSelectedProperty(row);
                                                                    }
                                                                }}
                                                                style={{
                                                                    backgroundColor: action.primary ? '#10B981' : 'transparent',
                                                                    color: action.primary ? '#FFFFFF' : '#1E3A5F',
                                                                    border: 'none', borderRadius: 4, padding: action.primary ? '8px 12px' : '0',
                                                                    fontWeight: 600, cursor: 'pointer', fontSize: 13,
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                {action.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* History Table */}
                    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{history.title}</h3>
                                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>{history.subtitle}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    This Month <ChevronDown size={14} />
                                </button>
                                <button style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ArrowRight size={14} style={{ transform: 'rotate(-90deg)' }} /> Export
                                </button>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        {history.tableHeaders.map((h: string, i: number) => (
                                            <th key={i} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.rows.map((row: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.property.parcelId}</div>
                                                <div style={{ color: '#64748B', fontSize: 12 }}>{row.property.address}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.owner}</td>
                                            <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.redemptionDate}</td>
                                            <td style={{ padding: '16px 24px', color: '#10B981', fontWeight: 600 }}>{row.amount}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ backgroundColor: '#EFF6FF', color: '#1E3A5F', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>{row.method}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>{row.status}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.processedBy}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <button style={{ color: '#1E3A5F', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                                                    {row.action}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Sidebar Column */}
                {selectedProperty && <SidePanel property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
            </div>
        </div>
    );
}
