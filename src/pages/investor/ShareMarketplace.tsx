import { useState } from 'react';
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
    ChevronRight
} from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';
import InvestorNav from '../../components/investor/InvestorNav';

// Icon mapping for stats
const iconMap: { [key: string]: any } = {
    PieChart,
    Briefcase,
    Tag,
    ArrowRightLeft
};

export default function ShareMarketplace() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const [activeTab, setActiveTab] = useState(investorsData.shareMarketplace.defaultTab);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy] = useState('Newest');
    const [viewMode, setViewMode] = useState('grid');

    const listings = investorsData.shareMarketplace.items;

    // Simple filter logic
    const filteredListings = listings.filter(item => {
        if (activeFilter !== 'All' && activeFilter !== 'My Shares' && activeFilter !== 'My Listings') { // "For Sale" logic if simpler
            // For this mock, we'll just check if badge matches active filter roughly
            if (activeFilter === 'For Sale' && item.badge !== 'For Sale') return false;
        }
        // "My Shares"/"My Listings" logic would go here in real app

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return item.propertyAddress.toLowerCase().includes(q) ||
                item.location.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q);
        }
        return true;
    });

    const stats = investorsData.shareMarketplace.stats;

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
                            }}>{investorsData.shareMarketplace.title}</h1>
                            <p style={{
                                fontSize: `clamp(13px, 1.5vw, 15px)`,
                                color: '#64748B',
                                lineHeight: 1.5
                            }}>{investorsData.shareMarketplace.subtitle}</p>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            <button style={{
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
                            <button style={{
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
                                {investorsData.shareMarketplace.filters.map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 20,
                                            fontSize: 13,
                                            fontWeight: 500,
                                            border: 'none',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            backgroundColor: activeFilter === filter ? '#1E3A5F' : '#F1F5F9',
                                            color: activeFilter === filter ? '#fff' : '#64748B',
                                            flexShrink: 0
                                        }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: 'none', backgroundColor: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    Advanced Filters <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
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
                        {investorsData.shareMarketplace.tabs.map(tab => (
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
                        <div style={{ fontSize: 13, color: '#64748B' }}>Showing {filteredListings.length} available share blocks</div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 4, padding: 2 }}>
                                <button onClick={() => setViewMode('grid')} style={{ padding: 6, border: 'none', backgroundColor: viewMode === 'grid' ? '#E2E8F0' : 'transparent', borderRadius: 4, cursor: 'pointer' }}><LayoutGrid size={16} color="#64748B" /></button>
                                <button onClick={() => setViewMode('list')} style={{ padding: 6, border: 'none', backgroundColor: viewMode === 'list' ? '#E2E8F0' : 'transparent', borderRadius: 4, cursor: 'pointer' }}><List size={16} color="#64748B" /></button>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, backgroundColor: '#fff', fontSize: 13, color: '#0F172A', cursor: 'pointer' }}>
                                    Sort by: {sortBy} <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 'clamp(12px, 1.5vw, 16px)' }}>
                        {filteredListings.map((item, idx) => (
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
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.sharesAvailable.split(' ')[0]} shares</div>
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
                                    <button style={{ width: '100%', padding: '10px', backgroundColor: '#1E3A5F', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                        Buy Shares
                                    </button>
                                ) : item.status === 'pending' ? (
                                    <button style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'not-allowed' }}>
                                        Pending Sale
                                    </button>
                                ) : (
                                    <button style={{ width: '100%', padding: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: 'pointer' }}>
                                        View Details
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination (Mock) */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 32, gap: 16 }}>
                        <button style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94A3B8' }}><ChevronLeft size={16} /></button>
                        <button style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#1E3A5F', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13 }}>1</button>
                        <button style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#fff', color: '#64748B', border: 'none', fontWeight: 500, fontSize: 13 }}>2</button>
                        <button style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#fff', color: '#64748B', border: 'none', fontWeight: 500, fontSize: 13 }}>3</button>
                        <button style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#64748B' }}><ChevronRight size={16} /></button>
                    </div>

                </div>
            </div>
        </>
    );
}
