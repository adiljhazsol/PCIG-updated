import { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    LayoutGrid,
    List,
    PieChart,
    Briefcase,
    Tag,
    ArrowRightLeft,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
// Removed static data import
import InvestorNav from '../../components/investor/InvestorNav';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Icon mapping for stats
const iconMap: { [key: string]: any } = {
    PieChart,
    Briefcase,
    Tag,
    ArrowRightLeft
};

interface ShareListing {
    id: string;
    rawId?: number;
    propertyId?: number;
    propertyAddress: string;
    location: string;
    badge: string;
    badgeColor: string;
    badgeBg: string;
    sharesAvailable: string;
    totalShares: string;
    pricePerShare: string;
    ownership: string;
    totalPrice: string;
    seller: string;
    listedTime: string;
    status: string;
}

const FILTER_TABS = ["Available Shares", "My Shares", "My Listings", "Share Transfer History", "Buy/Sell Orders"];
const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function ShareMarketplace() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Available Shares');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Advanced Filter States
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minShares, setMinShares] = useState('');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const [listings, setListings] = useState<ShareListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [meta, setMeta] = useState<any>(null);
    
    // Stats State
    const [activeListingsCount, setActiveListingsCount] = useState("142");
    const [statsData, setStatsData] = useState({
        total_volume: 0,
        active_listings: 0,
        avg_price: 0,
        my_trades: 0
    });

    // Buy Modal State
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<ShareListing | null>(null);
    const [buySuccess, setBuySuccess] = useState(false);
    const [sharesToBuy, setSharesToBuy] = useState(1);

    const fetchStats = async () => {
        try {
            const response = await api.get('/investor/shares/stats');
            if (response.data.success) {
                setStatsData(response.data.data);
                // Update active listings count from stats
                setActiveListingsCount(response.data.data.active_listings.toString());
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '/investor/shares/available';
            const params: any = {
                page: currentPage,
                per_page: 12,
                sort_by: 'created_at',
                sort_order: 'desc'
            };

            // Map sort options
            if (sortBy === 'Price: Low to High') {
                params.sort_by = 'price_per_share';
                params.sort_order = 'asc';
            } else if (sortBy === 'Price: High to Low') {
                params.sort_by = 'price_per_share';
                params.sort_order = 'desc';
            }

            // Add filters
            if (searchQuery) params.search = searchQuery;
            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;
            if (minShares) params.min_shares = minShares;

            // Tab Logic
            if (activeTab === 'My Listings') {
                endpoint = '/investor/shares/my-listings';
            } else if (activeTab === 'My Shares') {
                endpoint = '/investor/shares/portfolio'; 
            } else if (activeTab === 'Available Shares') {
                endpoint = '/investor/shares/available';
            } else if (activeTab === 'Share Transfer History') {
                endpoint = '/investor/shares/transactions';
                params.type = 'history';
            } else if (activeTab === 'Buy/Sell Orders') {
                endpoint = '/investor/shares/transactions';
                params.type = 'orders';
            }
            
            const response = await api.get(endpoint, { params });
            
            if (response.data.success) {
                const mappedListings = response.data.data.map((item: any) => {
                    let badgeLabel = item.status === 'active' ? 'For Sale' : (item.status === 'owned' ? 'Owned' : (item.status.charAt(0).toUpperCase() + item.status.slice(1)));
                    let badgeColor = '#64748B';
                    let badgeBg = '#F1F5F9';

                    if (item.status === 'active') {
                        badgeColor = '#10B981';
                        badgeBg = '#DCFCE7';
                    } else if (item.status === 'owned') {
                        badgeColor = '#3B82F6';
                        badgeBg = '#DBEAFE';
                    } else if (item.status === 'completed') {
                        badgeColor = '#10B981';
                        badgeBg = '#DCFCE7';
                    } else if (item.status === 'pending') {
                        badgeLabel = 'Pending';
                        badgeColor = '#F59E0B';
                        badgeBg = '#FEF3C7';
                    }

                    return {
                        id: (typeof item.id === 'string' && item.id.startsWith('INV-')) ? item.id : `SHARE-${item.id}`,
                        rawId: item.rawId || item.id,
                        propertyId: item.property?.id,
                        propertyAddress: item.property?.address || 'Unknown Property',
                        location: `${item.property?.city || ''}, ${item.property?.state || ''} ${item.property?.zip || ''}`,
                        badge: badgeLabel,
                        badgeColor: badgeColor,
                        badgeBg: badgeBg,
                        sharesAvailable: `${item.shares} shares`,
                        totalShares: '', 
                        pricePerShare: `$${parseFloat(item.price_per_share).toFixed(2)}`,
                        ownership: '', 
                        totalPrice: `$${parseFloat(item.total_price).toLocaleString()}`,
                        seller: item.seller?.name || (item.seller_id === item.property?.id ? 'Sponsor' : 'Investor'),
                        listedTime: new Date(item.created_at).toLocaleDateString(),
                        status: item.status
                    };
                });
                setListings(mappedListings);
                setMeta(response.data.meta);
                
                // Update active listings count from meta if we are on the main tab
                if (activeTab === 'Available Shares' && response.data.meta) {
                    setActiveListingsCount(response.data.meta.total.toString());
                }
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // When filters change, reset page to 1
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, minPrice, maxPrice, minShares, sortBy]);

    // When parameters change (including page), fetch with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, currentPage, sortBy, searchQuery, minPrice, maxPrice, minShares]);

    const handleBuy = (listing: ShareListing) => {
        setSelectedListing(listing);
        setSharesToBuy(1);
        setBuySuccess(false);
        setPurchaseError(null);
        setIsBuyModalOpen(true);
    };

    const confirmPurchase = async () => {
        if (!selectedListing?.rawId) return;

        try {
            setLoading(true);
            setPurchaseError(null);
            const response = await api.post(`/investor/shares/buy/${selectedListing.rawId}`, {
                shares: sharesToBuy
            });
            if (response.data.success) {
                setBuySuccess(true);
                fetchListings(); // Refresh list in background
                fetchStats(); // Refresh stats
            }
        } catch (err: any) {
            setPurchaseError(err.response?.data?.message || 'Failed to purchase shares');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && (!meta || newPage <= meta.last_page)) {
            setCurrentPage(newPage);
        }
    };

    const stats = [
        { label: "Total Volume", value: `$${(statsData.total_volume || 0).toLocaleString()}`, subtext: "Total traded volume", icon: "PieChart" },
        { label: "Active Listings", value: activeListingsCount, subtext: "Available now", icon: "Briefcase" },
        { label: "Avg Share Price", value: `$${(statsData.avg_price || 0).toFixed(2)}`, subtext: "Across all properties", icon: "Tag" },
        { label: "My Trades", value: (statsData.my_trades || 0).toString(), subtext: "Last 30 days", icon: "ArrowRightLeft" }
    ];


    return (
        <>
            <div style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                backgroundColor: '#F8FAFC',
                minHeight: '100vh',
                width: '100%',
                overflowX: 'hidden'
            }}>
                <InvestorNav />

                <div style={{
                    padding: `clamp(16px, 2vh, 24px) clamp(16px, 2.5vw, 48px)`,
                    width: '100%',
                    boxSizing: 'border-box',
                    maxWidth: '1440px',
                    margin: '0 auto'
                }}>

                    {/* Header */}
                    <div style={{
                        marginBottom: 'clamp(24px, 3vh, 32px)',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'flex-end',
                        gap: 'clamp(16px, 2vh, 24px)'
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: `clamp(20px, 4vw, 28px)`,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 8,
                                lineHeight: 1.2
                            }}>Share Marketplace</h1>
                            <p style={{
                                fontSize: `clamp(13px, 1.5vw, 15px)`,
                                color: '#64748B',
                                lineHeight: 1.5
                            }}>Buy and sell property shares with other investors</p>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            <button 
                                onClick={() => navigate('/investor/share-marketplace/list')}
                                style={{
                                backgroundColor: '#1E3A5F',
                                color: '#fff',
                                padding: '10px 16px',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                                flex: isMobile ? 1 : 'initial',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                List Shares
                            </button>
                            <button 
                                onClick={() => setActiveTab('My Listings')}
                                style={{
                                backgroundColor: '#fff',
                                color: '#0F172A',
                                border: '1px solid #E2E8F0',
                                padding: '10px 16px',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                flex: isMobile ? 1 : 'initial',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                My Listings
                            </button>
                            <button 
                                onClick={() => setActiveTab('My Shares')}
                                style={{
                                backgroundColor: '#fff',
                                color: '#0F172A',
                                border: '1px solid #E2E8F0',
                                padding: '10px 16px',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                flex: isMobile ? 1 : 'initial',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                My Portfolio
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
                        gap: 'clamp(12px, 1.5vw, 16px)',
                        marginBottom: 'clamp(24px, 3vh, 32px)'
                    }}>
                        {stats.map((stat, idx) => {
                            const Icon = iconMap[stat.icon] || PieChart;
                            return (
                                <div key={idx} style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 8,
                                    padding: 'clamp(16px, 2vh, 20px)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
                                        <Icon size={18} color="#94A3B8" />
                                    </div>
                                    <div style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: '#64748B' }}>{stat.subtext}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Search/Filter Toolbar */}
                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: 'clamp(12px, 2vh, 16px)',
                        marginBottom: 'clamp(20px, 2.5vh, 24px)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, justifyContent: 'space-between' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: isMobile ? '100%' : 500 }}>
                                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Search by property address, ID..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 36px',
                                        fontSize: 14,
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 8,
                                overflowX: 'auto',
                                paddingBottom: isMobile ? 4 : 0,
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none'  // IE/Edge
                            }}>
                                <button
                                    onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '8px 12px',
                                        border: 'none',
                                        backgroundColor: advancedFiltersOpen ? '#E2E8F0' : 'transparent',
                                        color: advancedFiltersOpen ? '#1E3A5F' : '#64748B',
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        borderRadius: 6
                                    }}
                                >
                                    Advanced Filters <ChevronDown size={14} style={{ transform: advancedFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                            </div>
                        </div>

                        {/* Advanced Filters Panel */}
                        {advancedFiltersOpen && (
                            <div style={{
                                marginTop: 16,
                                paddingTop: 16,
                                borderTop: '1px solid #E2E8F0',
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 16
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                                        Min Price Per Share ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            fontSize: 13,
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 6,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                                        Max Price Per Share ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="10000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            fontSize: 13,
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 6,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
                                        Min Shares Available
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={minShares}
                                        onChange={(e) => setMinShares(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            fontSize: 13,
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 6,
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        onClick={() => {
                                            setMinPrice('');
                                            setMaxPrice('');
                                            setMinShares('');
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: 13,
                                            color: '#64748B',
                                            backgroundColor: '#F1F5F9',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div style={{
                        borderBottom: '1px solid #E2E8F0',
                        marginBottom: 'clamp(20px, 2.5vh, 24px)',
                        display: 'flex',
                        gap: 'clamp(16px, 2vw, 24px)',
                        overflowX: 'auto',
                        scrollbarWidth: 'none'
                    }}>
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 0',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid #1E3A5F' : '2px solid transparent',
                                    color: activeTab === tab ? '#1E3A5F' : '#64748B',
                                    fontWeight: activeTab === tab ? 600 : 500,
                                    fontSize: `clamp(13px, 1.5vw, 14px)`,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Results Info */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: 16,
                        gap: 12
                    }}>
                        <div style={{ fontSize: 13, color: '#64748B' }}>Showing {meta ? meta.total : listings.length} available share blocks</div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 4, padding: 2 }}>
                                <button onClick={() => setViewMode('grid')} style={{ padding: 6, border: 'none', backgroundColor: viewMode === 'grid' ? '#E2E8F0' : 'transparent', borderRadius: 4, cursor: 'pointer' }}><LayoutGrid size={16} color="#64748B" /></button>
                                <button onClick={() => setViewMode('list')} style={{ padding: 6, border: 'none', backgroundColor: viewMode === 'list' ? '#E2E8F0' : 'transparent', borderRadius: 4, cursor: 'pointer' }}><List size={16} color="#64748B" /></button>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        backgroundColor: '#fff',
                                        fontSize: 13,
                                        color: '#0F172A',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Sort by: {sortBy} <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                {showSortMenu && (
                                    <>
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                                            onClick={() => setShowSortMenu(false)}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: 4,
                                            backgroundColor: '#fff',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 6,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            zIndex: 20,
                                            minWidth: 160
                                        }}>
                                            {SORT_OPTIONS.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setShowSortMenu(false);
                                                    }}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '8px 16px',
                                                        border: 'none',
                                                        backgroundColor: sortBy === option ? '#F1F5F9' : 'transparent',
                                                        color: sortBy === option ? '#1E3A5F' : '#64748B',
                                                        fontSize: 13,
                                                        fontWeight: sortBy === option ? 600 : 400,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                            <Loader2 className="animate-spin" size={32} color="#1E3A5F" />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#EF4444' }}>
                            {error}
                        </div>
                    ) : listings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                            No listings found matching your criteria.
                        </div>
                    ) : viewMode === 'list' ? (
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: `clamp(8px, 1vw, 12px)`,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden',
                            overflowX: 'auto',
                            marginBottom: `clamp(24px, 3vh, 32px)`
                        }}>
                            {!isMobile ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>ID</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Property</th>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Location</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Shares</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Price/Share</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Total</th>
                                            <th style={{ padding: '16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: idx < listings.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                                                <td style={{ padding: '16px', fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{item.id}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.propertyAddress}</div>
                                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: item.badgeBg, color: item.badgeColor, marginTop: 4, display: 'inline-block' }}>{item.badge}</span>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: 13, color: '#64748B' }}>{item.location}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.sharesAvailable}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{item.pricePerShare}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.totalPrice}</td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        padding: '4px 8px', 
                                                        borderRadius: 12, 
                                                        fontSize: 12, 
                                                        fontWeight: 500,
                                                        backgroundColor: item.status === 'active' ? '#DCFCE7' : '#F1F5F9',
                                                        color: item.status === 'active' ? '#166534' : '#64748B',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                                    {item.status === 'active' ? (
                                                        <button 
                                                            onClick={() => handleBuy(item)}
                                                            style={{ padding: '8px 16px', backgroundColor: '#1E3A5F', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                            Buy Shares
                                                        </button>
                                                    ) : (
                                                        <button style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'not-allowed', whiteSpace: 'nowrap' }}>
                                                            {item.status === 'pending' ? 'Pending' : 'View'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
                                    {listings.map((item, idx) => (
                                        <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E3A5F' }}>{item.id}</span>
                                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: item.badgeBg, color: item.badgeColor, fontWeight: 600 }}>{item.badge}</span>
                                            </div>
                                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{item.propertyAddress}</h3>
                                            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>{item.location}</div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                                <div>
                                                    <div style={{ fontSize: 11, color: '#64748B' }}>Shares</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.sharesAvailable}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 11, color: '#64748B' }}>Price</div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{item.pricePerShare}</div>
                                                </div>
                                            </div>
                                            
                                            {item.status === 'active' ? (
                                                <button 
                                                    onClick={() => handleBuy(item)}
                                                    style={{ width: '100%', padding: '10px', backgroundColor: '#1E3A5F', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                                    Buy Shares
                                                </button>
                                            ) : (
                                                <button style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'not-allowed' }}>
                                                    {item.status === 'pending' ? 'Pending Sale' : 'View Details'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 'clamp(12px, 1.5vw, 16px)' }}>
                        {listings.map((item, idx) => (
                            <div key={idx} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 'clamp(16px, 2vh, 20px)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>{item.id}</div>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        backgroundColor: item.badgeBg || '#F1F5F9', // Fallback color
                                        color: item.badgeColor || '#64748B'     // Fallback text color 
                                    }}>
                                        {item.badge}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: `clamp(15px, 1.5vw, 16px)`, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>{item.propertyAddress}</h3>
                                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>{item.location}</div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                    padding: '16px 0',
                                    borderTop: '1px solid #F1F5F9',
                                    borderBottom: '1px solid #F1F5F9',
                                    marginBottom: 16
                                }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Shares Available</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.sharesAvailable}</div>
                                        <div style={{ fontSize: 10, color: '#94A3B8' }}>{item.totalShares}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Price Per Share</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1E3A5F' }}>{item.pricePerShare}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Ownership</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.ownership}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 2 }}>Total Price</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.totalPrice}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748B', marginBottom: 16 }}>
                                    <span>Seller: {item.seller}</span>
                                    <span>{item.listedTime}</span>
                                </div>

                                {item.status === 'active' ? (
                                    <button 
                                        onClick={() => handleBuy(item)}
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#1E3A5F', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                        Buy Shares
                                    </button>
                                ) : item.status === 'pending' ? (
                                    <button style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'not-allowed' }}>
                                        Pending Sale
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => item.propertyId && navigate(`/investor/properties/${item.propertyId}`)}
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>
                                        View Details
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    )}


                    {/* Pagination */}
                    {meta && meta.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 8 }}>
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ border: 'none', backgroundColor: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#CBD5E1' : '#64748B' }}>
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(page => (
                                <button 
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    style={{ 
                                        width: 32, 
                                        height: 32, 
                                        borderRadius: 6, 
                                        backgroundColor: currentPage === page ? '#1E3A5F' : '#fff', 
                                        color: currentPage === page ? '#fff' : '#64748B', 
                                        border: 'none', 
                                        fontWeight: currentPage === page ? 600 : 500, 
                                        fontSize: 13,
                                        cursor: 'pointer'
                                    }}>
                                    {page}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === meta.last_page}
                                style={{ border: 'none', backgroundColor: 'transparent', cursor: currentPage === meta.last_page ? 'not-allowed' : 'pointer', color: currentPage === meta.last_page ? '#CBD5E1' : '#64748B' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Buy Shares Modal */}
            {isBuyModalOpen && (
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
                    padding: 16
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        width: '100%',
                        maxWidth: 450,
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    }}>
                        {!buySuccess ? (
                            <>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Confirm Purchase</h3>
                                    <button 
                                        onClick={() => setIsBuyModalOpen(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ padding: 24 }}>
                                    {purchaseError && (
                                        <div style={{ 
                                            backgroundColor: '#FEF2F2', 
                                            color: '#B91C1C', 
                                            padding: '12px', 
                                            borderRadius: 8, 
                                            marginBottom: 20, 
                                            fontSize: 14,
                                            border: '1px solid #FECACA',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            <AlertCircle size={16} />
                                            {purchaseError}
                                        </div>
                                    )}
                                    <p style={{ margin: '0 0 20px 0', fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>
                                        You are about to purchase shares in this property. Please review the details below.
                                    </p>
                                    
                                    <div style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>Property</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'right' }}>{selectedListing?.propertyAddress}</span>
                                        </div>
                                        
                                        {/* Shares Input Logic */}
                                        {(() => {
                                            const price = parseFloat((selectedListing?.pricePerShare || '').replace(/[^0-9.]/g, '')) || 0;
                                            const maxShares = parseInt((selectedListing?.sharesAvailable || '').replace(/[^0-9]/g, '')) || 0;
                                            const total = sharesToBuy * price;
                                            
                                            return (
                                                <>
                                                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: 13, color: '#64748B' }}>Shares to Buy</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontSize: 11, color: '#64748B' }}>(Max: {maxShares})</span>
                                                            <input 
                                                                type="number" 
                                                                min="1" 
                                                                max={maxShares}
                                                                value={sharesToBuy}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val)) {
                                                                        if (val > maxShares) setSharesToBuy(maxShares);
                                                                        else if (val < 1) setSharesToBuy(1);
                                                                        else setSharesToBuy(val);
                                                                    } else {
                                                                        setSharesToBuy(1);
                                                                    }
                                                                }}
                                                                style={{ 
                                                                    width: 80, 
                                                                    padding: '6px 8px', 
                                                                    borderRadius: 4, 
                                                                    border: '1px solid #CBD5E1',
                                                                    textAlign: 'right',
                                                                    fontSize: 13,
                                                                    fontWeight: 600,
                                                                    outline: 'none'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 13, color: '#64748B' }}>Price per Share</span>
                                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{selectedListing?.pricePerShare}</span>
                                                    </div>
                                                    <div style={{ paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Total Price</span>
                                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F' }}>${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button 
                                            onClick={() => setIsBuyModalOpen(false)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#fff',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: 6,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: '#64748B',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={confirmPurchase}
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#1E3A5F',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: '#fff',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 8
                                            }}
                                        >
                                            {loading && <Loader2 size={16} className="animate-spin" />}
                                            Confirm Purchase
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                                <div style={{ 
                                    width: 48, height: 48, borderRadius: '50%', backgroundColor: '#DCFCE7', 
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' 
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Purchase Successful!</h3>
                                <p style={{ margin: '0 0 24px 0', fontSize: 14, color: '#64748B' }}>
                                    You have successfully purchased {sharesToBuy} shares of {selectedListing?.propertyAddress}.
                                </p>
                                <button 
                                    onClick={() => {
                                        setIsBuyModalOpen(false);
                                        setBuySuccess(false);
                                        setSelectedListing(null);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#1E3A5F',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
