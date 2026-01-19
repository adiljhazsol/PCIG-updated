import { useState } from 'react';
import {
    TrendingUp,
    Activity,
    Home,
    PieChart,
    Search,
    Download,
    RotateCcw,
    MoreHorizontal,
    Pause
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

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
    // const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set()); // Not strictly needed for this design yet, but good to have if we expanding rows
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const data = (adminData as any).interestCalculation;
    const stats = data.stats;
    const propertyInterest = data.propertyInterest;

    // Engine status
    const engineStatus = data.engineStatus;

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
        if (selectedRows.size === propertyInterest.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(propertyInterest.map((item: any) => item.id)));
        }
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
                    {/* Breadcrumb-like title or just page title? Design shows "Interest Calc" in nav, title here implies Dashboard context maybe? 
                       Design shows: TaxDeedInvest Admin ... Interest Calc (in top nav). 
                       Then content area.
                   */}
                    {/* Actually the image shows standard header area. Let's stick to consistent header. */}
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
                        <button style={{
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
                        }}>
                            <Download size={16} />
                            {!isMobile && "Export Report"}
                        </button>
                        <button style={{
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
                        }}>
                            <RotateCcw size={16} />
                            {isMobile ? "Recalculate" : "Recalculate All"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : 'auto' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '16px', width: 40, textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={propertyInterest.length > 0 && selectedRows.size === propertyInterest.length}
                                            onChange={toggleAllSelection}
                                            style={{ accentColor: '#1E3A5F', cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Property</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Interest Type</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Rate</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Principal</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Accrued Interest</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Per-Day</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Start Date</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                    <th style={{ padding: '12px 16px', width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {propertyInterest.map((item: any) => (
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
                        <button style={{
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

            </div>
        </div>
    );
}
