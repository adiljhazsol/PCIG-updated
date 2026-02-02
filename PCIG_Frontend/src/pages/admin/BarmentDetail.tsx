import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Save
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import api from '../../services/api';

export default function BarmentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await api.get(`/admin/barment/${id}`);
            setData(response.data);
        } catch (err) {
            console.error('Error fetching barment detail:', err);
            setError('Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const handleGenerateLetter = async () => {
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
            
            // Refresh logs
            fetchData();
        } catch (err: any) {
            console.error('Failed to generate letter', err);
            
            // Handle IDM/Network interruptions gracefully
            if (err.code === 'ERR_NETWORK') {
                // This often happens if a download manager (IDM) intercepts the request
                // or if the CORS check fails but the file might still be downloading via IDM
                console.warn('Network Error detected - likely IDM interception or CORS issue');
                // Even if IDM intercepts, the server likely processed the request, so refresh the logs
                fetchData();
            } else if (err.response) {
                alert('Failed to generate letter: ' + (err.response.data?.error || 'Server error'));
            } else {
                alert('An error occurred while generating the letter.');
            }
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>No data found</div>;

    const { parcelId, address, county, status, barmentCase, notices } = data;

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#F8FAFC',
            minHeight: '100vh',
            width: '100%'
        }}>
            <AdminNav />
            
            <div style={{ padding: '24px 40px' }}>
                <button 
                    onClick={() => navigate('/admin/properties/barment')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none',
                        color: '#64748B', fontSize: 14, fontWeight: 500,
                        cursor: 'pointer', marginBottom: 24
                    }}
                >
                    <ArrowLeft size={16} /> Back to Barment Actions
                </button>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: 24
                }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                            {address}
                        </h1>
                        <p style={{ color: '#64748B', margin: 0 }}>Parcel ID: {parcelId} • {county}</p>
                    </div>
                    <button 
                        onClick={handleGenerateLetter}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#1E3A5F', color: '#FFFFFF',
                            border: 'none', borderRadius: 6, padding: '10px 16px',
                            fontSize: 14, fontWeight: 500, cursor: 'pointer'
                        }}
                    >
                        <Mail size={16} /> Generate Letter
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    {/* Main Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{
                            backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Case Details</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Status</label>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{status || 'N/A'}</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Filed Date</label>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                                        {barmentCase?.filed_date ? new Date(barmentCase.filed_date).toLocaleDateString() : 'Not Filed'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Court Date</label>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                                        {barmentCase?.court_date ? new Date(barmentCase.court_date).toLocaleDateString() : 'TBD'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Attorney</label>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                                        {barmentCase?.attorney?.name || 'Unassigned'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Letter History */}
                        <div style={{
                            backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 0, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Letter History</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead style={{ backgroundColor: '#F8FAFC' }}>
                                    <tr>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: 12 }}>Date</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: 12 }}>Type</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: 12 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notices && notices.length > 0 ? (
                                        notices.map((notice: any, idx: number) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: '16px 24px', color: '#0F172A' }}>{notice.date}</td>
                                                <td style={{ padding: '16px 24px', color: '#1E3A5F', fontWeight: 500 }}>{notice.type}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ 
                                                        backgroundColor: notice.status === 'Sent' ? '#EFF6FF' : '#ECFDF5', 
                                                        color: notice.status === 'Sent' ? '#1E3A5F' : '#059669',
                                                        padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500 
                                                    }}>
                                                        {notice.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                                                No letters generated yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{
                            backgroundColor: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button style={{
                                    width: '100%', padding: '10px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: 6,
                                    color: '#475569', fontSize: 14, fontWeight: 500, cursor: 'not-allowed', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: 8
                                }} disabled>
                                    <FileText size={16} /> View Case File
                                </button>
                                <button style={{
                                    width: '100%', padding: '10px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: 6,
                                    color: '#475569', fontSize: 14, fontWeight: 500, cursor: 'not-allowed', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: 8
                                }} disabled>
                                    <Clock size={16} /> Schedule Hearing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
