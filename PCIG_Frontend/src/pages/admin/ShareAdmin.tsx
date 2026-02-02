import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  PieChart,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import api from '../../services/api';

interface ShareListing {
  id: number;
  property: {
    address: string;
    city: string;
    state: string;
  };
  seller: {
    name: string;
    email: string;
  };
  shares: number;
  price_per_share: string;
  total_price: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  total_volume: string;
}

export default function ShareAdmin() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    total_listings: 0,
    active_listings: 0,
    sold_listings: 0,
    total_volume: '0',
  });
  const [listings, setListings] = useState<ShareListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/shares/dashboard-data', {
        params: {
          search: searchTerm,
          status: statusFilter,
          page: page
        }
      });

      if (response.data.success) {
        setStats(response.data.stats);
        setListings(response.data.listings.data);
        setTotalPages(response.data.listings.last_page);
      }
    } catch (err) {
      console.error('Error fetching share admin data:', err);
      setError('Failed to load share marketplace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [page, statusFilter, searchTerm]); // Add dependencies to auto-refresh

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (page !== 1) setPage(1);
        else fetchDashboardData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(val));
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <AdminNav />
      
      <div style={{ padding: isMobile ? '16px' : '32px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Share Marketplace Admin</h1>
            <p style={{ color: '#64748B' }}>Monitor and manage investor share listings and transactions.</p>
          </div>
          <button
            onClick={() => navigate('/admin/operations/shares/create')}
            style={{
              backgroundColor: '#0F172A',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            List Share
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {[
            { label: 'Total Listings', value: stats.total_listings, icon: PieChart, color: '#3B82F6' },
            { label: 'Active Listings', value: stats.active_listings, icon: ArrowUpRight, color: '#10B981' },
            { label: 'Sold Listings', value: stats.sold_listings, icon: TrendingUp, color: '#8B5CF6' },
            { label: 'Total Volume', value: formatCurrency(stats.total_volume), icon: DollarSign, color: '#F59E0B' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>{stat.label}</p>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>{stat.value}</h3>
                </div>
                <div style={{ padding: '10px', backgroundColor: `${stat.color}15`, borderRadius: '8px', color: stat.color }}>
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid #E2E8F0', 
          marginBottom: '24px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search property or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                flex: isMobile ? 1 : 'none'
              }}
            >
              {['All', 'Active', 'Sold', 'Cancelled'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
              <Loader2 className="animate-spin" size={32} color="#3B82F6" />
            </div>
          ) : error ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#EF4444' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 16px' }} />
              <p>{error}</p>
            </div>
          ) : listings.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p>No share listings found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Property</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Seller</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Shares</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Price/Share</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Total Price</th>
                    <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{listing.property?.address}</div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>{listing.property?.city}, {listing.property?.state}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{listing.seller?.name}</div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>{listing.seller?.email}</div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', color: '#0F172A' }}>{listing.shares}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', color: '#0F172A' }}>{formatCurrency(listing.price_per_share)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>{formatCurrency(listing.total_price)}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          backgroundColor: listing.status === 'active' ? '#DCFCE7' : listing.status === 'sold' ? '#DBEAFE' : '#F1F5F9',
                          color: listing.status === 'active' ? '#166534' : listing.status === 'sold' ? '#1E40AF' : '#475569',
                        }}>
                          {listing.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', color: '#64748B', fontSize: '14px' }}>
                        {new Date(listing.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: page === 1 ? '#F1F5F9' : 'white',
                  color: page === 1 ? '#94A3B8' : '#0F172A',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: page === totalPages ? '#F1F5F9' : 'white',
                  color: page === totalPages ? '#94A3B8' : '#0F172A',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
