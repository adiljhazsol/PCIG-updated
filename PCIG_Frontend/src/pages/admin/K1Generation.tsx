import { useState, useEffect } from 'react';
import {
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    Play,
    Search,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

// Icon mapping
const iconMap: { [key: string]: any } = {
    Users,
    CheckCircle,
    Clock,
    AlertCircle
};

export default function K1Generation() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const isMobileOrTablet = isMobile || isTablet;

    const [activeTab, setActiveTab] = useState('Generation & Settings');
    const [generationScope, setGenerationScope] = useState('All Investors');
    const [outputSettings, setOutputSettings] = useState({
        includeCoverLetter: true,
        includeInstructions: true,
        emailToInvestors: false
    });

    const [adminData, setAdminData] = useState<any>(null);
    // Removed unused loading/error states
    
    const [generatedForms, setGeneratedForms] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/k1/dashboard-data');
                setAdminData(response.data);
            } catch (err) {
                console.error('Error fetching K1 data:', err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'Generated History') {
            const fetchHistory = async () => {
                try {
                    const response = await api.get('/admin/k1/forms?year=2024');
                    setGeneratedForms(response.data.data || []);
                } catch (err) {
                    console.error('Error fetching history:', err);
                }
            };
            fetchHistory();
        }
    }, [activeTab]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/admin/k1/generate', {
                tax_year: 2024,
                scope: generationScope.toLowerCase().replace(' ', '_')
            });
            // Refresh dashboard data
            const response = await api.get('/admin/k1/dashboard-data');
            setAdminData(response.data);
            alert('K-1 Generation started successfully!');
            setActiveTab('Generated History');
        } catch (err: any) {
            console.error('Error generating K-1s:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to start generation.';
            alert(`Error: ${msg}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (id: string, name: string) => {
        try {
            const response = await api.get(`/admin/k1/download/${id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}_K1_2024.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download K-1.');
        }
    };

    const handleView = async (id: string) => {
        try {
            const response = await api.get(`/admin/k1/view/${id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (err) {
            console.error('View failed:', err);
            alert('Failed to view K-1.');
        }
    };

    const handlePublish = async (id: string) => {
        try {
            await api.post('/admin/k1/publish', {
                ids: [id]
            });
            alert('Sent to investor!');
            const response = await api.get('/admin/k1/forms?year=2024');
            setGeneratedForms(response.data.data || []);
        } catch (err) {
            console.error('Error publishing:', err);
            alert('Failed to send.');
        }
    };

    // Safe data extraction
    const data = adminData?.k1Generation || {};
    // Removed unused header
    
    const rawStats = Array.isArray(data?.stats) ? data.stats : [];
    const stats = rawStats.map((stat: any) => ({
        label: stat?.label || '',
        value: stat?.value || '',
        subtext: stat?.subtext || '',
        icon: stat?.icon || 'Users',
        color: stat?.color || '#64748B'
    }));

    const reviewCount = data?.tableData?.reviewCount || 0;

    const rawTableData = Array.isArray(data?.tableData?.rows) ? data.tableData.rows : (Array.isArray(data?.tableData) ? data.tableData : []);
    const tableData = rawTableData.map((row: any) => ({
        name: row?.name || '',
        id: row?.id || '',
        status: row?.status || '',
        statusColor: row?.statusColor || '',
        statusBg: row?.statusBg || '',
        pl: row?.pl || '',
        depreciation: row?.depreciation || '',
        distributions: row?.distributions || '',
        totalAlloc: row?.totalAlloc || '',
        totalAllocColor: row?.totalAllocColor || ''
    }));

    const rawSamplePreview = Array.isArray(data?.samplePreview) ? data.samplePreview : [];
    const samplePreview = rawSamplePreview.map((item: any) => {
        if (typeof item === 'object' && item !== null && 'label' in item && 'value' in item) {
            return `${item.label}: ${item.value}`;
        }
        return String(item || '');
    });

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
                        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>K-1 Generation Center</h1>
                        <p style={{ fontSize: isMobile ? 13 : 14, color: '#64748B' }}>Automated Schedule K-1 generation for Tax Year 2024</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 6,
                            fontSize: isMobile ? 13 : 14,
                            fontWeight: 500,
                            color: '#0F172A',
                            cursor: 'pointer',
                            flex: isMobile ? '1 1 100%' : 'initial'
                        }}>
                            <Download size={16} />
                            {isMobile ? 'Export CSV' : 'Export Tax Data (CSV)'}
                        </button>
                        <button 
                            onClick={() => handleGenerate()}
                            disabled={generating}
                            style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '10px 16px',
                            backgroundColor: '#1E3A5F',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: isMobile ? 13 : 14,
                            fontWeight: 500,
                            color: '#fff',
                            cursor: generating ? 'not-allowed' : 'pointer',
                            opacity: generating ? 0.7 : 1,
                            flex: isMobile ? '1 1 100%' : 'initial'
                        }}>
                            <Play size={16} />
                            {generating ? 'Generating...' : 'Generate All K-1s'}
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
                        const Icon = iconMap[stat.icon] || Users;
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
                                    <div style={{ fontSize: 12, color: stat.color || '#64748B' }}>{stat.subtext}</div>
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
                    {['Generation & Settings', 'Data Review', 'Generated History', 'Tax Packages'].map(tab => (
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
                                fontSize: isMobile ? 13 : 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                            }}
                        >
                            {isMobile && tab === 'Generation & Settings' ? 'Settings' : tab}
                            {tab === 'Data Review' && (
                                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>{reviewCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                {activeTab === 'Generation & Settings' && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobileOrTablet ? '1fr' : '300px 1fr',
                    gap: isMobile ? 16 : 24,
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}>

                    {/* Sidebar: Generation Options */}
                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: isMobile ? 16 : 24,
                        height: 'fit-content',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 0, marginBottom: 20 }}>Generation Options</h3>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Select Tax Year</label>
                            <div style={{
                                width: '100%',
                                maxWidth: '100%',
                                padding: '10px 12px',
                                border: '1px solid #E2E8F0',
                                borderRadius: 6,
                                fontSize: 14,
                                color: '#0F172A',
                                backgroundColor: '#fff',
                                boxSizing: 'border-box'
                            }}>
                                2024
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Generation Scope</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {['All Investors', 'Selected Investors', 'By Fund', 'By Property'].map(option => (
                                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            checked={generationScope === option}
                                            onChange={() => setGenerationScope(option)}
                                            style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Output Settings</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={outputSettings.includeCoverLetter}
                                        onChange={e => setOutputSettings({ ...outputSettings, includeCoverLetter: e.target.checked })}
                                        style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                                    />
                                    Include Cover Letter
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={outputSettings.includeInstructions}
                                        onChange={e => setOutputSettings({ ...outputSettings, includeInstructions: e.target.checked })}
                                        style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                                    />
                                    Include Instructions
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={outputSettings.emailToInvestors}
                                        onChange={e => setOutputSettings({ ...outputSettings, emailToInvestors: e.target.checked })}
                                        style={{ cursor: 'pointer', accentColor: '#3B82F6' }}
                                    />
                                    Email to Investors
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Format</label>
                            <div style={{
                                width: '100%',
                                maxWidth: '100%',
                                padding: '10px 12px',
                                border: '1px solid #E2E8F0',
                                borderRadius: 6,
                                fontSize: 14,
                                color: '#0F172A',
                                backgroundColor: '#fff',
                                boxSizing: 'border-box'
                            }}>
                                PDF Package (ZIP)
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Data Sources Included</label>
                            <div style={{ backgroundColor: '#F1F5F9', padding: 16, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                                    <CheckCircle size={12} color="#10B981" /> P/L Allocations
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                                    <CheckCircle size={12} color="#10B981" /> Depreciation
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                                    <CheckCircle size={12} color="#10B981" /> Interest Income
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                                    <CheckCircle size={12} color="#10B981" /> Expenses
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                                    <CheckCircle size={12} color="#10B981" /> Distributions
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleGenerate()}
                            disabled={generating}
                            style={{
                            width: '100%',
                            maxWidth: '100%',
                            padding: '12px',
                            backgroundColor: generating ? '#94A3B8' : '#1E3A5F',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: generating ? 'not-allowed' : 'pointer',
                            boxSizing: 'border-box'
                        }}>
                            {generating ? 'Generating...' : 'Generate K-1 Package'}
                        </button>

                    </div>

                    {/* Right Content: Data Review */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: '100%', boxSizing: 'border-box', minWidth: 0 }}>
                        {/* Data Review Table Panel */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{
                                padding: isMobile ? 12 : 16,
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: 12
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Data Review Preview (2024)</div>
                                <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                                    <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : 'initial' }}>
                                        <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search investors..."
                                            style={{
                                                padding: '8px 12px 8px 32px',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: 4,
                                                fontSize: 13,
                                                width: isMobile ? '100%' : 200,
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                    {!isMobile && (
                                        <button 
                                            onClick={() => setActiveTab('Data Review')}
                                            style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 12, backgroundColor: '#fff', color: '#0F172A', cursor: 'pointer' }}>
                                            View Full Data
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '700px' : 'auto' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #F1F5F9' }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Investor</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Data Status</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>P/L</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Depreciation</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Distributions</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Alloc.</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td style={{ padding: '16px 16px' }}>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{row.name}</div>
                                                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{row.id}</div>
                                                </td>
                                                <td style={{ padding: '16px 16px' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: row.statusColor,
                                                        backgroundColor: row.statusBg,
                                                        padding: '2px 8px',
                                                        borderRadius: 12,
                                                        border: row.status === 'Missing Data' ? `1px solid ${row.statusBg}` : 'none'
                                                    }}>
                                                        {row.status === 'Complete' && <CheckCircle size={10} />}
                                                        {row.status === 'Missing Data' && <AlertCircle size={10} />}
                                                        {row.status === 'Pending' && <Clock size={10} />}
                                                        {row.status}
                                                    </div>
                                                </td>
                                                <td style={{ padding: isMobile ? '12px' : '16px 16px', fontSize: 13, color: '#475569' }}>{row.pl}</td>
                                                <td style={{ padding: isMobile ? '12px' : '16px 16px', fontSize: 13, color: '#475569' }}>{row.depreciation}</td>
                                                <td style={{ padding: isMobile ? '12px' : '16px 16px', fontSize: 13, color: '#475569' }}>{row.distributions}</td>
                                                <td style={{ padding: isMobile ? '12px' : '16px 16px', fontSize: 13, fontWeight: 600, color: row.totalAllocColor }}>{row.totalAlloc}</td>
                                                <td style={{ padding: isMobile ? '12px' : '16px 16px', textAlign: 'right' }}>
                                                    {row.status === 'Missing Data' ? (
                                                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}><MoreHorizontal size={16} /></button>
                                                    ) : (
                                                        <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}><Eye size={16} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sample Preview Text Panel */}
                        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: isMobile ? 16 : 20, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 16 }}>Sample Preview</div>
                            <div style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: 4,
                                padding: 16,
                                fontFamily: 'monospace',
                                fontSize: 12,
                                color: '#475569',
                                lineHeight: 1.6
                            }}>
                                {samplePreview.map((line: string, idx: number) => (
                                    <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{line}</div>
                                ))}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <button style={{
                                    padding: '8px 16px',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: 4,
                                    backgroundColor: '#fff',
                                    color: '#0F172A',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}>
                                    View Full PDF Preview
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
                )}

                {activeTab === 'Data Review' && (
                    <div style={{ width: '100%' }}>
                         <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Full Data Review</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Investor</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>P/L</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Depreciation</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Distributions</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Alloc.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.map((row: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{row.name}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ 
                                                        backgroundColor: row.statusBg, 
                                                        color: row.statusColor,
                                                        padding: '2px 8px',
                                                        borderRadius: 12,
                                                        fontSize: 11,
                                                        fontWeight: 500
                                                    }}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{row.pl}</td>
                                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{row.depreciation}</td>
                                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{row.distributions}</td>
                                                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: row.totalAllocColor }}>{row.totalAlloc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    </div>
                )}

                {activeTab === 'Generated History' && (
                    <div style={{ width: '100%' }}>
                         <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div style={{ padding: 16, borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Generated K-1 Forms (2024)</h3>
                            </div>
                            {generatedForms.length === 0 ? (
                                <div style={{ padding: 32, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                                    No K-1 forms generated yet. Go to "Generation & Settings" to start.
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Investor</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Generated At</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generatedForms.map((form: any) => (
                                                <tr key={form.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{form.user?.name || 'Unknown'}</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span style={{ 
                                                            backgroundColor: form.status === 'published' ? '#DCFCE7' : '#E0F2FE', 
                                                            color: form.status === 'published' ? '#10B981' : '#0EA5E9',
                                                            padding: '2px 8px',
                                                            borderRadius: 12,
                                                            fontSize: 11,
                                                            fontWeight: 500
                                                        }}>
                                                            {form.status === 'published' ? 'Published' : 'Generated'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{new Date(form.generated_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => handleView(form.id)}
                                                            style={{ marginRight: 8, padding: '4px 8px', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer' }}>
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(form.id, form.user?.name || 'Investor')}
                                                            style={{ marginRight: 8, padding: '4px 8px', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 4, backgroundColor: '#fff', cursor: 'pointer' }}>
                                                            Download
                                                        </button>
                                                        {form.status !== 'published' && (
                                                            <button 
                                                                onClick={() => handlePublish(form.id)}
                                                                style={{ padding: '4px 8px', fontSize: 12, border: '1px solid #1E3A5F', borderRadius: 4, backgroundColor: '#1E3A5F', color: '#fff', cursor: 'pointer' }}>
                                                                Email
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                         </div>
                    </div>
                )}

                {activeTab === 'Tax Packages' && (
                    <div style={{ width: '100%', padding: 32, textAlign: 'center', color: '#64748B' }}>
                        No active generation jobs.
                    </div>
                )}

            </div>

        </div>
    );
}
