import { useState, useEffect, Fragment } from 'react';
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
    MoreHorizontal,
    Loader2,
    AlertCircle,
    X,
    Trash2,
    Save
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

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

    // State for Data Fetching
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Manual Entry State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [manualEntryForm, setManualEntryForm] = useState({
        entry_date: new Date().toISOString().split('T')[0],
        description: '',
        entries: [
            { account_id: '', debit: '', credit: '' },
            { account_id: '', debit: '', credit: '' }
        ]
    });

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/admin/ledger/accounts');
            setAccounts(response.data.data || response.data);
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    useEffect(() => {
        if (isCreateModalOpen) {
            fetchAccounts();
        }
    }, [isCreateModalOpen]);

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            await api.get('/admin/ledger/dashboard-data?recalculate=true');
            // Refresh data
            const response = await api.get('/admin/ledger/dashboard-data');
            setData(response.data.lightweightLedger);
        } catch (err) {
            console.error('Error recalculating:', err);
            alert('Failed to recalculate ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!data?.journalEntries) return;
        
        const headers = ['Date', 'Entry #', 'Type', 'Description', 'Property/Fund', 'Debit', 'Credit', 'Account', 'Source', 'Balance'];
        const csvContent = [
            headers.join(','),
            ...data.journalEntries.map((row: any) => [
                row.date,
                row.entryNumber,
                row.type,
                `"${row.description}"`,
                `"${row.propertyFund}"`,
                row.debit,
                row.credit,
                `"${row.account}"`,
                row.source,
                row.balance
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleManualEntryChange = (index: number, field: string, value: string) => {
        const newEntries = [...manualEntryForm.entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setManualEntryForm({ ...manualEntryForm, entries: newEntries });
    };

    const addEntryRow = () => {
        setManualEntryForm({
            ...manualEntryForm,
            entries: [...manualEntryForm.entries, { account_id: '', debit: '', credit: '' }]
        });
    };

    const removeEntryRow = (index: number) => {
        if (manualEntryForm.entries.length <= 1) return;
        const newEntries = manualEntryForm.entries.filter((_, i) => i !== index);
        setManualEntryForm({ ...manualEntryForm, entries: newEntries });
    };

    const handleManualEntrySubmit = async () => {
        try {
            // Validation
            const totalDebit = manualEntryForm.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = manualEntryForm.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                alert(`Debits ($${totalDebit.toFixed(2)}) must equal Credits ($${totalCredit.toFixed(2)})`);
                return;
            }

            await api.post('/admin/ledger/entry', manualEntryForm);
            setIsCreateModalOpen(false);
            setManualEntryForm({
                entry_date: new Date().toISOString().split('T')[0],
                description: '',
                entries: [
                    { account_id: '', debit: '', credit: '' },
                    { account_id: '', debit: '', credit: '' }
                ]
            });
            // Refresh data
            const response = await api.get('/admin/ledger/dashboard-data');
            setData(response.data.lightweightLedger);
        } catch (err: any) {
            console.error('Error creating entry:', err);
            alert(err.response?.data?.message || 'Failed to create entry');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/ledger/dashboard-data');
                setData(response.data.lightweightLedger);
                setError(null);
            } catch (err) {
                console.error('Error fetching ledger data:', err);
                setError('Failed to load ledger data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading ledger data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
                    <p className="text-slate-600 mb-6">{error || 'Something went wrong'}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = data?.stats || [];
    const journalEntries = data?.journalEntries || [];

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
                        <button 
                            onClick={handleRecalculate}
                            style={{
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
                        <button 
                            onClick={handleExport}
                            style={{
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
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            style={{
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

                {/* Content based on Active Tab */}
                {activeTab === 'Journal Entries' && (
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
                        {!isMobile && <div style={{ fontSize: 13, color: '#64748B' }}>Showing 1-50 of {journalEntries.length} entries</div>}
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
                )}

                {activeTab === 'Property P&L' && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Property P&L</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Property</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Income</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Expenses</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Net Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.propertyPL?.map((item: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{item.name}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#10B981', fontWeight: 500 }}>{item.income}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{item.expenses}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: item.rawNet >= 0 ? '#10B981' : '#DC2626' }}>{item.netIncome}</td>
                                </tr>
                            ))}
                            {(!data?.propertyPL || data.propertyPL.length === 0) && (
                                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>No property data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}

                {activeTab === 'Fund P&L' && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Fund P&L</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Fund</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Income</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Expenses</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Net Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.fundPL?.map((item: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{item.name}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#10B981', fontWeight: 500 }}>{item.income}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{item.expenses}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: item.rawNet >= 0 ? '#10B981' : '#DC2626' }}>{item.netIncome}</td>
                                </tr>
                            ))}
                             {(!data?.fundPL || data.fundPL.length === 0) && (
                                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>No fund data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}

                {activeTab === 'Account Balances' && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Chart of Accounts</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Code</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Type</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.accounts?.map((acc: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px', fontSize: 13, color: '#64748B' }}>{acc.code}</td>
                                    <td style={{ padding: '16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{acc.name}</td>
                                    <td style={{ padding: '16px', fontSize: 13, color: '#475569' }}>{acc.type}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{acc.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                {activeTab === 'Reports' && (
                <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Available Reports</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                        <div style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Balance Sheet</div>
                            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Summary of financial balances.</p>
                            <button style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Download PDF</button>
                        </div>
                        <div style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Income Statement</div>
                            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Company's financial performance.</p>
                            <button style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Download PDF</button>
                        </div>
                        <div style={{ padding: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Cash Flow</div>
                            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Inflow and outflow of cash.</p>
                            <button style={{ fontSize: 13, color: '#2563EB', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Download PDF</button>
                        </div>
                    </div>
                </div>
                )}

            </div>

            {/* Manual Entry Modal */}
            {isCreateModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: 24,
                        margin: 16
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Create Journal Entry</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <X size={24} color="#64748B" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Date</label>
                                <input
                                    type="date"
                                    value={manualEntryForm.entry_date}
                                    onChange={(e) => setManualEntryForm({...manualEntryForm, entry_date: e.target.value})}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>Description</label>
                                <input
                                    type="text"
                                    value={manualEntryForm.description}
                                    onChange={(e) => setManualEntryForm({...manualEntryForm, description: e.target.value})}
                                    placeholder="e.g. Rent Payment"
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: 12, marginBottom: 8, paddingRight: 12 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Account</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Debit</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Credit</div>
                                <div></div>
                            </div>
                            
                            {manualEntryForm.entries.map((entry, idx) => (
                                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: 12, marginBottom: 12 }}>
                                    <select
                                        value={entry.account_id}
                                        onChange={(e) => handleManualEntryChange(idx, 'account_id', e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={entry.debit}
                                        onChange={(e) => handleManualEntryChange(idx, 'debit', e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={entry.credit}
                                        onChange={(e) => handleManualEntryChange(idx, 'credit', e.target.value)}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 14 }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removeEntryRow(idx)}
                                        disabled={manualEntryForm.entries.length <= 1}
                                        style={{ 
                                            border: 'none', 
                                            background: 'transparent', 
                                            cursor: manualEntryForm.entries.length <= 1 ? 'not-allowed' : 'pointer',
                                            opacity: manualEntryForm.entries.length <= 1 ? 0.5 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                    </button>
                                </div>
                            ))}
                            
                            <button
                                onClick={addEntryRow}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 13,
                                    color: '#2563EB',
                                    background: 'transparent',
                                    border: 'none',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    marginTop: 8
                                }}
                            >
                                <Plus size={16} /> Add Line
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{
                                    padding: '10px 16px',
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
                                onClick={handleManualEntrySubmit}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: '#2563EB',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                            >
                                <Save size={16} /> Save Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
