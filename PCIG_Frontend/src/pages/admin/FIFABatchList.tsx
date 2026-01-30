import React, { CSSProperties, useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';

export default function FIFABatchList() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchBatches();
  }, [page]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/fifa/imports?page=${page}`);
      setBatches(response.data.data);
      setPagination(response.data);
    } catch (error) {
      console.error('Failed to fetch batches', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#DCFCE7', text: '#166534' };
      case 'processing': return { bg: '#FFFBEB', text: '#D97706' };
      case 'failed': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
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
    padding: isMobile ? 12 : 20,
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/admin/properties/fifa-import')}
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
                Import Batches
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0 0' }}>
                View and manage all FIFA import batches
              </p>
            </div>
          </div>

          {/* Table Card */}
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Batch Name</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Uploaded By</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Items</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        Loading batches...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    batches.map((batch) => {
                      const statusStyle = getStatusColor(batch.status);
                      return (
                        <tr key={batch.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0F172A' }}>
                            {batch.file_name}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {new Date(batch.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {batch.imported_by?.name || 'Unknown'}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>
                            {batch.total_rows}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 500,
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                textTransform: 'capitalize'
                              }}
                            >
                              {batch.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => navigate(`/admin/properties/fifa-import/${batch.id}`)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={!pagination.prev_page_url}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #E2E8F0',
                      backgroundColor: pagination.prev_page_url ? '#FFFFFF' : '#F1F5F9',
                      color: pagination.prev_page_url ? '#64748B' : '#94A3B8',
                      cursor: pagination.prev_page_url ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={!pagination.next_page_url}
                    onClick={() => setPage(p => p + 1)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #E2E8F0',
                      backgroundColor: pagination.next_page_url ? '#FFFFFF' : '#F1F5F9',
                      color: pagination.next_page_url ? '#64748B' : '#94A3B8',
                      cursor: pagination.next_page_url ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
