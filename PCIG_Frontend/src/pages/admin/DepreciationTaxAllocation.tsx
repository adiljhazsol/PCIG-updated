import { useState, useEffect, useRef } from 'react';
import {
    TrendingDown,
    Home,
    Users,
    AlertCircle,
    Search,
    ChevronDown,
    ChevronRight,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Responsive implementation for Depreciation & Tax Allocation Module

export default function DepreciationTaxAllocation() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('property-depreciation');
    const [selectedProperty, setSelectedProperty] = useState(0);
    const [showConfigPanel, setShowConfigPanel] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [yearFilter, setYearFilter] = useState('2023');
    const [assetTypeFilter, setAssetTypeFilter] = useState('All Assets');
    
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async (query = searchQuery, year = yearFilter, assetType = assetTypeFilter) => {
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            if (year) params.append('year', year);
            if (assetType && assetType !== 'All Assets') params.append('assetType', assetType);

            const response = await api.get(`/admin/depreciation/dashboard-data?${params.toString()}`);
            setData(response.data.depreciationTaxAllocation);
            setError(null);
        } catch (err) {
            console.error('Error fetching depreciation data:', err);
            setError('Failed to load depreciation data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [yearFilter, assetTypeFilter]);

    // Debounced search effect
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        if (loading && !searchQuery) return;

        searchTimeoutRef.current = setTimeout(() => {
            fetchData(searchQuery);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const { 
        header = { title: 'Depreciation & Tax Allocation', subtitle: 'Manage asset depreciation and tax allocations' },
        stats = [],
        tabs = [],
        filters = { year: { label: 'Tax Year', options: [] }, assetType: { label: 'Asset Type', options: [] } },
        taxYearBadge = { label: 'Tax Year', value: '2023' },
        table = { headers: [], rows: [] },
        configPanel = { title: 'Depreciation Rules', rules: [] }
    } = data || {};

    const getIcon = (iconName: string) => {
        const icons: any = { TrendingDown, Home, Users, AlertCircle };
        const Icon = icons[iconName];
        return Icon ? <Icon size={20} /> : null;
    };

    const getStatusBadge = (status: string, color: string) => {
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

    const getMethodBadge = (method: string, color: string) => {
        const colors: any = {
            'blue': { bg: '#EFF6FF', text: '#6474BB' },
            'purple': { bg: '#F5F3FF', text: '#7C3AED' },
            'orange': { bg: '#FFF7ED', text: '#B45309' },
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
                fontWeight: 600,
                display: 'inline-block'
            }}>
                {method}
            </span>
        );
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
                    <div>Loading depreciation data...</div>
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
                    <div>{error}</div>
                </div>
            </div>
        );
    }

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

                {/* Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: isMobile ? 16 : 32,
                    borderBottom: '1px solid #E2E8F0',
                    marginBottom: 24,
                    overflowX: isMobile ? 'auto' : 'visible',
                    whiteSpace: isMobile ? 'nowrap' : 'normal'
                }}>
                    {tabs.map((tab: any, idx: number) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid #1E3A5F' : '2px solid transparent',
                                    padding: '12px 4px',
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? '#1E3A5F' : '#64748B',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                {tab.label}
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
                                placeholder="Search properties, parcel IDs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    fontSize: 14,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                            <div style={{ position: 'relative', flex: isMobile ? 1 : 'initial' }}>
                                <select 
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    style={{
                                        appearance: 'none',
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        padding: '10px 32px 10px 12px',
                                        fontSize: 14,
                                        color: '#64748B',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {/* Map options directly. Backend should provide all valid years. */}
                                    {filters.year.options.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                            </div>
                            <div style={{ position: 'relative', flex: isMobile ? 1 : 'initial' }}>
                                <select 
                                    value={assetTypeFilter}
                                    onChange={(e) => setAssetTypeFilter(e.target.value)}
                                    style={{
                                        appearance: 'none',
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        padding: '10px 32px 10px 12px',
                                        fontSize: 14,
                                        color: '#64748B',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    <option value="All Assets">All Assets</option>
                                    {filters.assetType.options.filter((o: string) => o !== 'All Assets').map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#F1F5F9',
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: isMobile ? 'center' : 'flex-start'
                    }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>{taxYearBadge.label}:</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{taxYearBadge.value}</span>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: isTablet ? 'column' : 'row',
                    gap: 24
                }}>
                    {/* Data Table */}
                    <div style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                                        <th style={{ padding: 16, textAlign: 'left', width: 40 }}>
                                            <input type="checkbox" style={{ borderRadius: 4, border: '1px solid #CBD5E1' }} />
                                        </th>
                                        {table.headers.map((header: string, idx: number) => (
                                            <th key={idx} style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {header}
                                            </th>
                                        ))}
                                        <th style={{ padding: 16, width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {table.rows.map((row: any, idx: number) => (
                                        <tr
                                            key={idx}
                                            style={{
                                                borderBottom: '1px solid #E2E8F0',
                                                cursor: 'pointer',
                                                backgroundColor: selectedProperty === idx ? '#F8FAFC' : 'transparent'
                                            }}
                                            onClick={() => {
                                                setSelectedProperty(idx);
                                                if (isMobile || isTablet) setShowConfigPanel(true);
                                            }}
                                        >
                                            <td style={{ padding: 16 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProperty === idx}
                                                    onChange={() => setSelectedProperty(idx)}
                                                    style={{ borderRadius: 4, border: '1px solid #CBD5E1' }}
                                                />
                                            </td>
                                            <td style={{ padding: 16 }}>
                                                <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{row.asset}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>ID: {row.id}</div>
                                            </td>
                                            <td style={{ padding: 16, fontSize: 14, color: '#64748B' }}>{row.type}</td>
                                            <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{row.costBasis}</td>
                                            <td style={{ padding: 16 }}>
                                                {getMethodBadge(row.method, row.methodColor)}
                                            </td>
                                            <td style={{ padding: 16, fontSize: 14, color: '#64748B' }}>{row.recoveryPeriod}</td>
                                            <td style={{ padding: 16, fontSize: 14, color: '#64748B' }}>{row.placedInService}</td>
                                            <td style={{ padding: 16, fontSize: 14, color: '#64748B' }}>{row.accumulated}</td>
                                            <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{row.currentYear}</td>
                                            <td style={{ padding: 16, fontSize: 14, color: '#64748B' }}>{row.netBookValue}</td>
                                            <td style={{ padding: 16 }}>
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{
                            padding: 16,
                            borderTop: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: 13, color: '#64748B' }}>Showing 1-{table.rows.length} of {table.rows.length} assets</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Previous</button>
                                <button style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Next</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Config Panel - Desktop: Always visible, Mobile/Tablet: Overlay/Drawer */}
                    {(!isMobile && !isTablet) && (
                        <div style={{
                            width: 320,
                            flexShrink: 0
                        }}>
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                padding: 20
                            }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>{configPanel.title}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {configPanel.rules.map((rule: any, idx: number) => (
                                        <div key={idx} style={{ paddingBottom: 12, borderBottom: idx < configPanel.rules.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{rule.label}</div>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{rule.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <button style={{
                                    width: '100%',
                                    marginTop: 20,
                                    padding: '10px',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8
                                }}>
                                    View Schedule <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
