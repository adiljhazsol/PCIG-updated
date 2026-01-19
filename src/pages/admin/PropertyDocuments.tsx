import { useState } from 'react';
import {
    Share2,
    Edit,
    MoreVertical,
    AlertCircle,
    FileText,
    FileWarning,
    File,
    Mail,
    Gavel,
    DollarSign,
    Home,
    FileBarChart,
    Shield,
    Scale,
    Download,
    Upload,
    Filter,
    Search,
    ChevronRight,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    Image,
    LayoutGrid,
    List
} from 'lucide-react';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Document Management Screen - Desktop View Implementation

export default function PropertyDocuments() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // Mock ID for demo purposes
    const propertyId = "PCIG-2024-001";
    const data = (adminData as any).propertyDocuments[propertyId];

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    if (!data) return <div>Property Documents not found</div>;

    const { header, alert, folders, recentUploads } = data;

    const getIcon = (iconName: string) => {
        const icons: any = {
            FileText, FileWarning, File, Mail, Gavel, DollarSign, Home, FileBarChart, Shield, Scale,
            FileSpreadsheet, Image
        };
        const Icon = icons[iconName] || File;
        return <Icon size={20} />;
    };

    const getStatusBadge = (status: string, color: string, bg: string) => (
        <span style={{
            backgroundColor: bg,
            color: color,
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            display: 'inline-block'
        }}>
            {status}
        </span>
    );

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
                maxWidth: 1600,
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: 24,
                    gap: isMobile ? 16 : 0,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                            <span>Properties</span>
                            <ChevronRight size={14} />
                            <span>{header.id}</span>
                        </div>
                        <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#0F172A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {header.address}
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: 16 }}>{header.status}</span>
                        </h1>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13, color: '#64748B' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                Location: <span style={{ color: '#0F172A', fontWeight: 500 }}>{header.location}</span>
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 24 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{header.totalFiles}</div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Total Files</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>{header.missingRequired}</div>
                            <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 500 }}>Missing Required</div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, color: '#64748B', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                            <LayoutGrid size={16} /> Folders
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, color: '#64748B', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
                            <List size={16} /> All Files
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, color: '#0F172A', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            <Download size={16} /> Download All
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#1E3A5F', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            <Upload size={16} /> Upload Documents
                        </button>
                    </div>
                </div>

                {/* Alert Banner */}
                {alert && (
                    <div style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: 6,
                        padding: '12px 16px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#B91C1C', fontSize: 13, fontWeight: 500 }}>
                            <AlertCircle size={18} />
                            {alert.message}
                        </div>
                        <button style={{ backgroundColor: '#fff', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Upload Now
                        </button>
                    </div>
                )}


                {/* Folders Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'),
                    gap: 16,
                    marginBottom: 32,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {folders.map((folder: any, idx: number) => (
                        <div key={idx} style={{
                            backgroundColor: '#fff',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            padding: 20,
                            position: 'relative',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            transition: 'box-shadow 0.2s',
                        }}>
                            {folder.hasNew && (
                                <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
                            )}
                            {folder.missing && (
                                <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                            )}

                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                backgroundColor: folder.missing ? '#FEF2F2' : '#F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: folder.missing ? '#DC2626' : '#64748B'
                            }}>
                                {getIcon(folder.icon)}
                            </div>

                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{folder.name}</div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>{folder.description}</div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', backgroundColor: '#F8FAFC', padding: '2px 8px', borderRadius: 4 }}>{folder.count}</span>
                                <ChevronRight size={14} color="#94A3B8" />
                            </div>
                        </div>
                    ))}
                </div>


                {/* Recent Uploads Table */}
                <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Uploads</h3>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    style={{ padding: '8px 12px 8px 32px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 6, outline: 'none', width: 200 }}
                                />
                            </div>
                            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', fontSize: 13, fontWeight: 500, color: '#64748B', cursor: 'pointer' }}>
                                Sort <Filter size={12} />
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', width: '40%' }}>Document Name</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Category</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Date Uploaded</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Size</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Status</th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUploads.map((file: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ color: file.iconColor }}>{getIcon(file.icon)}</div>
                                                <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{file.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: 12, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: 4 }}>{file.category}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#0F172A' }}>{file.date}</td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748B' }}>{file.size}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {getStatusBadge(file.status, file.statusColor, file.statusBg)}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button style={{ padding: 4, borderRadius: 4, border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B' }}>
                                                <MoreVertical size={14} />
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
