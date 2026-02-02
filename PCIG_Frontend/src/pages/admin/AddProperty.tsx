import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, MapPin, DollarSign, FileText, Upload, AlertCircle, Loader2, X, File, Share2 } from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Mock options
const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Condo', 'Townhouse', 'Commercial', 'Land'];
const STATUSES = ['Active', 'Pending', 'Sold', 'Archived'];
const STAGES = ['Research', 'FIFA Processing', 'Auction', 'Redemption', 'Barment', 'Quiet Title', 'REO', 'Surplus'];

export default function AddProperty() {
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        // Core Info
        address: '',
        city: '',
        state: 'FL',
        zip: '',
        county: '',
        parcelId: '',
        type: 'Single Family',
        legalDescription: '',
        zoning: '',
        lotSize: '',
        yearBuilt: '',

        // Financials
        estimatedArv: '',
        taxValue: '',
        bidAmount: '',
        interestRate: '12%',

        // Tokenization
        totalShares: '',
        pricePerShare: '',

        // Workflow
        status: 'Active',
        stage: 'Research',
        redemptionDeadline: '',
        auctionDate: '',

        // Description
        notes: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const getBackendStage = (frontendStage: string) => {
        switch(frontendStage) {
            case 'Research': return 'research';
            case 'FIFA Processing': return 'fifa_processing';
            case 'Auction': return 'auction';
            case 'Redemption': return 'redemption';
            case 'Barment': return 'barment';
            case 'Quiet Title': return 'quiet_title';
            case 'REO': return 'reo_disposition';
            case 'Surplus': return 'surplus';
            default: return 'research';
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Filter for images and size limit (10MB)
            const validFiles = filesArray.filter(file => {
                const isImage = file.type.startsWith('image/');
                const isUnderLimit = file.size <= 10 * 1024 * 1024; // 10MB
                return isImage && isUnderLimit;
            });
            
            if (validFiles.length !== filesArray.length) {
                // Could set a warning message here about skipped files
                console.warn('Some files were skipped due to type or size constraints');
            }
            
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                parcel_id: formData.parcelId,
                property_type: formData.type,
                legal_description: formData.legalDescription,
                zoning: formData.zoning,
                lot_size: formData.lotSize,
                year_built: formData.yearBuilt,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip,
                county: formData.county,
                status: formData.status.toLowerCase(),
                workflow_stage: getBackendStage(formData.stage),
                current_value: formData.estimatedArv ? parseFloat(formData.estimatedArv.replace(/[^0-9.]/g, '')) : 0,
                assessed_value: formData.taxValue ? parseFloat(formData.taxValue.replace(/[^0-9.]/g, '')) : 0,
                purchase_price: formData.bidAmount ? parseFloat(formData.bidAmount.replace(/[^0-9.]/g, '')) : 0,
                roi: formData.interestRate ? parseFloat(formData.interestRate.replace(/[^0-9.]/g, '')) : 0,
                purchase_date: formData.auctionDate || null,
                redemption_deadline: formData.redemptionDeadline || null,
                description: formData.notes,
                // Tokenization fields
                total_shares: formData.totalShares ? parseInt(formData.totalShares.replace(/[^0-9]/g, '')) : 0,
                price_per_share: formData.pricePerShare ? parseFloat(formData.pricePerShare.replace(/[^0-9.]/g, '')) : 0,
            };

            // Calculate available shares if not provided (default to total)
            // Backend handles this too, but we can be explicit if needed.
            // For now, let backend handle the default logic: available = total if available is null.
            
            const response = await api.post('/admin/properties', payload);

            if (response.data.success) {
                const propertyId = response.data.data.id;
                
                // Upload images if any
                if (selectedFiles.length > 0) {
                    try {
                        const uploadPromises = selectedFiles.map((file, index) => {
                            const formData = new FormData();
                            formData.append('property_id', propertyId);
                            formData.append('image', file);
                            formData.append('is_primary', index === 0 ? '1' : '0'); // First image is primary
                            formData.append('order', index.toString());
                            
                            return api.post('/admin/properties/upload-image', formData);
                        });
                        
                        await Promise.all(uploadPromises);
                    } catch (uploadError) {
                        console.error('Error uploading images:', uploadError);
                        // We don't stop navigation if images fail, but we could warn the user
                        // Ideally show a toast notification here
                    }
                }

                navigate('/admin/properties');
            } else {
                setError(response.data.message || 'Failed to create property');
            }
        } catch (err: any) {
            console.error('Error creating property:', err);
            if (err.response && err.response.data && err.response.data.errors) {
                // Format validation errors
                const messages = Object.values(err.response.data.errors).flat().join(', ');
                setError(messages);
            } else {
                setError('An error occurred while creating the property. Please check your inputs.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <AdminNav />

            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                padding: isMobile ? '16px 16px 32px' : isTablet ? '24px 32px' : '32px 40px',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: -8,
                            color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: `clamp(20px, 2.5vw, 24px)`, fontWeight: 700, color: '#0F172A', margin: 0 }}>Add New Property</h1>
                        <p style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, color: '#64748B', margin: '4px 0 0 0' }}>Enter property details to initialize workflow.</p>
                    </div>
                </div>

                {error && (
                    <div style={{ 
                        backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', 
                        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: '#991B1B' 
                    }}>
                        <AlertCircle size={20} />
                        <span style={{ fontSize: 14 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>

                    {/* Section 1: Core Information */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <MapPin size={18} color="#64748B" /> Core Information
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Street Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="e.g. 1240 Oak Street"
                                    required
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="City"
                                        required
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.zip}
                                        onChange={(e) => handleChange('zip', e.target.value)}
                                        placeholder="Zip"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>County</label>
                                    <input
                                        type="text"
                                        value={formData.county}
                                        onChange={(e) => handleChange('county', e.target.value)}
                                        placeholder="County Name"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Parcel ID / APN</label>
                                    <input
                                        type="text"
                                        value={formData.parcelId}
                                        onChange={(e) => handleChange('parcelId', e.target.value)}
                                        placeholder="XX-XX-XX-XX"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Property Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                    >
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Legal Description</label>
                                <textarea
                                    value={formData.legalDescription}
                                    onChange={(e) => handleChange('legalDescription', e.target.value)}
                                    placeholder="Legal Description"
                                    rows={3}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Zoning</label>
                                    <input
                                        type="text"
                                        value={formData.zoning}
                                        onChange={(e) => handleChange('zoning', e.target.value)}
                                        placeholder="e.g. R1"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Lot Size</label>
                                    <input
                                        type="text"
                                        value={formData.lotSize}
                                        onChange={(e) => handleChange('lotSize', e.target.value)}
                                        placeholder="e.g. 0.25 acres"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Year Built</label>
                                    <input
                                        type="text"
                                        value={formData.yearBuilt}
                                        onChange={(e) => handleChange('yearBuilt', e.target.value)}
                                        placeholder="e.g. 1985"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Financials */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <DollarSign size={18} color="#64748B" /> Financials
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Estimated ARV</label>
                                <input
                                    type="text"
                                    value={formData.estimatedArv}
                                    onChange={(e) => handleChange('estimatedArv', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Assessed Tax Value</label>
                                <input
                                    type="text"
                                    value={formData.taxValue}
                                    onChange={(e) => handleChange('taxValue', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Bid / Purchase Amount</label>
                                <input
                                    type="text"
                                    value={formData.bidAmount}
                                    onChange={(e) => handleChange('bidAmount', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Interest Rate</label>
                                <input
                                    type="text"
                                    value={formData.interestRate}
                                    onChange={(e) => handleChange('interestRate', e.target.value)}
                                    placeholder="%"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2.5: Tokenization / Investment */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <Share2 size={18} color="#64748B" /> Tokenization & Investment
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Total Shares</label>
                                <input
                                    type="number"
                                    value={formData.totalShares}
                                    onChange={(e) => handleChange('totalShares', e.target.value)}
                                    placeholder="e.g. 1000"
                                    min="0"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                                <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                    Set &gt; 0 to make visible to investors.
                                </p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Price Per Share</label>
                                <input
                                    type="text"
                                    value={formData.pricePerShare}
                                    onChange={(e) => handleChange('pricePerShare', e.target.value)}
                                    placeholder="$0.00"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Legal & Workflow */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <Building size={18} color="#64748B" /> Workflow & Legal
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Initial Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Workflow Stage</label>
                                <select
                                    value={formData.stage}
                                    onChange={(e) => handleChange('stage', e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Auction Date</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={formData.auctionDate}
                                        onChange={(e) => handleChange('auctionDate', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Redemption Deadline</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={formData.redemptionDeadline}
                                        onChange={(e) => handleChange('redemptionDeadline', e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Media & Notes */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: isMobile ? 16 : 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 4, height: 16, backgroundColor: '#1E3A5F', borderRadius: 2 }}></div>
                            <FileText size={18} color="#64748B" /> Media & Notes
                        </h2>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 12 }}>Property Photos</label>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }} 
                                    multiple 
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                                <div 
                                    onClick={triggerFileInput}
                                    style={{
                                        border: '2px dashed #E2E8F0', borderRadius: 8, padding: 32,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                                        cursor: 'pointer', backgroundColor: '#F8FAFC', transition: 'all 0.2s'
                                    }}
                                >
                                    <Upload color="#94A3B8" size={32} />
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>Click to upload</span>
                                        <span style={{ fontSize: 14, color: '#64748B' }}> or drag and drop</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: '#94A3B8' }}>JPG, PNG up to 10MB</span>
                                </div>
                                
                                {selectedFiles.length > 0 && (
                                    <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} style={{ 
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '8px 12px', backgroundColor: '#F1F5F9', borderRadius: 6,
                                                fontSize: 13, color: '#334155'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <File size={14} color="#64748B" />
                                                    <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {file.name}
                                                    </span>
                                                    <span style={{ color: '#94A3B8', fontSize: 12 }}>
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#EF4444' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Internal Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    placeholder="Add any initial notes, access codes, or important details..."
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '12px 24px', borderRadius: 8, border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF', color: '#64748B', fontSize: 14, fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '12px 24px', borderRadius: 8, border: 'none',
                                backgroundColor: '#1E3A5F', color: '#FFFFFF', fontSize: 14, fontWeight: 600,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? 'Creating...' : 'Create Property'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
