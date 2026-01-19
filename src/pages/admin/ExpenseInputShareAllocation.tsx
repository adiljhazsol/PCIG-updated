import { CSSProperties, useState } from 'react';
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
  Bell
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

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

export default function ExpenseInputShareAllocation() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const expenseData = adminData.expenseInputShareAllocation;
  const header = expenseData.header;
  const summaryCards = expenseData.summaryCards;
  const searchAndFilters = expenseData.searchAndFilters;
  const expensesTable = expenseData.expensesTable;
  const detailPanel = expenseData.detailPanel;

  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set(expensesTable.rows.filter((r: any) => r.selected).map((r: any) => r.id))
  );
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>(
    expensesTable.rows.find((r: any) => r.selected)?.id || expensesTable.rows[0].id
  );

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
    if (checked) {
      setSelectedExpenses(new Set(expensesTable.rows.map((r: any) => r.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  // const selectedExpense = expensesTable.rows.find((r: any) => r.id === selectedExpenseId) || expensesTable.rows[0];

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

  const BulkImportIcon = iconMap[header.actionButtons[0].icon] || Upload;
  const NewExpenseIcon = iconMap[header.actionButtons[1].icon] || Plus;
  const EditIcon = iconMap[detailPanel.expenseInformation.editIcon] || Edit;
  const DownloadIcon = iconMap[typeof detailPanel.expenseInformation.fields[7].value === 'object' && detailPanel.expenseInformation.fields[7].value?.icon ? detailPanel.expenseInformation.fields[7].value.icon : ''] || Download;
  const HomeIcon = iconMap[typeof detailPanel.expenseInformation.fields[0].value === 'object' && detailPanel.expenseInformation.fields[0].value?.icon ? detailPanel.expenseInformation.fields[0].value.icon : ''] || Home;
  const CheckIcon = iconMap[detailPanel.actions.approve.icon] || Check;
  const RejectIcon = iconMap[detailPanel.actions.reject.icon] || X;
  const NotifyIcon = iconMap['Bell'] || Bell;

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
              {summaryCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || DollarSign;
                return (
                  <div
                    key={idx}
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
              {searchAndFilters.filters.map((filter: any, idx: number) => {
                const FilterIcon = filter.icon ? iconMap[filter.icon] : null;
                return (
                  <div key={idx} style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: isMobile ? '100%' : 120 }}>
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
                      defaultValue={filter.value}
                    >
                      <option>{filter.label}: {filter.value}</option>
                      {filter.options && filter.options.filter((opt: string) => opt !== filter.value).map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
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
                          checked={selectedExpenses.size === expensesTable.rows.length}
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
                    {expensesTable.rows.map((row: any) => (
                      <tr
                        key={row.id}
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
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 150 : 'auto' }}>
                          <div>
                            <div
                              style={{
                                fontSize: isMobile ? 13 : 14,
                                fontWeight: 500,
                                color: '#0F172A',
                                marginBottom: 2,
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.property.address}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {row.property.id}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, whiteSpace: 'nowrap' }}>
                          {row.date}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: 999,
                              fontSize: isMobile ? 10 : 11,
                              fontWeight: 500,
                              backgroundColor: row.categoryBg,
                              color: row.categoryColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
                          {row.subcategory}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
                          {row.description}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {row.amount}
                        </td>
                        <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', fontSize: isMobile ? 12 : 13, wordBreak: 'break-word' }}>
                          {row.vendor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Detail Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, minWidth: 0, width: '100%', order: isMobileOrTablet ? -1 : 0 }}>
            {/* Expense Header */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: isMobile ? 12 : 16,
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: isMobile ? 15 : 16,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    Expense Details
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      color: '#64748B',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.selectedExpense.expenseId}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 500,
                        backgroundColor: detailPanel.selectedExpense.statusBg,
                        color: detailPanel.selectedExpense.statusColor,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {detailPanel.selectedExpense.status}
                    </span>
                    <span
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: '#64748B',
                        wordBreak: 'break-word'
                      }}
                    >
                      Created by {detailPanel.selectedExpense.createdBy}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <X style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B' }} />
                </button>
              </div>
            </div>

            {/* Expense Information */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 12 : 16
                }}
              >
                <h3
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.expenseInformation.title}
                </h3>
                <EditIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', cursor: 'pointer', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 14 }}>
                {detailPanel.expenseInformation.fields.map((field: any, idx: number) => {
                  if (field.type === 'property') {
                    return (
                      <div key={idx} style={{ width: '100%', minWidth: 0 }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 500,
                            color: '#64748B',
                            marginBottom: 6,
                            wordBreak: 'break-word'
                          }}
                        >
                          {field.label}
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F9FAFB',
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box'
                          }}
                        >
                          <HomeIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#64748B', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: 500,
                                color: '#0F172A',
                                marginBottom: 2,
                                wordBreak: 'break-word'
                              }}
                            >
                              {field.value.address}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 10 : 11,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {field.value.id} • {field.value.shares}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (field.type === 'textarea') {
                    return (
                      <div key={idx} style={{ width: '100%', minWidth: 0 }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 500,
                            color: '#64748B',
                            marginBottom: 6,
                            wordBreak: 'break-word'
                          }}
                        >
                          {field.label}
                        </label>
                        <textarea
                          defaultValue={field.value}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F9FAFB',
                            fontSize: isMobile ? 12 : 13,
                            color: '#0F172A',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    );
                  } else if (field.type === 'file') {
                    return (
                      <div key={idx} style={{ width: '100%', minWidth: 0 }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 500,
                            color: '#64748B',
                            marginBottom: 6,
                            wordBreak: 'break-word'
                          }}
                        >
                          {field.label}
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F9FAFB',
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box'
                          }}
                        >
                          <span
                            style={{
                              fontSize: isMobile ? 12 : 13,
                              color: '#0F172A',
                              flex: 1,
                              minWidth: 0,
                              wordBreak: 'break-word'
                            }}
                          >
                            {field.value.name}
                          </span>
                          <DownloadIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, color: '#2563EB', cursor: 'pointer', flexShrink: 0 }} />
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} style={{ width: '100%', minWidth: 0 }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 500,
                            color: '#64748B',
                            marginBottom: 6,
                            wordBreak: 'break-word'
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          style={{
                            width: '100%',
                            padding: isMobile ? '8px 10px' : '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F9FAFB',
                            fontSize: isMobile ? 12 : 13,
                            color: '#0F172A',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {/* Investor Allocation */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 8 : 0
                }}
              >
                <h3
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {detailPanel.investorAllocation.title}
                </h3>
                <span
                  style={{
                    fontSize: isMobile ? 11 : 12,
                    color: '#64748B',
                    wordBreak: 'break-word'
                  }}
                >
                  Total Shares: {detailPanel.investorAllocation.totalShares}
                </span>
              </div>
              <div style={{ marginBottom: isMobile ? 12 : 16, width: '100%', minWidth: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12, minWidth: isMobile ? 400 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {detailPanel.investorAllocation.tableHeaders.map((header: string) => (
                        <th
                          key={header}
                          style={{
                            padding: isMobile ? '6px 10px' : '8px 12px',
                            textAlign: 'left',
                            fontSize: isMobile ? 9 : 10,
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
                      <th
                        style={{
                          padding: isMobile ? '6px 10px' : '8px 12px',
                          textAlign: 'left',
                          fontSize: isMobile ? 9 : 10,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#64748B',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPanel.investorAllocation.rows.map((row: any) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                          {row.investor}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#0F172A', whiteSpace: 'nowrap' }}>{row.shares}</td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>{row.percentage}</td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {row.amount}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: 999,
                              fontSize: isMobile ? 9 : 10,
                              fontWeight: 500,
                              backgroundColor: row.statusBg,
                              color: row.statusColor,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  padding: isMobile ? '10px 14px' : '12px 16px',
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    color: '#0F172A',
                    wordBreak: 'break-word'
                  }}
                >
                  Total Allocated:
                </span>
                <span
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 600,
                    color: '#0F172A',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {detailPanel.investorAllocation.totalAllocated}
                </span>
              </div>
            </div>

            {/* Approval Progress */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: '#0F172A',
                      wordBreak: 'break-word'
                    }}
                  >
                    {detailPanel.approvalProgress.label}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: isMobile ? 6 : 8,
                    borderRadius: 999,
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden',
                    marginBottom: isMobile ? 10 : 12
                  }}
                >
                  <div
                    style={{
                      width: `${detailPanel.approvalProgress.value}%`,
                      height: '100%',
                      backgroundColor: detailPanel.approvalProgress.color,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '8px 14px' : '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #2563EB',
                    backgroundColor: 'transparent',
                    color: '#2563EB',
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <NotifyIcon style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.approvalProgress.notifyButton}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12, width: '100%' }}>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.actions.approve.bg,
                  color: detailPanel.actions.approve.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <CheckIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.approve.label}</span>
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: detailPanel.actions.reject.bg,
                  color: detailPanel.actions.reject.color,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <RejectIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap' }}>{detailPanel.actions.reject.label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

