import React, { useState, CSSProperties } from 'react';
import {
    Mail,
    Clock,
    Send,
    Hourglass,
    CheckCircle2,
    AlertTriangle,
    Search,
    ChevronDown,
    FileText,
    ArrowRight
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

const iconMap: { [key: string]: any } = {
    Mail,
    Clock,
    Send,
    Hourglass,
    CheckCircle2,
    AlertTriangle,
    FileText
};

export default function Barment() {
    // Media Queries
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const barmentData = (adminData as any).barment;
    const header = barmentData.header;
    const actionButtons = barmentData.actionButtons;
    const statsCards = barmentData.statsCards;
    const alerts = barmentData.alerts;
    const tabs = barmentData.tabs;
    const filters = barmentData.filters;
    const queue = barmentData.queue;
    const timeline = barmentData.timeline;
    const logs = barmentData.letterLogs;

    const [activeTab, setActiveTab] = useState('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const pageWrapperStyle: CSSProperties = {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden'
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

    const getStatusBadge = (status: { label: string, color: string } | string) => {
        if (typeof status === 'string') {
            // Simple string status (e.g. "Delivered" in logs)
            let bg = '#F1F5F9';
            let color = '#64748B';
            if (status === 'Delivered') { bg = '#ECFDF5'; color = '#059669'; }
            return (
                <span style={{ backgroundColor: bg, color: color, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                    {status}
                </span>
            );
        }

        let bg = '#F1F5F9';
        let color = '#64748B';
        let borderColor = 'transparent';

        if (status.color === 'active') {
            bg = '#EFF6FF';
            color = '#1E3A5F';
            borderColor = '#BFDBFE';
        } else if (status.color === 'critical') {
            bg = '#FEF2F2';
            color = '#DC2626';
            borderColor = '#FECACA';
        } else if (status.color === 'warning') {
            bg = '#FFF7ED';
            color = '#C2410C';
            borderColor = '#FED7AA';
        } else if (status.color === 'success') {
            bg = '#ECFDF5';
            color = '#059669';
            borderColor = '#6EE7B7';
        }

        return (
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
        );
    };

    const getTimelineStepStyle = (status: string) => {
        if (status === 'completed') return { bg: '#10B981', color: '#fff', border: '#10B981' }; // Green
        if (status === 'active') return { bg: '#fff', color: '#1E3A5F', border: '#1E3A5F' }; // Blue border
        return { bg: '#fff', color: '#94A3B8', border: '#E2E8F0' }; // Gray
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
                            <Mail size={16} />
                            {actionButtons.generateLetters.label}
                        </button>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#FFFFFF', color: '#0F172A',
                            border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            justifyContent: 'center', width: isMobile ? '100%' : 'auto'
                        }}>
                            <FileText size={16} />
                            {actionButtons.viewLogs.label}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)'),
                    gap: isMobile ? 12 : 16,
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

                {/* Alerts Section - Stacked */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {alerts.map((alert: any, idx: number) => {
                        const isCritical = alert.type === 'critical';
                        const bg = isCritical ? '#FEF2F2' : '#FFF7ED';
                        const border = isCritical ? '#DC2626' : '#F59E0B';
                        const textColor = isCritical ? '#B91C1C' : '#B45309';

                        return (
                            <div key={idx} style={{
                                backgroundColor: bg,
                                border: `1px solid ${border}`,
                                borderRadius: 8,
                                padding: isMobile ? '12px 16px' : '12px 24px',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                gap: isMobile ? 8 : 0,
                                maxWidth: '100%',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: textColor, fontSize: 14, fontWeight: 600, wordBreak: 'break-word', flex: 1 }}>
                                    <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span>{alert.text}</span>
                                </div>
                                <button style={{
                                    background: 'none', border: 'none',
                                    fontSize: 13, fontWeight: 600, color: textColor,
                                    textDecoration: 'underline', cursor: 'pointer',
                                    padding: 0,
                                    alignSelf: isMobile ? 'flex-end' : 'auto',
                                    marginTop: isMobile ? 4 : 0,
                                    flexShrink: 0
                                }}>
                                    {alert.link}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Filter Section */}
                <div style={{ ...cardStyle, padding: '12px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: 24,
                        borderBottom: '1px solid #E2E8F0',
                        paddingBottom: 0,
                        paddingLeft: 12,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        {tabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: 'none', border: 'none',
                                    padding: '0 0 12px 0',
                                    fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 500,
                                    color: activeTab === tab.id ? '#1E3A5F' : '#64748B',
                                    borderBottom: activeTab === tab.id ? '2px solid #1E3A5F' : '2px solid transparent',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                {tab.label} {tab.count !== undefined && <span style={{ backgroundColor: activeTab === tab.id ? '#EFF6FF' : '#F1F5F9', color: activeTab === tab.id ? '#1E3A5F' : '#64748B', padding: '2px 6px', borderRadius: 99, fontSize: 11, marginLeft: 4 }}>{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Search and Dropdowns */}
                    <div style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : 0.3, width: isMobile ? '100%' : 'auto', minWidth: isMobile ? 'auto' : '250px' }}>
                            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder={filters.searchPlaceholder}
                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', flex: 1 }}>
                            {filters.dropdowns.map((drop: any, idx: number) => (
                                <div key={idx} style={{ position: 'relative', flex: isMobile ? '1 1 calc(50% - 6px)' : 'initial' }}>
                                    <select style={{
                                        padding: '10px 32px 10px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #E2E8F0',
                                        fontSize: 14,
                                        backgroundColor: '#FFFFFF',
                                        color: '#0F172A',
                                        appearance: 'none',
                                        minWidth: isMobile ? '100%' : 140,
                                        width: '100%',
                                        cursor: 'pointer'
                                    }}>
                                        <option>{drop.options[0]}</option>
                                        {drop.options.slice(1).map((opt: string) => <option key={opt}>{opt}</option>)}
                                    </select>
                                    <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                        <ChevronDown size={14} color="#64748B" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: isMobile ? 'initial' : 1 }}></div>
                        <button style={{
                            color: '#64748B', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500,
                            width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'left'
                        }}>
                            {filters.clearButton}
                        </button>
                    </div>
                </div>

                {/* Queue Title & Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: 12,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 12 : 0
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {queue.title} <span style={{ color: '#64748B', fontWeight: 400, marginLeft: 8 }}>{queue.count}</span>
                    </h3>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <button style={{
                            backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                            flex: isMobile ? 1 : 'initial', justifyContent: 'center'
                        }}>
                            <Mail size={14} /> Bulk Generate Letters
                        </button>
                        <button style={{
                            backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6,
                            flex: isMobile ? 0 : 'initial'
                        }}>
                            <ArrowRight size={14} style={{ transform: 'rotate(-90deg)' }} /> Sort
                        </button>
                    </div>
                </div>

                {/* Queue Table */}
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: isMobile ? '400px' : '600px' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '12px 24px', width: 40, backgroundColor: '#F8FAFC' }}><input type="checkbox" /></th>
                                    {queue.tableHeaders.slice(1).map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, backgroundColor: '#F8FAFC' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {queue.rows.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedItems.has(row.id) ? '#F8FAFC' : 'white' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <input type="checkbox" checked={selectedItems.has(row.id)} onChange={() => toggleSelection(row.id)} />
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.parcelId}</div>
                                            <div style={{ color: '#1E3A5F', fontSize: 12, fontWeight: 600 }}>{row.pcigId}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ color: '#0F172A', fontWeight: 600 }}>{row.address}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.county}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#0F172A' }}>{row.owner}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: row.sendByColor === 'critical' ? '#DC2626' : '#0F172A' }}>{row.sendBy}</div>
                                            <div style={{ color: row.sendByColor === 'critical' ? '#EF4444' : '#64748B', fontSize: 12 }}>{row.sendBySub}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 600, color: '#DC2626' }}>{row.deadline}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.deadlineSub}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ backgroundColor: row.letterStatus === 'Delivered' ? '#ECFDF5' : (row.letterStatus === 'Not Generated' ? '#F1F5F9' : '#EFF6FF'), color: row.letterStatus === 'Delivered' ? '#059669' : (row.letterStatus === 'Not Generated' ? '#64748B' : '#1E3A5F'), padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                                                {row.letterStatus}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: 13, color: '#1E3A5F' }}>{row.trackingNumber}</div>
                                            {row.trackingStatus && <div style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>{row.trackingStatus}</div>}
                                        </td>
                                        <td style={{ padding: '16px' }}>{getStatusBadge(row.status)}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {row.actions.map((act: string, i: number) => {
                                                    if (act === 'Generate') {
                                                        return <button key={i} style={{ backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 500 }}>Generate</button>;
                                                    }
                                                    return <button key={i} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16 }}>{act}</button>
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Timeline Visualization */}
                <div style={{ ...cardStyle, padding: '24px', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 24px 0' }}>{timeline.title}</h3>
                    <div style={{ paddingBottom: 12 }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            position: 'relative',
                            gap: isMobile ? 32 : 0
                        }}>
                            {/* Background Line */}
                            {!isMobile && <div style={{ position: 'absolute', top: 12, left: 20, right: 20, height: 2, backgroundColor: '#E2E8F0', zIndex: 0 }}></div>}
                            {isMobile && <div style={{ position: 'absolute', top: 20, left: 11, bottom: 20, width: 2, backgroundColor: '#E2E8F0', zIndex: 0 }}></div>}

                            {timeline.steps.map((step: any, idx: number) => {
                                const style = getTimelineStepStyle(step.status);
                                return (
                                    <div key={idx} style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'row' : 'column',
                                        alignItems: 'center',
                                        gap: isMobile ? 12 : 8,
                                        width: isMobile ? '100%' : 100
                                    }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: '50%',
                                            backgroundColor: style.bg, border: `2px solid ${style.border}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: style.color,
                                            flexShrink: 0
                                        }}>
                                            {step.status === 'completed' ? <CheckCircle2 size={14} /> : (step.status === 'active' ? step.id : step.id)}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', textAlign: isMobile ? 'left' : 'center' }}>{step.label}</span>
                                            <span style={{ fontSize: 10, color: '#94A3B8', textAlign: isMobile ? 'left' : 'center' }}>{step.status === 'completed' ? 'Done' : (step.status === 'active' ? 'Active' : '')}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Letter Logs */}
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 12 : 0
                    }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{logs.title}</h3>
                            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>{logs.subtitle}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                            <button style={{
                                backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                justifyContent: 'center'
                            }}>
                                This Month <ChevronDown size={14} />
                            </button>
                            <button style={{
                                backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                justifyContent: 'center'
                            }}>
                                <ArrowRight size={14} style={{ transform: 'rotate(-90deg)' }} /> Export Logs
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: isMobile ? '400px' : '600px' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    {logs.tableHeaders.map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, backgroundColor: '#F8FAFC' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.rows.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.generatedDate}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.generatedBy}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.parcelId}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.address}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.owner}</td>
                                        <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.sentDate}</td>
                                        <td style={{ padding: '16px 24px', color: '#1E3A5F' }}>{row.tracking}</td>
                                        <td style={{ padding: '16px 24px' }}>{getStatusBadge(row.status)}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>{row.method}</span>
                                        </td>
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
        </div>
    );
}
