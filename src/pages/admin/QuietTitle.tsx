import { useState } from 'react';
import {
    Clock,
    FileText,
    File,
    Gavel,
    CheckCircle,
    XCircle,
    FilePlus,
    UserPlus,
    AlertCircle,
    AlertTriangle,
    Info,
    ChevronDown,
    Search,
    RotateCcw,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';
import adminData from '../../data/admin.json';
import clsx from 'clsx';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Responsiveness Implemented: Mobile & Tablet support added.

export default function QuietTitle() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isMobileOrTablet = isMobile || isTablet;

    const data = adminData.quietTitle;
    const { header, actionButtons, stats, alerts, pipeline, tabs, filters, queue } = data;

    const [activeTab, setActiveTab] = useState('all');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedItems, setSelectedItems] = useState(new Set<number>());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getIcon = (iconName: string) => {
        const icons: any = { Clock, FileText, File, Gavel, CheckCircle, XCircle, FilePlus, UserPlus, AlertCircle, AlertTriangle, Info };
        const Icon = icons[iconName];
        return Icon ? <Icon size={20} /> : null;
    };

    const getStatusBadge = (stage: string, color: string) => {
        const colors: any = {
            'yellow': { bg: '#FEF3C7', text: '#B45309' },
            'orange': { bg: '#FFF7ED', text: '#C2410C' },
            'green': { bg: '#ECFDF5', text: '#059669' },
            'blue': { bg: '#EFF6FF', text: '#1D4ED8' },
            'gray': { bg: '#F1F5F9', text: '#64748B' },
            // Design specific overrides if needed
            'Need to File': { bg: '#FEF3C7', text: '#B45309' },
            'Filed': { bg: '#EFF6FF', text: '#1D4ED8' },
            'Litigation': { bg: '#FFF7ED', text: '#C2410C' },
            'Free & Clear': { bg: '#ECFDF5', text: '#059669' },
            'Pre-Foreclosure': { bg: '#F1F5F9', text: '#64748B' }
        };
        const style = colors[stage] || colors[color] || colors['gray'];
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.text,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-block'
            }}>
                {stage}
            </span>
        );
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            width: '100%',
        }}>
            <AdminNav />
            <div style={{
                paddingLeft: isMobile ? 0 : '250px',
                paddingTop: isMobile ? '60px' : 0,
                minHeight: '100vh',
                transition: 'all 0.3s ease-in-out'
            }}>
                <div style={{
                    padding: isMobile ? '16px' : '24px 32px',
                    maxWidth: '1600px',
                    margin: '0 auto'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: 24,
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 16 : 0
                    }}>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{header.title}</h1>
                            <div style={{ fontSize: 14, color: '#64748B' }}>{header.subtitle}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                            <button style={{
                                backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 6,
                                padding: '10px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                justifyContent: 'center', flex: 1
                            }}>
                                <FilePlus size={16} /> {actionButtons.fileNew.label}
                            </button>
                            <button style={{
                                backgroundColor: '#fff', color: '#1E3A5F', border: '1px solid #E2E8F0', borderRadius: 6,
                                padding: '10px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                justifyContent: 'center', flex: 1
                            }}>
                                <UserPlus size={16} /> {actionButtons.assignAttorney.label}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)'),
                        gap: 16,
                        marginBottom: 24
                    }}>
                        {stats.map((stat: any, idx: number) => {
                            const highlightColor = stat.highlight === 'yellow' ? '#B45309' : (stat.highlight === 'orange' ? '#C2410C' : (stat.highlight === 'green' ? '#059669' : '#0F172A'));
                            return (
                                <div key={idx} style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{stat.label}</span>
                                        {idx === 1 && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>}
                                        {idx === 3 && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F97316' }}></span>}
                                        {idx === 4 && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span>}
                                    </div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: highlightColor, marginBottom: 4 }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{stat.subtext}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Alerts */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        {alerts.map((alert: any, idx: number) => {
                            const styles = alert.type === 'critical'
                                ? { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', icon: <AlertCircle size={18} /> }
                                : (alert.type === 'warning'
                                    ? { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', icon: <AlertTriangle size={18} /> }
                                    : { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E3A5F', icon: <Info size={18} /> });

                            return (
                                <div key={idx} style={{
                                    backgroundColor: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 6, padding: '12px 16px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
                                    flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ color: styles.text }}>{styles.icon}</div>
                                        <div style={{ color: styles.text, fontSize: 14, fontWeight: 500 }}>
                                            <span style={{ fontWeight: 700 }}>{alert.count} {alert.type === 'critical' ? 'QT items' : (alert.type === 'warning' ? 'properties' : 'final orders')}</span> {alert.message}
                                        </div>
                                    </div>
                                    <a href="#" style={{ color: styles.text, fontSize: 14, fontWeight: 600, textDecoration: 'underline', marginTop: isMobile ? 4 : 0 }}>{alert.action}</a>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filter Bar */}
                    <div style={{
                        backgroundColor: '#fff', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 24,
                        display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
                        flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 0
                    }}>
                        <div style={{ position: 'relative', width: isMobile ? '100%' : 400 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="Search by parcel, case #, attorney..."
                                style={{
                                    width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14, outline: 'none', color: '#0F172A'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                            <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                                {filters.map((filter: any, idx: number) => (
                                    <div key={idx} style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                                        <select style={{
                                            appearance: 'none', padding: '10px 32px 10px 16px', border: '1px solid #E2E8F0', borderRadius: 6,
                                            fontSize: 14, color: '#0F172A', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 500,
                                            width: '100%'
                                        }}>
                                            {filter.options.map((opt: string, i: number) => <option key={i}>{opt}</option>)}
                                        </select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                                    </div>
                                ))}
                            </div>
                            <button style={{
                                background: 'none', border: 'none', color: '#64748B', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                textAlign: isMobile ? 'center' : 'left', padding: isMobile ? '8px 0' : 0
                            }}>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Pipeline Visualization */}
                    <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{pipeline.title}</h3>
                                <div style={{ fontSize: 13, color: '#64748B' }}>{pipeline.subtitle}</div>
                            </div>
                            {!isMobile && (
                                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', borderRadius: 6, padding: 2 }}>
                                    {pipeline.buttons.map((btn: string, i: number) => (
                                        <button key={i} style={{
                                            padding: '6px 12px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 4, cursor: 'pointer',
                                            backgroundColor: i === 0 ? '#fff' : 'transparent', color: i === 0 ? '#0F172A' : '#64748B', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                        }}>
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: isMobile ? 'flex-start' : 'space-between',
                            position: 'relative',
                            padding: isMobile ? '0' : '0 40px',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? 32 : 0
                        }}>
                            {/* Pipeline Line */}
                            {!isMobile ? (
                                <div style={{ position: 'absolute', left: 80, right: 80, top: 24, height: 2, backgroundColor: '#E2E8F0', zIndex: 0 }}></div>
                            ) : (
                                <div style={{ position: 'absolute', top: 24, bottom: 24, left: 23, width: 2, backgroundColor: '#E2E8F0', zIndex: 0 }}></div>
                            )}

                            {pipeline.stages.map((stage: any, idx: number) => {
                                const isActive = stage.active;
                                return (
                                    <div key={idx} style={{
                                        position: 'relative', zIndex: 1,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'row' : 'column',
                                        alignItems: 'center',
                                        width: isMobile ? '100%' : 140,
                                        gap: isMobile ? 16 : 0
                                    }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 8, backgroundColor: isActive ? '#fff' : '#fff',
                                            border: isActive ? '2px solid #1E3A5F' : '1px solid #E2E8F0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 0 : 12,
                                            fontSize: 18, fontWeight: 700, color: isActive ? '#1E3A5F' : '#0F172A',
                                            boxShadow: isActive ? '0 0 0 4px #EFF6FF' : 'none',
                                            flexShrink: 0
                                        }}>
                                            {stage.value}
                                        </div>
                                        <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{stage.label}</div>
                                            <div style={{ fontSize: 12, color: isActive ? '#B45309' : '#64748B' }}>{stage.subtext}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Queue Tabs */}
                    <div style={{
                        display: 'flex', gap: 32, borderBottom: '1px solid #E2E8F0', marginBottom: 0, padding: '0 8px',
                        overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '100%'
                    }}>
                        {tabs.map((tab: any, idx: number) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        background: 'none', border: 'none', borderBottom: isActive ? '2px solid #1E3A5F' : '2px solid transparent',
                                        padding: '12px 4px', fontSize: 14, fontWeight: isActive ? 600 : 500,
                                        color: isActive ? '#1E3A5F' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                                    }}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span style={{
                                            backgroundColor: isActive ? '#EFF6FF' : '#F1F5F9', color: isActive ? '#1E3A5F' : '#64748B',
                                            padding: '2px 8px', borderRadius: 12, fontSize: 12
                                        }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Queue Table Header */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                        <div style={{
                            padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
                            borderBottom: '1px solid #E2E8F0', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0
                        }}>
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{queue.title}</h3>
                                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{queue.subtitle}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                                <button style={{
                                    backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 6,
                                    padding: '8px 16px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                    flex: isMobile ? 1 : 'initial', justifyContent: 'center'
                                }}>
                                    <UserPlus size={16} /> {queue.actions.bulk}
                                </button>
                                <button style={{
                                    backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6,
                                    padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                                    flex: isMobile ? 1 : 'initial', justifyContent: 'center'
                                }}>
                                    <ArrowUpDown size={16} /> {queue.actions.sort}
                                </button>
                            </div>
                        </div>

                        {/* Table Container for Responsiveness */}
                        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: isMobile ? '400px' : 'none' }}>
                            <table style={{
                                width: '100%', borderCollapse: 'collapse', fontSize: 13,
                                minWidth: isMobile ? '1000px' : '100%' // Force horizontal scroll on mobile
                            }}>
                                <thead style={{ position: isMobile ? 'sticky' : 'static', top: 0, zIndex: 10 }}>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        {queue.tableHeaders.map((header: string, idx: number) => (
                                            <th key={idx} style={{
                                                textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600, fontSize: 12,
                                                width: idx === 0 ? 40 : 'auto',
                                                backgroundColor: '#F8FAFC' // Ensure sticky header has background
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
                                                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{row.parcelId}</div>
                                                <div style={{ fontSize: 12, color: '#1E3A5F', fontWeight: 600 }}>{row.pcigId}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{row.address}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>{row.county}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {getStatusBadge(row.stage, row.stageColor)}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {row.attorneyStatus === 'unassigned' ? (
                                                    <>
                                                        <div style={{ color: '#DC2626', fontWeight: 600, marginBottom: 2 }}>{row.attorney}</div>
                                                        <a href="#" style={{ fontSize: 12, color: '#1E3A5F', textDecoration: 'underline' }}>{row.attorneySub}</a>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ color: '#0F172A', fontWeight: 600, marginBottom: 2 }}>{row.attorney}</div>
                                                        <div style={{ fontSize: 12, color: '#64748B' }}>{row.attorneySub}</div>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px', color: row.filingDate === 'Not Filed' ? '#94A3B8' : '#0F172A' }}>{row.filingDate}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{ fontWeight: row.hearingDateBold ? 700 : 400, color: row.hearingDateBold ? '#0F172A' : '#94A3B8' }}>{row.hearingDate}</span>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: row.daysColor === 'yellow' ? '#B45309' : (row.daysColor === 'red' ? '#DC2626' : (row.daysColor === 'green' ? '#059669' : '#64748B')) }}>
                                                {row.daysInStage}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ color: '#0F172A', fontWeight: 600, marginBottom: 2 }}>{row.lastAction}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>{row.lastActionSub}</div>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: row.nextActionColor === 'red' ? '#DC2626' : (row.nextActionColor === 'yellow' ? '#D97706' : '#64748B') }}>
                                                {row.nextAction}
                                            </td>
                                            <td style={{ padding: '16px', color: '#64748B', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>...</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
