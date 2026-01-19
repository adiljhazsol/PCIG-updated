import { useState } from 'react';
import {
    TrendingDown,
    Home,
    Users,
    AlertCircle,
    Search,
    ChevronDown,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Responsive implementation for Depreciation & Tax Allocation Module

export default function DepreciationTaxAllocation() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    const data = adminData.depreciationTaxAllocation;
    const { header, stats, tabs, filters, taxYearBadge, table, configPanel } = data;

    const [activeTab, setActiveTab] = useState('property-depreciation');
    const [selectedProperty, setSelectedProperty] = useState(0);
    const [showConfigPanel, setShowConfigPanel] = useState(false);

    const getIcon = (iconName: string) => {
        const icons: any = { TrendingDown, Home, Users, AlertCircle };
        const Icon = icons[iconName];
        return Icon ? <Icon size={20} /> : null;
    };

    const getStatusBadge = (status: string, color: string) => {
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

    const getMethodBadge = (method: string, color: string) => {
        const colors: any = {
            'blue': { bg: '#EFF6FF', text: '#6474BB' },
            'purple': { bg: '#F5F3FF', text: '#7C3AED' },
            'orange': { bg: '#FFF7ED', text: '#B45309' },
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
                fontWeight: 600,
                display: 'inline-block'
            }}>
                {method}
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

                {/* Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: isMobile ? 16 : 32,
                    borderBottom: '1px solid #E2E8F0',
                    marginBottom: 24,
                    overflowX: isMobile ? 'auto' : 'visible',
                    whiteSpace: isMobile ? 'nowrap' : 'normal'
                }}>
                    {tabs.map((tab: any, idx: number) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid #1E3A5F' : '2px solid transparent',
                                    padding: '12px 4px',
                                    fontSize: 14,
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? '#1E3A5F' : '#64748B',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                {tab.label}
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
                                placeholder="Search properties, parcel IDs..."
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
                            Clear Filters
                        </button>
                    </div>
                    <div style={{
                        backgroundColor: '#ECFDF5',
                        color: '#047857',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        width: isMobile ? '100%' : 'auto',
                        textAlign: 'center'
                    }}>
                        {taxYearBadge.label}
                    </div>
                </div>

                {/* Split Layout: Table + Config Panel */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1fr 400px',
                    gap: 24
                }}>
                    {/* Left: Table */}
                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        display: (isMobile || isTablet) && showConfigPanel ? 'none' : 'block',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #E2E8F0'
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{table.title}</h3>
                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{table.subtitle}</div>
                        </div>

                        <div style={{
                            overflowX: 'auto',
                            overflowY: 'auto',
                            maxHeight: isMobile ? '400px' : 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: '1400px' }}>
                                <thead style={{ position: isMobile ? 'sticky' : 'static', top: 0, zIndex: 10 }}>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        {table.headers.map((header: string, idx: number) => (
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
                                    {table.rows.map((row: any, idx: number) => (
                                        <tr
                                            key={idx}
                                            style={{
                                                borderBottom: '1px solid #E2E8F0',
                                                backgroundColor: selectedProperty === idx ? '#F8FAFC' : '#fff',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setSelectedProperty(idx);
                                                if (isMobile || isTablet) {
                                                    setShowConfigPanel(true);
                                                }
                                            }}
                                        >
                                            <td style={{ padding: '16px' }}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{row.property}</div>
                                                <div style={{ fontSize: 12, color: '#64748B' }}>{row.pcigId}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {getStatusBadge(row.status, row.statusColor)}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.costBasis}</div>
                                                {row.costBasisLabel && <div style={{ fontSize: 11, color: '#94A3B8' }}>{row.costBasisLabel}</div>}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {getMethodBadge(row.method, row.methodColor)}
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600, color: '#0F172A' }}>{row.annualDepr}</td>
                                            <td style={{ padding: '16px', color: '#64748B' }}>{row.cumulative}</td>
                                            <td style={{ padding: '16px', color: '#64748B' }}>{row.inService}</td>
                                            <td style={{ padding: '16px' }}>
                                                {row.status === 'Active' ? (
                                                    <ChevronRight size={18} style={{ color: '#64748B' }} />
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

                    {/* Right: Configuration Panel */}
                    <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: 24,
                        height: 'fit-content',
                        display: (isMobile || isTablet) && !showConfigPanel ? 'none' : 'block'
                    }}>
                        {/* Back button for mobile/tablet */}
                        {(isMobile || isTablet) && (
                            <button
                                onClick={() => setShowConfigPanel(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1E3A5F',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginBottom: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                ← Back to List
                            </button>
                        )}

                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Depreciation Configuration</h3>
                        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
                            {configPanel.property} ({configPanel.pcigId})
                        </div>

                        {/* Cost Basis Setup */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{configPanel.costBasisSetup.title}</h4>
                                <span style={{ fontSize: 12, color: '#64748B' }}>{configPanel.costBasisSetup.taxYear}</span>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                                    {configPanel.costBasisSetup.totalAcquisitionCost.label}
                                </label>
                                <input
                                    type="text"
                                    value={configPanel.costBasisSetup.totalAcquisitionCost.value}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        color: '#0F172A'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                                    {configPanel.costBasisSetup.landValue.label}
                                </label>
                                <input
                                    type="text"
                                    value={configPanel.costBasisSetup.landValue.value}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        color: '#0F172A'
                                    }}
                                />
                            </div>

                            <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 6 }}>
                                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                                    {configPanel.costBasisSetup.depreciableBuildingBasis.label}
                                </div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                                    {configPanel.costBasisSetup.depreciableBuildingBasis.value}
                                </div>
                            </div>
                        </div>

                        {/* Method Configuration */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{configPanel.methodConfiguration.title}</h4>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                                    {configPanel.methodConfiguration.depreciationMethod.label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select style={{
                                        appearance: 'none',
                                        width: '100%',
                                        padding: '8px 32px 8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        color: '#0F172A',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer'
                                    }}>
                                        {configPanel.methodConfiguration.depreciationMethod.options.map((opt: string, i: number) => (
                                            <option key={i}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                                    {configPanel.methodConfiguration.convention.label}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select style={{
                                        appearance: 'none',
                                        width: '100%',
                                        padding: '8px 32px 8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        color: '#0F172A',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer'
                                    }}>
                                        {configPanel.methodConfiguration.convention.options.map((opt: string, i: number) => (
                                            <option key={i}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                                    {configPanel.methodConfiguration.placedInService.label}
                                </label>
                                <input
                                    type="text"
                                    value={configPanel.methodConfiguration.placedInService.value}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        color: '#0F172A'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 2024 Calculation Preview */}
                        <div style={{ marginBottom: 24, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{configPanel.calculationPreview.title}</h4>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: '#64748B' }}>{configPanel.calculationPreview.basisForDepr.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{configPanel.calculationPreview.basisForDepr.value}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: 13, color: '#64748B' }}>{configPanel.calculationPreview.rate.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{configPanel.calculationPreview.rate.value}</span>
                            </div>

                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{configPanel.calculationPreview.annualDepreciation.label}</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F' }}>{configPanel.calculationPreview.annualDepreciation.value}</span>
                            </div>
                        </div>

                        {/* Cumulative Progress */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{configPanel.cumulativeProgress.title}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>{configPanel.cumulativeProgress.percentage}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>{configPanel.cumulativeProgress.depreciated} depreciated</div>
                            <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: configPanel.cumulativeProgress.percentage, height: '100%', backgroundColor: '#10B981' }}></div>
                            </div>
                        </div>

                        {/* Investor Allocations */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{configPanel.investorAllocations.title}</h4>
                            <table style={{ width: '100%', fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        {configPanel.investorAllocations.headers.map((header: string, idx: number) => (
                                            <th key={idx} style={{ textAlign: 'left', padding: '8px 0', color: '#64748B', fontWeight: 600 }}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {configPanel.investorAllocations.rows.map((row: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '8px 0', color: '#0F172A' }}>{row.investor}</td>
                                            <td style={{ padding: '8px 0', color: '#64748B' }}>{row.share}</td>
                                            <td style={{ padding: '8px 0', color: '#0F172A', fontWeight: 600 }}>{row.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                            <button style={{
                                flex: 1,
                                backgroundColor: '#1E3A5F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '10px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                {configPanel.actions.saveChanges}
                            </button>
                            <button style={{
                                flex: isMobile ? 1 : 'initial',
                                backgroundColor: '#fff',
                                color: '#1E3A5F',
                                border: '1px solid #E2E8F0',
                                borderRadius: 6,
                                padding: '10px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                {configPanel.actions.recalculate}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
