import React, { CSSProperties, useState, useEffect } from 'react';
import {
    Users,
    Download,
    FileText,
    Clock,
    Upload,
    Mail,
    CheckCircle2,
    Search,
    ArrowRight,
    Filter,
    AlertCircle
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Icon map
const iconMap: { [key: string]: any } = {
    Users,
    Download,
    FileText,
    Clock,
    Upload,
    Mail,
    CheckCircle2,
    Search,
    Filter,
    AlertCircle
};

export default function FIFAProcessing() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState('All Items');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set([]));
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignTargetIds, setAssignTargetIds] = useState<string[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/fifa/processing-dashboard-data', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching FIFA processing data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAssign = () => {
        if (selectedItems.size === 0) {
            alert('Please select items to assign.');
            return;
        }
        setAssignTargetIds(Array.from(selectedItems));
        setAssignModalOpen(true);
    };

    const handleAssign = (id: string) => {
        setAssignTargetIds([id]);
        setAssignModalOpen(true);
    };

    const submitAssignment = async () => {
        if (!selectedUserId) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/fifa/bulk-assign', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ids: assignTargetIds,
                    user_id: selectedUserId
                })
            });
            if (!response.ok) throw new Error('Failed to assign');
            await fetchData(); // Refresh data
            setAssignModalOpen(false);
            setAssignTargetIds([]);
            setSelectedUserId('');
            setSelectedItems(new Set([])); // Clear selection
        } catch (err) {
            console.error(err);
            alert('Failed to assign properties');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkExport = async () => {
        if (selectedItems.size === 0) {
            alert('Please select items to export.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/fifa/bulk-export', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: Array.from(selectedItems) })
            });

            if (!response.ok) throw new Error('Failed to export');
            
            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fifa_properties_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert('Failed to export properties');
        }
    };

    const handleGenerateSheriffExport = async () => {
        if (selectedItems.size === 0) {
            alert('Please select items to generate export.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/fifa/generate-sheriff-export', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: Array.from(selectedItems) })
            });
            
            if (!response.ok) throw new Error('Failed to generate export');
            
             // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sheriff_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            alert('Sheriff Export File generated successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to generate export');
        }
    };

    const handleMarkAsExported = async () => {
        if (selectedItems.size === 0) {
            alert('Please select items to mark as exported.');
            return;
        }
        if (!window.confirm('Mark selected items as exported? This will move them to the Sheriff workflow.')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/admin/fifa/mark-exported', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ids: Array.from(selectedItems) })
            });
            if (!response.ok) throw new Error('Failed to mark as exported');
            await fetchData();
            setSelectedItems(new Set([]));
        } catch (err) {
            console.error(err);
            alert('Failed to mark as exported');
        }
    };

    const handleDetail = (id: string) => {
        window.location.href = `/admin/properties/${id}`;
    };

    const handleClearSelection = () => {
        setSelectedItems(new Set([]));
    };
    
    // Filter rows based on activeTab
    const getFilteredRows = () => {
        if (!data || !data.queue || !data.queue.rows) return [];
        let rows = data.queue.rows;
        
        if (activeTab === 'Ready for Export') {
            rows = rows.filter((r: any) => r.status === 'Ready for export');
        } else if (activeTab === 'My Assignments') {
             // Filter using the is_assigned_to_me flag from backend
             rows = rows.filter((r: any) => r.is_assigned_to_me);
        } else if (activeTab === 'Unassigned') {
            rows = rows.filter((r: any) => r.assigned === 'Unassigned');
        }
        
        return rows;
    };
    
    const filteredRows = getFilteredRows();


    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
                <div style={{ color: '#64748B' }}>Loading FIFA processing data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
                <div style={{ color: '#EF4444' }}>{error}</div>
            </div>
        );
    }

    if (!data) return null;

    // Data Extraction
    const header = data?.header || { title: '', subtitle: '' };
    const actionButtons = data?.actionButtons || { bulkAssign: { label: '' }, export: { label: '' } };
    const statsCards = data?.statsCards || [];
    const pipeline = data?.pipeline || { title: '', breadcrumbs: [], stages: [] };
    const filters = data?.filters || { searchPlaceholder: '' };
    const queue = data?.queue || [];

    const pageWrapperStyle: CSSProperties = {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        width: '100%',
        padding: 0,
        overflowX: 'hidden'
    };

    const cardStyle: CSSProperties = {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxSizing: 'border-box'
    };

    const getStatusBadge = (status: string, colorKey: string) => {
        let bg = '#F1F5F9';
        let color = '#64748B';
        let borderColor = 'transparent';

        if (colorKey === 'critical') {
            bg = '#FEF2F2';
            color = '#DC2626';
            borderColor = '#FECACA';
        } else if (colorKey === 'warning') {
            bg = '#FFFBEB';
            color = '#B45309';
            borderColor = '#FDE68A';
        } else if (colorKey === 'info') {
            bg = '#EFF6FF';
            color = '#1D4ED8';
            borderColor = '#BFDBFE';
        } else if (colorKey === 'success') {
            bg = '#ECFDF5';
            color = '#059669';
            borderColor = '#6EE7B7';
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                border: `1px solid ${borderColor}`,
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
                display: 'inline-block'
            }}>
                {status}
            </span>
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
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 12 : 0,
                    marginBottom: 24
                }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{header.title}</h1>
                        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>{header.subtitle}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <button 
                            onClick={handleBulkAssign}
                            style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#1E3A5F', color: '#FFFFFF',
                            border: 'none', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            justifyContent: 'center', flex: isMobile ? 1 : 'initial',
                            opacity: 1
                        }}>
                            <Users size={16} />
                            {actionButtons.bulkAssign.label}
                        </button>
                        <button 
                            onClick={handleBulkExport}
                            style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#FFFFFF', color: '#0F172A',
                            border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            justifyContent: 'center', flex: isMobile ? 1 : 'initial',
                            opacity: 1
                        }}>
                            <Download size={16} />
                            {actionButtons.export.label}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
                    gap: 16,
                    marginBottom: 24
                }}>
                    {statsCards.map((card: any, idx: number) => {
                        const Icon = iconMap[card.icon] || FileText;
                        return (
                            <div key={idx} style={{ ...cardStyle, padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{card.label}</span>
                                    <Icon size={16} color={card.color || '#64748B'} />
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 700, color: card.color || '#0F172A', marginBottom: 4 }}>
                                    {card.value}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>
                                    {card.subtext}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pipeline */}
                <div style={{ ...cardStyle, marginBottom: 24, padding: isMobile ? '16px' : '24px', overflowX: 'auto' }}>
                    <div style={{ margin: '0 0 16px 0' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>{pipeline.title}</h3>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                            {pipeline.breadcrumbs.join(' → ')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: isMobile ? 800 : 'auto' }}>
                        {pipeline.stages.map((stage: any, idx: number) => (
                            <React.Fragment key={idx}>
                                <div style={{
                                    flex: 1,
                                    backgroundColor: stage.status === 'success' ? '#ECFDF5' : stage.status === 'neutral' ? '#F8FAFC' : '#FFFBEB',
                                    border: stage.status === 'critical' ? '1px solid #FECACA' : stage.status === 'warning' ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                                    borderRadius: 8,
                                    padding: '16px',
                                    position: 'relative'
                                }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{stage.label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: stage.status === 'success' ? '#059669' : stage.status === 'critical' ? '#DC2626' : stage.status === 'warning' ? '#B45309' : '#0F172A' }}>{stage.count}</div>
                                    {stage.tag && (
                                        <span style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: '#B45309',
                                            backgroundColor: '#FEF3C7',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            marginTop: 4,
                                            display: 'inline-block'
                                        }}>
                                            {stage.tag}
                                        </span>
                                    )}
                                </div>
                                {idx < pipeline.stages.length - 1 && (
                                    <ArrowRight size={20} color="#94A3B8" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    ...cardStyle,
                    padding: '12px',
                    marginBottom: 24,
                    display: 'flex',
                    gap: 12,
                    alignItems: isMobile ? 'stretch' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative', flex: isMobile ? 'auto' : 1, width: isMobile ? '100%' : 'auto' }}>
                        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder={filters.searchPlaceholder}
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

                    <div style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        {filters.dropdowns.map((drop: any, idx: number) => (
                            <div key={idx} style={{ position: 'relative', flex: isMobile ? 1 : 'initial' }}>
                                <select style={{
                                    padding: '10px 32px 10px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    fontSize: 14,
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    appearance: 'none',
                                    minWidth: isMobile ? 0 : 140,
                                    width: isMobile ? '100%' : 'auto',
                                    cursor: 'pointer'
                                }}>
                                    <option>{drop.label}: {drop.options[0]}</option>
                                    {drop.options.slice(1).map((opt: string, optIdx: number) => <option key={`${opt}-${optIdx}`}>{opt}</option>)}
                                </select>
                                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button style={{
                        color: '#64748B',
                        fontSize: 14,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                        alignSelf: isMobile ? 'flex-start' : 'center',
                        padding: isMobile ? '8px 0' : 0
                    }}>
                        {filters.clearButton}
                    </button>
                </div>

                {/* Queue Section */}
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Queue Header & Tabs */}
                    <div style={{ padding: '20px 24px 0 24px', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 8 : 0 }}>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>{queue.title}</h3>
                                <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0 0' }}>{queue.subtitle}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, color: '#64748B' }}>{queue.sortLabel}</span>
                                {/* Dropdown arrow could go here */}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 0, width: '100%' }}>
                            {queue.tabs.map((tab: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(tab.label)}
                                    style={{
                                        padding: '0 0 12px 0',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === tab.label ? '2px solid #0F172A' : '2px solid transparent',
                                        color: activeTab === tab.label ? '#0F172A' : '#64748B',
                                        fontSize: 14,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                    }}
                                >
                                    {tab.label}
                                    {tab.count && (
                                        <span style={{
                                            backgroundColor: activeTab === tab.label ? '#F1F5F9' : '#F8FAFC',
                                            padding: '2px 6px',
                                            borderRadius: 10,
                                            fontSize: 11
                                        }}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bulk Action Bar */}
                    <div style={{
                        backgroundColor: '#F8FAFC',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #E2E8F0',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 12 : 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{selectedItems.size} items selected</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                    onClick={handleGenerateSheriffExport}
                                    style={{ backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: 1 }}>
                                    Generate Sheriff Export File
                                </button>
                                <button 
                                    onClick={handleMarkAsExported}
                                    style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: 1 }}>
                                    Mark as Exported
                                </button>
                            </div>
                        </div>
                        <button 
                            onClick={handleClearSelection}
                            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
                            Clear Selection
                        </button>
                    </div>

                    {/* Table Container for Horizontal Scroll */}
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '12px 24px', width: 40 }}><input type="checkbox" /></th>
                                    {queue.tableHeaders.slice(1).map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.has(row.id)}
                                                onChange={() => toggleSelection(row.id)}
                                            />
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 600, color: '#1E3A5F' }}>{row.id}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ color: '#0F172A', fontWeight: 500 }}>{row.parcelId}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.pcigId}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ color: '#0F172A' }}>{row.address}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{row.county}</div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#0F172A' }}>{row.owner}</td>
                                        <td style={{ padding: '16px', color: '#0F172A' }}>{row.year}</td>
                                        <td style={{ padding: '16px', color: '#1E3A5F' }}>{row.sheriffFile}</td>
                                        <td style={{ padding: '16px' }}>{getStatusBadge(row.status, row.statusColor)}</td>
                                        <td style={{ padding: '16px', color: row.assigned === 'Unassigned' ? '#DC2626' : '#0F172A' }}>
                                            {row.assigned}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button 
                                                onClick={() => handleAssign(row.id)}
                                                style={{ color: '#10B981', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>
                                                {row.assigned === 'Unassigned' ? 'Assign' : 'Reassign'}
                                            </button>
                                            <button 
                                                onClick={() => handleDetail(row.id)}
                                                style={{ color: '#1E3A5F', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Assign Modal */}
                {assignModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, width: 400, maxWidth: '90%' }}>
                            <h3 style={{ marginTop: 0 }}>Assign {assignTargetIds.length} Propert{assignTargetIds.length > 1 ? 'ies' : 'y'}</h3>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Select User</label>
                                <select 
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                                >
                                    <option value="">Select a user...</option>
                                    {data?.filters?.users?.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setAssignModalOpen(false)} style={{ padding: '8px 16px', background: 'none', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                                <button 
                                    onClick={submitAssignment} 
                                    disabled={!selectedUserId || isSubmitting}
                                    style={{ padding: '8px 16px', backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: (!selectedUserId || isSubmitting) ? 0.5 : 1 }}
                                >
                                    {isSubmitting ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
