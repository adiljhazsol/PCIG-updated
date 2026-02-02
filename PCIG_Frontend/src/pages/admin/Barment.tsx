import React, { useState, useEffect, CSSProperties, useRef, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
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
    ArrowRight,
    Plus,
    X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

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
    const navigate = useNavigate();
    // Media Queries
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
    const [timeFilter, setTimeFilter] = useState('all');
    const [showTimeFilterMenu, setShowTimeFilterMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    
    // Bulk Assign Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAttorney, setSelectedAttorney] = useState('');
    const [assigning, setAssigning] = useState(false);

    const [showLogModal, setShowLogModal] = useState(false);
    const [newLog, setNewLog] = useState({
        sent_date: new Date().toISOString().split('T')[0],
        recipient_name: '',
        type: 'Notice',
        status: 'Sent',
        tracking_number: ''
    });
    
    const logsRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {
                tab: activeTab,
                search: searchTerm,
                status: activeFilters['Status'] || undefined,
                county: activeFilters['County'] || undefined,
                attorney_id: activeFilters['Attorney'] === 'Unassigned' ? 'Unassigned' : 
                            (activeFilters['Attorney'] === 'All Attorneys' ? undefined : activeFilters['Attorney']),
            };

            // If Attorney is a name in the dropdown (UI display), we might need to map it to ID if the backend expects ID.
            // However, the backend now returns value/label pairs for dropdowns. 
            // The frontend filter change handler stores the VALUE in activeFilters.

            const response = await api.get('/admin/barment/dashboard-data', { params });
            if (response.data && response.data.barment) {
                setData(response.data.barment);
            } else {
                setError('Failed to load barment data');
            }
        } catch (err) {
            console.error('Error fetching barment data:', err);
            setError('An error occurred while loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, activeFilters, searchTerm]);

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

        if (status.color === 'active' || status.color === 'blue') {
            bg = '#EFF6FF';
            color = '#1E3A5F';
            borderColor = '#BFDBFE';
        } else if (status.color === 'critical' || status.color === 'red') {
            bg = '#FEF2F2';
            color = '#DC2626';
            borderColor = '#FECACA';
        } else if (status.color === 'warning' || status.color === 'orange') {
            bg = '#FFF7ED';
            color = '#C2410C';
            borderColor = '#FED7AA';
        } else if (status.color === 'success' || status.color === 'green') {
            bg = '#ECFDF5';
            color = '#047857';
            borderColor = '#A7F3D0';
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                border: `1px solid ${borderColor}`,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: 12,
                fontWeight: 600,
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
                {error || 'No data available'}
            </div>
        );
    }

    const header = data?.header || { title: 'Barment Actions', subtitle: 'Manage barment proceedings' };
    
    // Safe extraction for actionButtons
    const rawActionButtons = data?.actionButtons;
    const actionButtonsMap = (rawActionButtons && !Array.isArray(rawActionButtons)) ? rawActionButtons : {};
    const generateLettersBtn = actionButtonsMap.generateLetters || { label: 'Generate Letters' };
    const viewLogsBtn = actionButtonsMap.viewLogs || { label: 'View Logs' };

    const statsCards = Array.isArray(data?.statsCards) ? data.statsCards : [];
    const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
    const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
    const filters = data?.filters || {};
    
    const queue = data?.queue || {};
    let queueRows = Array.isArray(queue.rows) ? queue.rows : [];
    const queueHeaders = Array.isArray(queue.tableHeaders) ? queue.tableHeaders : [];

    // Filter Logic for Queue - Handled by Backend
    // if (Object.keys(activeFilters).length > 0) { ... }

    // Sorting Logic
    if (sortConfig.key) {
        queueRows = [...queueRows].sort((a: any, b: any) => {
            // Helper to extract comparable value from deadline string (e.g. "Feb 15, 2026")
            const getDateVal = (str: string) => {
                if (!str || str === 'TBD' || str === 'ASAP') return 9999999999999;
                return new Date(str).getTime();
            };
            
            const aVal = getDateVal(a.deadline);
            const bVal = getDateVal(b.deadline);
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const timeline = data?.timeline || {};
    // timelineSteps removed as it was unused
    
    const logs = data?.letterLogs || {};
    let logRows = Array.isArray(logs.rows) ? logs.rows : [];
    const logHeaders = Array.isArray(logs.tableHeaders) ? logs.tableHeaders : [];

    // Filter Logic
    if (timeFilter !== 'all') {
        const now = new Date();
        logRows = logRows.filter((row: any) => {
            const d = new Date(row.date);
            if (isNaN(d.getTime())) return true; // keep if invalid date
            
            if (timeFilter === 'this_month') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (timeFilter === 'last_month') {
                 const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                 return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
            }
            return true;
        });
    }

    // Handlers
    const handleFilterChange = (label: string, value: string) => {
        setActiveFilters(prev => ({ ...prev, [label]: value }));
    };

    const handleClearFilters = () => {
        setActiveFilters({});
        setTimeFilter('all');
        setSortConfig({ key: null, direction: 'asc' });
        setActiveTab('all');
    };

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/barment/logs', newLog);
            setShowLogModal(false);
            setNewLog({
                sent_date: new Date().toISOString().split('T')[0],
                recipient_name: '',
                type: 'Notice',
                status: 'Sent',
                tracking_number: ''
            });
            fetchData();
        } catch (err) {
            console.error('Failed to create log', err);
            alert('Failed to create entry');
        }
    };

    const handleGenerateLetters = async () => {
        if (selectedItems.size === 0) {
            alert('Please select at least one item from the queue to generate letters.');
            return;
        }
        try {
            // Assuming the API expects an array of IDs
            // For now, we simulate a download or call the endpoint we just made
             const response = await api.post('/admin/barment/generate-letters', {
                property_ids: Array.from(selectedItems)
            }, { 
                responseType: 'blob',
                headers: { 'Accept': 'application/pdf' }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'barment-notices.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error('Failed to generate letters', err);
            // Only alert if we have a response (server error) to avoid false positives from download managers
            if (err.response) {
                alert('Failed to generate letters. Please try again.');
            }
        }
    };

    const handleSort = () => {
        setSortConfig(prev => ({
            key: 'deadline',
            direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExportLogs = () => {
        if (!logRows.length) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + logHeaders.join(",") + "\n" 
            + logRows.map((row: any) => `${row.date},${row.recipient},${row.type},${row.status},${row.tracking}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "barment_logs.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRowGenerate = async (id: string) => {
        try {
            const response = await api.post('/admin/barment/generate-letters', {
                property_ids: [id]
            }, { 
                responseType: 'blob',
                headers: { 'Accept': 'application/pdf' }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `barment-notice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error('Failed to generate letter', err);
            if (err.response) {
                alert('Failed to generate letter');
            }
        }
    };

    const handleAssignAttorney = async () => {
        if (!selectedAttorney || selectedItems.size === 0) return;

        setAssigning(true);
        try {
            await api.post('/admin/barment/bulk-assign', {
                property_ids: Array.from(selectedItems),
                attorney_id: selectedAttorney
            });
            
            // Success
            setAssigning(false);
            setShowAssignModal(false);
            setSelectedItems(new Set());
            setSelectedAttorney('');
            fetchData();
        } catch (err: any) {
            console.error('Failed to assign attorney', err);
            setAssigning(false);
            alert('Failed to assign attorney. Please try again.');
        }
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
                        <button 
                            onClick={handleGenerateLetters}
                            style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#1E3A5F', color: '#FFFFFF',
                            border: 'none', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            justifyContent: 'center', width: isMobile ? '100%' : 'auto'
                        }}>
                            <Mail size={16} />
                            {generateLettersBtn.label}
                        </button>
                        <button 
                            onClick={() => scrollToSection(logsRef)}
                            style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#FFFFFF', color: '#0F172A',
                            border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            justifyContent: 'center', width: isMobile ? '100%' : 'auto'
                        }}>
                            <FileText size={16} />
                            {viewLogsBtn.label}
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', flex: 1 }}>
                            {filters.dropdowns.map((drop: any, idx: number) => (
                                <div key={idx} style={{ position: 'relative', flex: isMobile ? '1 1 calc(50% - 6px)' : 'initial' }}>
                                    <select 
                                        value={activeFilters[drop.label] || drop.options[0]}
                                        onChange={(e) => handleFilterChange(drop.label, e.target.value)}
                                        style={{
                                        padding: '10px 32px 10px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #E2E8F0',
                                        fontSize: 14,
                                        backgroundColor: '#FFFFFF',
                                        color: '#64748B',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        width: '100%',
                                        minWidth: '120px'
                                    }}>
                                        {drop.options.map((opt: string, i: number) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} color="#64748B" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                </div>
                            ))}
                            <button 
                                onClick={handleClearFilters}
                                style={{
                                backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '10px 16px', fontSize: 14, fontWeight: 500, color: '#64748B', cursor: 'pointer',
                                flex: isMobile ? '1 1 100%' : 'initial'
                            }}>
                                {filters.clearButton}
                            </button>
                        </div>
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
                        <button 
                            onClick={() => setShowAssignModal(true)}
                            disabled={selectedItems.size === 0}
                            style={{
                            backgroundColor: '#FFFFFF', color: '#1E3A5F', border: '1px solid #1E3A5F', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                            flex: isMobile ? 1 : 'initial', justifyContent: 'center', cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedItems.size === 0 ? 0.5 : 1
                        }}>
                            <Plus size={14} /> Assign Attorney
                        </button>
                        <button 
                            onClick={handleGenerateLetters}
                            style={{
                            backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                            flex: isMobile ? 1 : 'initial', justifyContent: 'center', cursor: 'pointer'
                        }}>
                            <Mail size={14} /> Bulk Generate Letters
                        </button>
                        <button 
                            onClick={handleSort}
                            style={{
                            backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6,
                            flex: isMobile ? 0 : 'initial', cursor: 'pointer'
                        }}>
                            <ArrowRight size={14} style={{ transform: sortConfig.direction === 'asc' ? 'rotate(-90deg)' : 'rotate(90deg)' }} /> Sort
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
                                    {queueHeaders.slice(1).map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, backgroundColor: '#F8FAFC' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {queueRows.map((row: any, idx: number) => (
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
                                                    return <button key={i} onClick={() => handleRowGenerate(row.id)} style={{ backgroundColor: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Generate</button>;
                                                }
                                                if (act === 'View Details') {
                                                    return <button key={i} onClick={() => navigate(`/admin/properties/barment/${row.id}`)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}>View Details</button>;
                                                }
                                                return <button key={i} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 16 }}>{act}</button>
                                            })}
                                        </div>
                                        </td>
                                    </tr>
                                ))}
                                {queueRows.length === 0 && (
                                    <tr>
                                        <td colSpan={queueHeaders.length} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                                            No cases found matching your criteria.
                                        </td>
                                    </tr>
                                )}
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
                <div ref={logsRef} style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
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
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{logs.title || 'Recent Letter Activity'}</h3>
                            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>{logs.subtitle || 'Track all automated and manual correspondence'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setShowTimeFilterMenu(!showTimeFilterMenu)}
                                    style={{
                                    backgroundColor: timeFilter !== 'all' ? '#EFF6FF' : '#fff', 
                                    border: timeFilter !== 'all' ? '1px solid #1E3A5F' : '1px solid #E2E8F0', 
                                    borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, 
                                    color: timeFilter !== 'all' ? '#1E3A5F' : '#0F172A', 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    justifyContent: 'center', width: '100%'
                                }}>
                                    {timeFilter === 'all' ? 'All Time' : (timeFilter === 'this_month' ? 'This Month' : 'Last Month')} <ChevronDown size={14} />
                                </button>
                                {showTimeFilterMenu && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: 4,
                                        backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50,
                                        minWidth: 150, overflow: 'hidden'
                                    }}>
                                        {['all', 'this_month', 'last_month'].map((opt) => (
                                            <div 
                                                key={opt}
                                                onClick={() => { setTimeFilter(opt); setShowTimeFilterMenu(false); }}
                                                style={{
                                                    padding: '8px 12px', fontSize: 13, color: '#0F172A', cursor: 'pointer',
                                                    backgroundColor: timeFilter === opt ? '#F8FAFC' : '#fff'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = timeFilter === opt ? '#F8FAFC' : '#fff'}
                                            >
                                                {opt === 'all' ? 'All Time' : (opt === 'this_month' ? 'This Month' : 'Last Month')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleExportLogs}
                                style={{
                                backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                justifyContent: 'center'
                            }}>
                                <ArrowRight size={14} style={{ transform: 'rotate(-90deg)' }} /> Export Logs
                            </button>

                            <button 
                                onClick={() => setShowLogModal(true)}
                                style={{
                                backgroundColor: '#1E3A5F', border: 'none', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                justifyContent: 'center'
                            }}>
                                <Plus size={14} /> Add Entry
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: isMobile ? '400px' : '600px' }}>
                        <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    {logHeaders.map((h: string, i: number) => (
                                        <th key={i} style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, backgroundColor: '#F8FAFC' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {logRows.map((row: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.date}</td>
                                        <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.recipient}</td>
                                        <td style={{ padding: '16px 24px', color: '#0F172A' }}>{row.type}</td>
                                        <td style={{ padding: '16px 24px' }}>{getStatusBadge(row.status)}</td>
                                        <td style={{ padding: '16px 24px', color: '#1E3A5F' }}>{row.tracking}</td>
                                    </tr>
                                ))}
                                {logRows.length === 0 && (
                                    <tr>
                                        <td colSpan={logHeaders.length} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                            No logs found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {showLogModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 8, width: '100%', maxWidth: 500,
                        padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Add Letter Entry</h3>
                            <button onClick={() => setShowLogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleLogSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Date Sent</label>
                                    <input 
                                        type="date" 
                                        required
                                        value={newLog.sent_date}
                                        onChange={(e) => setNewLog({...newLog, sent_date: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Recipient</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Name or Address"
                                        value={newLog.recipient_name}
                                        onChange={(e) => setNewLog({...newLog, recipient_name: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Type</label>
                                    <select
                                        value={newLog.type}
                                        onChange={(e) => setNewLog({...newLog, type: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                                    >
                                        <option value="Notice">Notice</option>
                                        <option value="Warning">Warning</option>
                                        <option value="Final Notice">Final Notice</option>
                                        <option value="Certified Mail">Certified Mail</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Status</label>
                                    <select
                                        value={newLog.status}
                                        onChange={(e) => setNewLog({...newLog, status: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                                    >
                                        <option value="Sent">Sent</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Returned">Returned</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Tracking Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="Optional"
                                        value={newLog.tracking_number}
                                        onChange={(e) => setNewLog({...newLog, tracking_number: e.target.value})}
                                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                                    <button 
                                        type="button"
                                        onClick={() => setShowLogModal(false)}
                                        style={{
                                            padding: '8px 16px', borderRadius: 6, border: '1px solid #E2E8F0', backgroundColor: '#fff',
                                            color: '#64748B', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        style={{
                                            padding: '8px 16px', borderRadius: 6, border: 'none', backgroundColor: '#1E3A5F',
                                            color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                                        }}
                                    >
                                        Save Entry
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Assign Modal */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: 8, padding: 24,
                        width: '100%', maxWidth: 400, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Assign Attorney</h3>
                            <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748B" /></button>
                        </div>
                        
                        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16 }}>
                            Assigning {selectedItems.size} selected case{selectedItems.size !== 1 ? 's' : ''} to:
                        </p>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Select Attorney</label>
                            <select
                                value={selectedAttorney}
                                onChange={(e) => setSelectedAttorney(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #E2E8F0',
                                    fontSize: 14, outline: 'none'
                                }}
                            >
                                <option value="">Select an attorney...</option>
                                {filters.dropdowns?.find((d: any) => d.label === 'Attorney')?.options
                                    .filter((opt: any) => {
                                        const val = typeof opt === 'string' ? opt : opt.value;
                                        return !['Attorney', 'All Attorneys', 'Unassigned'].includes(val);
                                    })
                                    .map((opt: any, idx: number) => {
                                        const val = typeof opt === 'string' ? opt : opt.value;
                                        const lab = typeof opt === 'string' ? opt : opt.label;
                                        return <option key={idx} value={val}>{lab}</option>;
                                    })
                                }
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                style={{
                                    padding: '10px 16px', borderRadius: 6, border: '1px solid #E2E8F0',
                                    backgroundColor: '#fff', color: '#64748B', fontSize: 14, fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignAttorney}
                                disabled={assigning || !selectedAttorney}
                                style={{
                                    padding: '10px 16px', borderRadius: 6, border: 'none',
                                    backgroundColor: '#1E3A5F', color: '#fff', fontSize: 14, fontWeight: 500,
                                    cursor: (assigning || !selectedAttorney) ? 'not-allowed' : 'pointer',
                                    opacity: (assigning || !selectedAttorney) ? 0.7 : 1
                                }}
                            >
                                {assigning ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
