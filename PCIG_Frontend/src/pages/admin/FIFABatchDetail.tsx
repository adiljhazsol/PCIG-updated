import React, { CSSProperties, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

export default function FIFABatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const [batch, setBatch] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      const response = await api.get(`/admin/fifa/imports/${id}`);
      setBatch(response.data.batch);
      setErrors(response.data.errors || []);
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Failed to fetch batch details', error);
      alert('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#DCFCE7', text: '#166534', icon: CheckCircle2 };
      case 'processing': return { bg: '#FFFBEB', text: '#D97706', icon: Clock };
      case 'failed': return { bg: '#FEE2E2', text: '#991B1B', icon: AlertCircle };
      default: return { bg: '#F3F4F6', text: '#4B5563', icon: FileSpreadsheet };
    }
  };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden'
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 16 : 24,
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0
  };

  if (loading) {
    return (
      <div style={{ ...pageWrapperStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#64748B' }}>Loading batch details...</div>
      </div>
    );
  }

  if (!batch) return null;

  const StatusIcon = getStatusColor(batch.status).icon;
  const statusStyle = getStatusColor(batch.status);

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />
      <div
        style={{
          padding: isMobile ? '16px 12px' : isTablet ? '20px 20px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/admin/properties/fifa-import/batches')}
              style={{
                background: 'none',
                border: 'none',
                padding: 8,
                cursor: 'pointer',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {batch.file_name}
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0 0' }}>
                Batch ID: {batch.id} • Uploaded on {new Date(batch.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  color: statusStyle.text, 
                  backgroundColor: statusStyle.bg, 
                  padding: 4, 
                  borderRadius: '50%',
                  display: 'flex'
                }}>
                  <StatusIcon size={16} />
                </div>
                <span style={{ fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{batch.status}</span>
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Total Rows</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#0F172A' }}>{batch.total_rows}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Successful</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#166534' }}>{batch.success_count}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>Errors</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#991B1B' }}>{batch.error_count}</div>
            </div>
          </div>

          {/* Imported Properties Section */}
          {properties.length > 0 && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color="#166534" />
                Imported Properties
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Parcel ID</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Address</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Location</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>County</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Purchase Price</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Current Value</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 500 }}>
                          {property.parcel_id}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          {property.address}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          {property.city}, {property.state} {property.zip_code}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          {property.county}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          ${Number(property.purchase_price).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>
                          ${Number(property.current_value).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            backgroundColor: '#F1F5F9', 
                            color: '#475569', 
                            padding: '2px 8px', 
                            borderRadius: 9999, 
                            fontSize: 12, 
                            fontWeight: 500,
                            textTransform: 'capitalize' 
                          }}>
                            {property.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors Section */}
          {errors.length > 0 && (
            <div style={cardStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#991B1B', marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={20} />
                Import Errors
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600, width: 100 }}>Row #</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Error Message</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Row Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error: any) => (
                      <tr key={error.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FEF2F2' }}>
                        <td style={{ padding: '14px 16px', color: '#991B1B', fontWeight: 500 }}>
                          {error.row_number}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#991B1B' }}>
                          {error.error_message}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#4B5563' }}>
                          {typeof error.row_data === 'string' ? error.row_data : JSON.stringify(error.row_data)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
