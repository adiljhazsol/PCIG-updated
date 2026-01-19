import { useState, Fragment } from 'react';
import {
    TrendingDown,
    TrendingUp,
    Scale,
    FileText,
    RotateCcw,
    Download,
    Plus,
    Search,
    ChevronDown,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping
const iconMap: { [key: string]: any } = {
    TrendingDown,
    TrendingUp,
    Scale,
    FileText
};

export default function LightweightLedger() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    const [activeTab, setActiveTab] = useState('Journal Entries');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const data = (adminData as any).lightweightLedger;
    const stats = data.stats;
    const journalEntries = data.journalEntries;

    const toggleRow = (entryNumber: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(entryNumber)) {
            newExpanded.delete(entryNumber);
        } else {
            newExpanded.add(entryNumber);
        }
        setExpandedRows(newExpanded);
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
                <div style={{
                    display: 'flex',
                    flexDirection: isMobileOrTablet ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobileOrTablet ? 'flex-start' : 'flex-start',
                    marginBottom: isMobile ? 20 : 32,
                    gap: 16
                }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Lightweight Ledger</h1>
                        <p style={{ fontSize: isMobile ? 13 : 14, color: '#64748B' }}>Internal double-entry ledger for tracking financial transactions</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#0F172A',
                            cursor: 'pointer'
                        }}>
                            <RotateCcw size={16} />
                            Recalculate
                        </button>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#0F172A',
                            cursor: 'pointer'
                        }}>
                            <Download size={16} />
                            Export
                        </button>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#2563EB',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#fff',
                            cursor: 'pointer'
                        }}>
                            <Plus size={16} />
                            Create Manual Entry
                        </button>
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
                        const Icon = iconMap[stat.icon] || FileText;
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
                                    <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: stat.color || '#64748B' }}>{stat.change || stat.subtext}</div>
                                </div>
                                <Icon size={20} color={stat.color || '#64748B'} />
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div style={{
                    borderBottom: '1px solid #E2E8F0',
                    marginBottom: isMobile ? 16 : 24,
                    display: 'flex',
                    gap: isMobile ? 16 : 32,
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {['Journal Entries', 'Property P&L', 'Fund P&L', 'Account Balances', 'Reports'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 0',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
                                color: activeTab === tab ? '#2563EB' : '#64748B',
                                fontWeight: activeTab === tab ? 600 : 500,
                                fontSize: isMobile ? 13 : 14,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: isMobile ? 12 : 16,
                    marginBottom: 24,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 12,
                    alignItems: isMobile ? 'stretch' : 'center',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ position: 'relative', flex: 1, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder={isMobile ? "Search..." : "Search entry #, description, parcel ID..."}
                            style={{
                                width: '100%',
                                maxWidth: '100%',
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
                                <option>All Transaction Types</option>
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
                                <option>All Dates</option>
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
                                <option>All Accounts</option>
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
                                <option>All Sources</option>
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

                {/* Journal Entries Table */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{
                        padding: isMobile ? 12 : 16,
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: 8
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>All Journal Entries</div>
                        {!isMobile && <div style={{ fontSize: 13, color: '#64748B' }}>Showing 1-50 of 2,450 entries</div>}
                    </div>

                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '900px' : 'auto' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', width: 40 }}></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Entry #</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Type</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Description</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Property/Fund</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Debit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Credit</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Account</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Source</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Balance</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B', width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {journalEntries.map((entry: any, idx: number) => {
                                    const isExpanded = expandedRows.has(entry.entryNumber);
                                    return (
                                        <Fragment key={idx}>
                                            <tr style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => toggleRow(entry.entryNumber)}>
                                                <td style={{ padding: '16px' }}>
                                                    {isExpanded ? <ChevronDown size={16} color="#64748B" /> : <ChevronRight size={16} color="#64748B" />}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{entry.date}</div>
                                                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{entry.time}</div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: '#2563EB' }}>{entry.entryNumber}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: entry.typeColor,
                                                        backgroundColor: entry.typeBg
                                                    }}>
                                                        {entry.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{entry.description}</div>
                                                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{entry.subDescription}</div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{entry.propertyFund}</div>
                                                    {entry.propertyAddress && <div style={{ fontSize: 11, color: '#94A3B8' }}>{entry.propertyAddress}</div>}
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{entry.debit}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#10B981', fontWeight: 500 }}>{entry.credit}</td>
                                                <td style={{ padding: '16px', fontSize: 13, color: '#475569' }}>{entry.account}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: entry.sourceColor,
                                                        backgroundColor: entry.sourceBg
                                                    }}>
                                                        {entry.source}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{entry.balance}</td>
                                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                                    <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && entry.cashEntries && entry.cashEntries.map((cashEntry: any, cashIdx: number) => (
                                                <tr key={`${idx}-cash-${cashIdx}`} style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '12px 16px' }}></td>
                                                    <td style={{ padding: '12px 16px' }} colSpan={3}>
                                                        <div style={{ fontSize: 12, color: '#64748B', paddingLeft: 24 }}>↳ {cashEntry.description}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }} colSpan={2}></td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#DC2626' }}>{cashEntry.debit}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#10B981' }}>{cashEntry.credit}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569' }}>{cashEntry.account}</td>
                                                    <td style={{ padding: '12px 16px' }}></td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{cashEntry.balance}</td>
                                                    <td style={{ padding: '12px 16px' }}></td>
                                                </tr>
                                            ))}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
}
