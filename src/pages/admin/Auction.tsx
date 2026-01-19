import { useState } from 'react';
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
    MoreHorizontal
} from 'lucide-react';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Responsive implementation for Auction Module

export default function Auction() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const data = adminData.auction;
    const { header, actionButtons, stats, tabs, filters, queue } = data;

    const [activeTab, setActiveTab] = useState('auction-ready');

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
                        {filters.map((filter: any, idx: number) => (
                            <div key={idx} style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                                <select style={{
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
                                    {filter.options.map((opt: string, i: number) => <option key={i}>{opt}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            </div>
                        ))}
                        <button style={{
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
                        <button style={{
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
                            <Download size={16} /> {actionButtons.exportSheets.label}
                        </button>
                        <button style={{
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
                            <Upload size={16} /> {actionButtons.importResults.label}
                        </button>
                        <button style={{
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
                        }}>
                            <Plus size={16} /> {actionButtons.createAuction.label}
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
                                    {queue.tableHeaders.map((header: string, idx: number) => (
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
                                {queue.rows.map((row: any, idx: number) => (
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
                                            {row.status === 'Today' ? (
                                                <button style={{
                                                    backgroundColor: '#1E3A5F',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    padding: '6px 12px',
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}>
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
        </div>
    );
}
