import { useState } from 'react';
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
import adminData from '../../data/admin.json';

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

    const data = (adminData as any).k1Generation;
    const stats = data.stats;
    const tableData = data.tableData;
    const samplePreview = data.samplePreview;

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
                        <button style={{
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
                            cursor: 'pointer',
                            flex: isMobile ? '1 1 100%' : 'initial'
                        }}>
                            <Play size={16} />
                            Generate All K-1s
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
                                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>267</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
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

                        <button style={{
                            width: '100%',
                            maxWidth: '100%',
                            padding: '12px',
                            backgroundColor: '#1E3A5F',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}>
                            Generate K-1 Package
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
                                        <button style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 12, backgroundColor: '#fff', color: '#0F172A', cursor: 'pointer' }}>
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

            </div>

        </div>
    );
}
