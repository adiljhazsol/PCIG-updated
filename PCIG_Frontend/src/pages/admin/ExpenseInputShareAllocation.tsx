import { CSSProperties, useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Calendar,
  Upload,
  Plus,
  Edit,
  Download,
  Home,
  Check,
  X,
  Bell,
  Loader2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Calendar,
  Upload,
  Plus,
  Edit,
  Download,
  Home,
  Check,
  X,
  Bell
};

interface ExpenseHeader {
  title: string;
  subtitle: string;
  backLink: { label: string; path: string };
  actionButtons: { label: string; icon: string }[];
}

interface ExpenseSummaryCard {
  icon: string;
  label: string;
  value: string;
  color: string;
  bg: string;
  trend?: string;
  trendColor?: string;
  subtitle?: string;
}

interface ExpenseFilter {
  label: string;
  value: string;
  icon?: string;
  options: string[];
}

interface ExpenseRow {
  id: string;
  selected?: boolean;
  date: string;
  property: string;
  category: string;
  description: string;
  amount: string;
  status: string;
  statusColor?: string;
}

interface ExpenseTable {
  headers: string[];
  rows: ExpenseRow[];
}

interface ExpenseDetailPanel {
  expenseInformation: {
    editIcon: string;
    fields: any[]; // Keeping generic as fields usage in original code was complex/indexed
  };
  actions: {
    approve: { icon: string };
    reject: { icon: string };
  };
}

interface PropertyOption {
  id: number;
  address: string;
}

interface ExpenseData {
  header: ExpenseHeader;
  summaryCards: ExpenseSummaryCard[];
  searchAndFilters: {
    searchPlaceholder: string;
    filters: ExpenseFilter[];
  };
  expensesTable: ExpenseTable;
  detailPanel: ExpenseDetailPanel;
  propertiesList?: PropertyOption[];
}

export default function ExpenseInputShareAllocation() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  const [data, setData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('');

  // Modal states
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    property_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    allocation_method: 'ownership_percentage'
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('All Properties');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = async (query = searchQuery, property = propertyFilter, category = categoryFilter, status = statusFilter) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (property && property !== 'All Properties') params.append('property', property);
      if (category && category !== 'All Categories') params.append('category', category);
      if (status && status !== 'All Status') params.append('status', status);

      const response = await api.get(`/admin/expenses/dashboard-data?${params.toString()}`);
      
      if (response.data && response.data.expenseInputShareAllocation) {
        const expenseData = response.data.expenseInputShareAllocation;
        setData(expenseData);
        
        // Initialize selection state
        const rows = expenseData.expensesTable?.rows || [];
        const initialSelected = new Set(rows.filter((r: any) => r.selected).map((r: any) => r.id));
        setSelectedExpenses(initialSelected as Set<string>);
        
        const initialId = rows.find((r: any) => r.selected)?.id || rows[0]?.id || '';
        setSelectedExpenseId(initialId);

      } else {
        setError('Failed to load expense data');
      }
    } catch (err) {
      console.error('Error fetching expense data:', err);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [propertyFilter, categoryFilter, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Skip initial empty search if loading initially (or rather, just don't double fetch)
    // But actually, the first useEffect handles the initial fetch.
    // However, if searchQuery changes, we want to fetch.
    // To avoid double fetch on mount (since searchQuery is ''), we can check if it's the first run or rely on the fact that empty search is default.
    // Actually, simpler to just debounce all search changes.
    
    if (loading && !searchQuery) return; // Skip if initial load is happening

    searchTimeoutRef.current = setTimeout(() => {
      fetchData(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (isNewExpenseModalOpen) {
      const fetchProperties = async () => {
        try {
          const res = await api.get('/admin/properties/dropdown');
          if (Array.isArray(res.data)) {
            setPropertyOptions(res.data);
          }
        } catch (error) {
          console.error('Error fetching properties:', error);
        }
      };
      fetchProperties();
    }
  }, [isNewExpenseModalOpen]);

  const handleCheckboxChange = (expenseId: string) => {
    setSelectedExpenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId);
      } else {
        newSet.add(expenseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    const rows = data?.expensesTable?.rows || [];
    if (checked) {
      setSelectedExpenses(new Set(rows.map((r) => r.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/expenses/${id}/approve`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject/delete this expense?')) return;
    
    try {
      await api.delete(`/admin/expenses/${id}`);
      fetchData(); // Refresh data
      if (selectedExpenseId === id) setSelectedExpenseId(''); // Clear selection if deleted
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('Failed to reject expense');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await api.post('/admin/expenses', newExpense);
        setIsNewExpenseModalOpen(false);
        fetchData();
        setNewExpense({
            property_id: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            category: '',
            allocation_method: 'ownership_percentage'
        });
        // alert('Expense created successfully');
    } catch (error: any) {
        console.error('Error creating expense:', error);
        alert(error.response?.data?.message || 'Failed to create expense');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    
    try {
        const res = await api.post('/admin/expenses/import', formData); // Browser sets boundary automatically
        setIsBulkImportModalOpen(false);
        fetchData();
        setImportFile(null);
        alert(res.data.message || 'Import successful');
    } catch (error: any) {
        console.error('Error importing expenses:', error);
        alert(error.response?.data?.message || 'Failed to import expenses');
    } finally {
        setIsSubmitting(false);
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
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    boxSizing: 'border-box'
  };

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p style={{ color: '#64748B' }}>Loading expense data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={pageWrapperStyle}>
        <AdminNav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'red' }}>
          {error || 'No data available'}
        </div>
      </div>
    );
  }

  // Extract data from state
  const header = data.header;
  const summaryCards = data.summaryCards;
  const searchAndFilters = data.searchAndFilters;
  const expensesTable = data.expensesTable;
  const detailPanel = data.detailPanel;

  // Selected expense for detail view
  const selectedExpense = expensesTable.rows.find((r) => r.id === selectedExpenseId) || expensesTable.rows[0];

  const BulkImportIcon = iconMap[header?.actionButtons?.[0]?.icon || ''] || Upload;
  const NewExpenseIcon = iconMap[header?.actionButtons?.[1]?.icon || ''] || Plus;
  const EditIcon = iconMap[detailPanel?.expenseInformation?.editIcon || ''] || Edit;
  
  const field0 = detailPanel?.expenseInformation?.fields?.[0];
  const homeIconName = (typeof field0?.value === 'object' && field0?.value?.icon) ? field0.value.icon : '';
  const HomeIcon = iconMap[homeIconName] || Home;

  const CheckIcon = iconMap[detailPanel?.actions?.approve?.icon || ''] || Check;
  const RejectIcon = iconMap[detailPanel?.actions?.reject?.icon || ''] || X;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '16px 12px' : isTablet ? '20px 20px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Main Layout: 2 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 480px',
            gap: isMobile ? 16 : isTablet ? 20 : 24,
            alignItems: 'start',
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%' }}>
            {/* Header */}
            <div style={{ width: '100%', minWidth: 0 }}>
              <a
                href={header.backLink.path}
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#2563EB',
                  textDecoration: 'none',
                  marginBottom: 8,
                  display: 'inline-block',
                  wordBreak: 'break-word'
                }}
              >
                {header.backLink.label}
              </a>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: 8,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: isMobile ? 22 : isTablet ? 24 : 28,
                      fontWeight: 700,
                      color: '#0F172A',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.title}
                  </h1>
                  <p
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 0,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {header.subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    onClick={() => setIsBulkImportModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    <BulkImportIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons[0].label}</span>
                  </button>
                  <button
                    onClick={() => setIsNewExpenseModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    <NewExpenseIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{header.actionButtons[1].label}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modals */}
            {isNewExpenseModalOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16
              }}>
                <div style={{
                  backgroundColor: 'white', borderRadius: 12, padding: 24,
                  width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>New Expense</h2>
                    <button onClick={() => setIsNewExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={20} color="#64748B" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Date</label>
                      <input
                        type="date"
                        required
                        value={newExpense.date}
                        onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Property</label>
                      <select
                        required
                        value={newExpense.property_id}
                        onChange={e => setNewExpense({...newExpense, property_id: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                      >
                        <option value="">Select Property</option>
                        {propertyOptions.length > 0 ? propertyOptions.map(p => (
                          <option key={p.id} value={p.id}>{p.address}</option>
                        )) : data?.propertiesList?.map(p => (
                          <option key={p.id} value={p.id}>{p.address}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Category</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Repairs, Utilities"
                        value={newExpense.category}
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Description</label>
                      <input
                        type="text"
                        required
                        value={newExpense.description}
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#334155', marginBottom: 6 }}>Amount</label>
                      <div style={{ position: 'relative' }}>
                        <DollarSign size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={newExpense.amount}
                          onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 14 }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: 8,
                        padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Expense'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {isBulkImportModalOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16
              }}>
                <div style={{
                  backgroundColor: 'white', borderRadius: 12, padding: 24,
                  width: '100%', maxWidth: 500
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Bulk Import Expenses</h2>
                    <button onClick={() => setIsBulkImportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={20} color="#64748B" />
                    </button>
                  </div>
                  <form onSubmit={handleBulkImport} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ border: '2px dashed #E2E8F0', borderRadius: 8, padding: 32, textAlign: 'center' }}>
                      <Upload size={32} color="#94A3B8" style={{ marginBottom: 12 }} />
                      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#64748B' }}>
                        Upload a CSV file with columns: Property (Address), Date, Description, Category, Amount
                      </p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        required
                        onChange={e => setImportFile(e.target.files ? e.target.files[0] : null)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!importFile || isSubmitting}
                      style={{
                        backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: 8,
                        padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
                        opacity: (!importFile || isSubmitting) ? 0.7 : 1
                      }}
                    >
                      {isSubmitting ? 'Importing...' : 'Import Expenses'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : isTablet ? 14 : 16,
                width: '100%',
                minWidth: 0
              }}
            >
              {summaryCards.map((card, idx) => {
          const CardIcon = iconMap[card.icon] || DollarSign;
          return (
            <div
              key={`summary-card-${idx}`}
              style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: isMobile ? 12 : isTablet ? 16 : 20,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 10 : 12 }}>
                      <div
                        style={{
                          width: isMobile ? 36 : isTablet ? 38 : 40,
                          height: isMobile ? 36 : isTablet ? 38 : 40,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0
                        }}
                      >
                        <CardIcon style={{ width: isMobile ? 18 : isTablet ? 19 : 20, height: isMobile ? 18 : isTablet ? 19 : 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            marginBottom: 4
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: isMobile ? 20 : isTablet ? 22 : 24,
                            fontWeight: 700,
                            color: card.color,
                            wordBreak: 'break-word'
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    {card.trend && (
                      <p
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: card.trendColor,
                          fontWeight: 500,
                          marginTop: 0,
                          marginRight: 0,
                          marginBottom: 0,
                          marginLeft: 0,
                          wordBreak: 'break-word'
                        }}
                      >
                        {card.trend}
                      </p>
                    )}
                    {card.subtitle && (
                      <p
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: '#64748B',
                          marginTop: 0,
                          marginRight: 0,
                          marginBottom: 0,
                          marginLeft: 0,
                          wordBreak: 'break-word'
                        }}
                      >
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 10 : 12,
                alignItems: 'stretch',
                flexWrap: 'wrap',
                width: '100%',
                minWidth: 0
              }}
            >
              <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : 200, width: isMobile ? '100%' : 'auto' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: isMobile ? 12 : 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: isMobile ? 16 : 18,
                    height: isMobile ? 16 : 18,
                    color: '#9CA3AF',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <input
                  type="text"
                  placeholder={searchAndFilters.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '8px 12px 8px 36px' : '10px 14px 10px 40px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F9FAFB',
                    fontSize: isMobile ? 13 : 14,
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {searchAndFilters.filters.map((filter, idx) => {
                const FilterIcon = filter.icon ? iconMap[filter.icon] : null;
                
                // Determine current value and setter based on filter label
                let currentValue = filter.value;
                let onChangeHandler = (_e: React.ChangeEvent<HTMLSelectElement>) => {};
                
                if (filter.label === 'Property') {
                  currentValue = propertyFilter;
                  onChangeHandler = (e) => setPropertyFilter(e.target.value);
                } else if (filter.label === 'Category') {
                  currentValue = categoryFilter;
                  onChangeHandler = (e) => setCategoryFilter(e.target.value);
                } else if (filter.label === 'Status') {
                  currentValue = statusFilter;
                  onChangeHandler = (e) => setStatusFilter(e.target.value);
                }

                return (
                  <div key={`${filter.label}-${idx}`} style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 120 }}>
                    {FilterIcon && (
                      <FilterIcon
                        style={{
                          position: 'absolute',
                          left: isMobile ? 10 : 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isMobile ? 14 : 16,
                          height: isMobile ? 14 : 16,
                          color: '#9CA3AF',
                          pointerEvents: 'none',
                          zIndex: 1
                        }}
                      />
                    )}
                    <select
                      style={{
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        paddingLeft: FilterIcon ? (isMobile ? '32px' : '36px') : (isMobile ? '12px' : '14px'),
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 12 : 13,
                        color: '#0F172A',
                        cursor: 'pointer',
                        minWidth: isMobile ? '100%' : 120,
                        width: '100%',
                        appearance: 'none',
                        backgroundImage: FilterIcon ? 'none' : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748B\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px',
                        boxSizing: 'border-box'
                      }}
                      value={currentValue}
                      onChange={onChangeHandler}
                    >
                      {/* Only show "All" option if it's not already in options (though backend sends it merged) */}
                      {/* Actually backend sends merged options, so we can just map. */}
                      {/* But we need to make sure the value matches. */}
                      {filter.options && filter.options.map((opt: string, optIdx: number) => (
                        <option key={`${idx}-${optIdx}-${opt}`} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Expenses Table */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 900 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                        <input
                          type="checkbox"
                          checked={expensesTable.rows.length > 0 && selectedExpenses.size === expensesTable.rows.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer'
                          }}
                        />
                      </th>
                      {expensesTable.headers.slice(1).map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            textAlign: 'left',
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#64748B',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expensesTable.rows.length === 0 ? (
                        <tr>
                            <td colSpan={expensesTable.headers.length} style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                                No expenses found
                            </td>
                        </tr>
                    ) : (
                        expensesTable.rows.map((row, idx) => (
                        <tr
                            key={`${row.id}-${idx}`}
                            onClick={() => setSelectedExpenseId(row.id)}
                            style={{
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            backgroundColor: selectedExpenseId === row.id ? '#F0F9FF' : 'transparent',
                            transition: 'background-color 0.2s'
                            }}
                        >
                            <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <input
                                type="checkbox"
                                checked={selectedExpenses.has(row.id)}
                                onChange={() => handleCheckboxChange(row.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                width: isMobile ? 16 : 18,
                                height: isMobile ? 16 : 18,
                                cursor: 'pointer'
                                }}
                            />
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px', whiteSpace: 'nowrap', color: '#64748B' }}>{row.date}</td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px', fontWeight: 500, color: '#0F172A' }}>{row.property}</td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <span
                                style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 12,
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                fontSize: isMobile ? 11 : 12,
                                fontWeight: 500
                                }}
                            >
                                {row.category}
                            </span>
                            </td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B' }}>{row.description}</td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px', fontWeight: 600, color: '#0F172A' }}>{row.amount}</td>
                            <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            <span
                                style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: row.statusColor,
                                fontWeight: 500
                                }}
                            >
                                <CheckCircle2 style={{ width: 14, height: 14 }} />
                                {row.status}
                            </span>
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Detail Panel */}
          {selectedExpense ? (
            <div
              style={{
                ...cardStyle,
                position: 'sticky',
                top: 24,
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                gap: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4, margin: 0 }}>
                    Expense Details
                  </h2>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                    ID: {selectedExpense.id}
                  </p>
                </div>
                <button
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  <EditIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: selectedExpense.status === 'Allocated' ? '#ECFDF5' : '#FFFBEB',
                  border: `1px solid ${selectedExpense.status === 'Allocated' ? '#10B981' : '#F59E0B'}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: selectedExpense.status === 'Allocated' ? '#10B981' : '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedExpense.status === 'Allocated' ? '#065F46' : '#92400E' }}>
                    {selectedExpense.status}
                  </div>
                  <div style={{ fontSize: 11, color: selectedExpense.status === 'Allocated' ? '#047857' : '#B45309' }}>
                    {selectedExpense.status === 'Allocated' ? 'Expense fully allocated' : 'Pending allocation approval'}
                  </div>
                </div>
              </div>

              {/* Information List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Dynamically rendering fields based on selected expense */}
                {[
                  { label: 'Property', value: { icon: 'Home', text: selectedExpense.property } },
                  { label: 'Category', value: selectedExpense.category },
                  { label: 'Amount', value: selectedExpense.amount },
                  { label: 'Date Incurred', value: selectedExpense.date },
                  { label: 'Submitted By', value: user ? `${user.firstName} ${user.lastName}` : 'Admin User' }, // Fetch from relationship in future
                  { label: 'Receipt', value: 'receipt.pdf' },
                  { label: 'Allocation Method', value: 'Ownership Percentage' },
                  { label: 'Description', value: selectedExpense.description },
                ].map((field, idx) => (
                  <div key={`${field.label}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {field.label}
                    </div>
                    {typeof field.value === 'object' && field.value !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         {field.value.icon && (
                            <HomeIcon style={{ width: 16, height: 16, color: '#64748B' }} />
                         )}
                         <span style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>
                           {field.value.text}
                         </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 500 }}>
                        {field.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
                <button
                  onClick={() => handleReject(selectedExpense.id)}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #EF4444',
                    backgroundColor: '#FEF2F2',
                    color: '#EF4444',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <RejectIcon style={{ width: 16, height: 16 }} />
                  Reject
                </button>
                {selectedExpense.status !== 'Allocated' && (
                <button
                  onClick={() => handleApprove(selectedExpense.id)}
                  style={{
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <CheckIcon style={{ width: 16, height: 16 }} />
                  Approve
                </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                Select an expense to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
