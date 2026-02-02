import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
    List,
    Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import AdminNav from '../../components/admin/AdminNav';

// Document Management Screen - Desktop View Implementation

export default function PropertyDocuments() {
    const { id } = useParams();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // Use provided ID or fallback to a default if testing without routing ID
    const propertyId = id || "1"; 
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter, Sort, and Action State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    
    // Refs for click outside handling
    const sortMenuRef = useRef<HTMLDivElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for file upload
    const [uploadFolderType, setUploadFolderType] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
            // For action menu, we might need a more complex check if we have multiple buttons, 
            // but usually clicking outside the *menu* closes it. 
            // Since actionMenuRef will point to the currently open menu, this works.
            // However, since we map over rows, we need to be careful. 
            // A simple global click listener that closes action menu if click is not on the button is easier.
            if (openActionId !== null && !(event.target as Element).closest('.action-button')) {
                setOpenActionId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openActionId]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/admin/properties/${propertyId}/documents-dashboard`);
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError('Failed to load document data');
            }
        } catch (err) {
            console.error('Error fetching document data:', err);
            setError('Failed to load document data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [propertyId]);

    const handleUploadClick = (types: string[]) => {
        if (types && types.length > 0) {
            setUploadFolderType(types[0]);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset input
                fileInputRef.current.click();
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadFolderType) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', uploadFolderType);

        try {
            await api.post(`/admin/properties/${propertyId}/documents`, formData);
            // Refresh data
            fetchData();
            // Optional: Show success toast/alert
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setUploadFolderType(null);
        }
    };

    const handleDownloadClick = async (types: string[], folderName: string) => {
        try {
            const response = await api.get(`/admin/properties/${propertyId}/documents/download`, {
                params: { types: types.join(',') },
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Try to get filename from content-disposition header if possible, 
            // but for simplicity we can construct one or default to zip
            const isZip = response.headers['content-type'] === 'application/zip';
            const ext = isZip ? 'zip' : 'pdf'; // Default fallback
            const filename = `documents_${folderName.replace(/\s+/g, '_')}.${ext}`;
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error downloading documents:', error);
            alert('Failed to download documents. No files may exist in this folder.');
        }
    };

    const UploadModal = () => {
        if (!isUploadModalOpen) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    width: '100%',
                    maxWidth: 600,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: 24,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Upload Documents</h2>
                        <button 
                            onClick={() => setIsUploadModalOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                        >
                            <span style={{ fontSize: 24 }}>×</span>
                        </button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: 12 }}>
                        {folders.map((folder: any, idx: number) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ color: '#64748B' }}>{getIcon(folder.icon)}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{folder.name}</div>
                                        <div style={{ fontSize: 12, color: '#64748B' }}>{folder.description}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUploadClick(folder.types)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '8px 12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        color: '#0F172A',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Upload size={14} /> Upload
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 10px' }} />
                <div>{error || 'Document data not found'}</div>
            </div>
        );
    }

    const rawHeader = data?.header || {};
    const header = {
        id: rawHeader.id || '',
        address: rawHeader.address || '',
        status: rawHeader.status || '',
        location: rawHeader.location || '',
        totalFiles: rawHeader.totalFiles || 0,
        missingRequired: rawHeader.missingRequired || 0
    };
    const alert = data?.alert || null;
    const folders = Array.isArray(data?.folders) ? data.folders : [];
    const allDocuments = Array.isArray(data?.documents) ? data.documents : [];

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

    // Filter and Sort Logic
    const filteredFiles = allDocuments.filter((file: any) => {
        const matchesSearch = (file.name && file.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (file.category && file.category.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesFolder = selectedFolder 
            ? folders.find((f: any) => f.id === selectedFolder)?.types?.includes(file.type)
            : true;

        return matchesSearch && matchesFolder;
    });

    const processedFiles = [...filteredFiles].sort((a: any, b: any) => {
        if (!sortConfig) return 0;
        
        const { key, direction } = sortConfig;
        
        let aValue = a[key];
        let bValue = b[key];

        // Handle string comparison case-insensitively
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        // Handle size (remove ' KB' and parse float)
        if (key === 'size') {
            aValue = parseFloat(a[key].replace(/,/g, '').split(' ')[0]) || 0;
            bValue = parseFloat(b[key].replace(/,/g, '').split(' ')[0]) || 0;
        }

        // Handle date (parse date)
        if (key === 'date') {
            aValue = new Date(a[key]).getTime();
            bValue = new Date(b[key]).getTime();
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setIsSortMenuOpen(false);
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
                        <button 
                            onClick={() => setSelectedFolder(null)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', 
                                backgroundColor: !selectedFolder ? '#F1F5F9' : '#fff', 
                                border: '1px solid #E2E8F0', borderRadius: 6, 
                                color: !selectedFolder ? '#0F172A' : '#64748B', 
                                fontWeight: 500, fontSize: 13, cursor: 'pointer' 
                            }}
                        >
                            <LayoutGrid size={16} /> All Folders
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, color: '#0F172A', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            <Download size={16} /> Download All
                        </button>
                        <button 
                            onClick={() => setIsUploadModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: '#1E3A5F', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
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
                        <button 
                            onClick={() => setIsUploadModalOpen(true)}
                            style={{ backgroundColor: '#fff', border: '1px solid #FECACA', color: '#B91C1C', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Upload Now
                        </button>
                    </div>
                )}


                <UploadModal />

                {/* Folders Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : 'repeat(4, 1fr)'),
                    gap: 16,
                    marginBottom: 32,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    {folders.map((folder: any, idx: number) => {
                        const isSelected = selectedFolder === folder.id;
                        return (
                        <div key={idx} 
                            onClick={() => setSelectedFolder(isSelected ? null : folder.id)}
                            style={{
                                backgroundColor: isSelected ? '#F8FAFC' : '#fff',
                                border: isSelected ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                                borderRadius: 8,
                                padding: 20,
                                position: 'relative',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                transition: 'all 0.2s',
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
                                backgroundColor: folder.missing ? '#FEF2F2' : (isSelected ? '#DBEAFE' : '#F1F5F9'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: folder.missing ? '#DC2626' : (isSelected ? '#2563EB' : '#64748B')
                            }}>
                                {getIcon(folder.icon)}
                            </div>

                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#1E3A5F' : '#0F172A', marginBottom: 4 }}>{folder.name}</div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>{folder.description}</div>
                            </div>

                            <div style={{ 
                                marginTop: 'auto', 
                                display: 'flex', 
                                gap: 8,
                                paddingTop: 12
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUploadClick(folder.types);
                                    }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        padding: '6px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        color: '#475569',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <Upload size={12} /> Upload
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadClick(folder.types, folder.name);
                                    }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        padding: '6px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 4,
                                        color: '#475569',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <Download size={12} /> Download
                                </button>
                            </div>

                            <div style={{ paddingTop: 8, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#2563EB' : '#64748B', backgroundColor: isSelected ? '#DBEAFE' : '#F8FAFC', padding: '2px 8px', borderRadius: 4 }}>{folder.count}</span>
                                <ChevronRight size={14} color={isSelected ? "#2563EB" : "#94A3B8"} />
                            </div>
                        </div>
                    )})}
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                />


                {/* Documents Table */}
                <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {selectedFolder 
                                ? folders.find((f: any) => f.id === selectedFolder)?.name 
                                : 'All Documents'}
                        </h3>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ padding: '8px 12px 8px 32px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 6, outline: 'none', width: 200 }}
                                />
                            </div>
                            <div style={{ position: 'relative' }} ref={sortMenuRef}>
                                <button 
                                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 6, backgroundColor: '#fff', fontSize: 13, fontWeight: 500, color: '#64748B', cursor: 'pointer' }}
                                >
                                    Sort <Filter size={12} />
                                </button>
                                {isSortMenuOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: 4,
                                        backgroundColor: '#fff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 6,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        zIndex: 10,
                                        minWidth: 150
                                    }}>
                                        {['name', 'date', 'size', 'category', 'status'].map((key) => (
                                            <div 
                                                key={key}
                                                onClick={() => handleSort(key)}
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: 13,
                                                    color: '#0F172A',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: sortConfig?.key === key ? '#F1F5F9' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = sortConfig?.key === key ? '#F1F5F9' : 'transparent'}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                                {sortConfig?.key === key && (
                                                    <span style={{ fontSize: 10, color: '#64748B' }}>
                                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <tr>
                                    <th onClick={() => handleSort('name')} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', width: '40%', cursor: 'pointer' }}>
                                        Document Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('category')} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                                        Category {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('date')} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                                        Date Uploaded {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('size')} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                                        Size {sortConfig?.key === 'size' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer' }}>
                                        Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748B' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedFiles.length > 0 ? (
                                    processedFiles.map((file: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ color: file.iconColor }}>{getIcon(file.icon)}</div>
                                                    <span 
                                                        onClick={() => alert(`View details for ${file.name}`)}
                                                        style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', cursor: 'pointer', textDecoration: 'none' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                    >
                                                        {file.name}
                                                    </span>
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
                                            <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                                                <button 
                                                    className="action-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenActionId(openActionId === idx ? null : idx);
                                                    }}
                                                    style={{ padding: 4, borderRadius: 4, border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B', backgroundColor: openActionId === idx ? '#F1F5F9' : 'transparent' }}
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                                {openActionId === idx && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 24,
                                                        top: 40,
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #E2E8F0',
                                                        borderRadius: 6,
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                        zIndex: 10,
                                                        minWidth: 140,
                                                        textAlign: 'left'
                                                    }}>
                                                        <div onClick={() => { alert('Download feature coming soon'); setOpenActionId(null); }} style={{ padding: '8px 12px', fontSize: 13, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #F1F5F9' }}>
                                                            <Download size={14} /> Download
                                                        </div>
                                                        <div onClick={() => { alert('View details feature coming soon'); setOpenActionId(null); }} style={{ padding: '8px 12px', fontSize: 13, color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #F1F5F9' }}>
                                                            <FileText size={14} /> View Details
                                                        </div>
                                                        <div onClick={() => { alert('Delete feature coming soon'); setOpenActionId(null); }} style={{ padding: '8px 12px', fontSize: 13, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <FileWarning size={14} /> Delete
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                                            No files found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
