import React, { CSSProperties, useState } from 'react';
import {
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Eye,
  X
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Eye,
  X
};

export default function FIFAImport() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON
  const fifaData = adminData.fifaImport;
  const header = fifaData.header;
  const summaryCards = fifaData.summaryCards;
  const uploadSection = fifaData.uploadSection;
  const fieldMapping = fifaData.fieldMapping;
  const reviewQueue = fifaData.reviewQueue;
  const workflowIntegration = fifaData.workflowIntegration;
  const importBatches = fifaData.importBatches;

  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(reviewQueue.items.map((item: any) => item.id)));
    } else {
      setSelectedItems(new Set());
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

  const ViewBatchesIcon = iconMap[header.actionButtons[0].icon] || FileText;
  const NewBatchIcon = iconMap[header.actionButtons[1].icon] || Plus;

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, width: '100%', minWidth: 0 }}>
          {/* Header */}
          <div style={{ width: '100%', minWidth: 0 }}>
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
                  <ViewBatchesIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
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
                  <NewBatchIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />
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
            {summaryCards.map((card: any) => {
              const CardIcon = iconMap[card.icon] || FileText;
              return (
                <div
                  key={card.label}
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
                  </div>
              );
            })}
          </div>

          {/* Upload FIFA Documents Section */}
          <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
            <div style={{ marginBottom: isMobile ? 16 : isTablet ? 18 : 20 }}>
              <h2
                style={{
                  fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 4,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {uploadSection.title}
              </h2>
              <p
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#64748B',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {uploadSection.subtitle}
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
                gap: isMobile ? 16 : isTablet ? 18 : 20,
                marginBottom: isMobile ? 20 : isTablet ? 22 : 24,
                width: '100%',
                minWidth: 0
              }}
            >
              {uploadSection.uploadAreas.map((area: any) => {
                const UploadIcon = iconMap[area.icon] || FileText;
                return (
                  <div
                    key={area.id}
                    style={{
                      border: `2px dashed ${area.color}40`,
                      borderRadius: 12,
                      padding: isMobile ? 20 : isTablet ? 24 : 32,
                      backgroundColor: `${area.color}08`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: isMobile ? 12 : isTablet ? 14 : 16,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <UploadIcon
                      style={{
                        width: isMobile ? 36 : isTablet ? 42 : 48,
                        height: isMobile ? 36 : isTablet ? 42 : 48,
                        color: area.color,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ width: '100%', minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: isMobile ? 14 : isTablet ? 14.5 : 15,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 4,
                          wordBreak: 'break-word'
                        }}
                      >
                        {area.title}
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? 12 : 13,
                          color: '#64748B',
                          wordBreak: 'break-word'
                        }}
                      >
                        {area.description}
                      </div>
                    </div>
                    <button
                      style={{
                        padding: isMobile ? '8px 16px' : '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: area.color,
                        color: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box'
                      }}
                    >
                      {area.buttonText}
                    </button>
                    <div
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: '#64748B',
                        wordBreak: 'break-word'
                      }}
                    >
                      {area.dragDropText}
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                fontSize: isMobile ? 12 : 13,
                color: '#2563EB',
                marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                cursor: 'pointer',
                textDecoration: 'underline',
                wordBreak: 'break-word'
              }}
            >
              {uploadSection.downloadTemplate}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : isTablet ? 14 : 16 }}>
              {uploadSection.formFields.map((field: any, idx: number) => (
                <div key={idx} style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: isMobile ? 70 : 80,
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      defaultValue={field.value}
                      style={{
                        width: '100%',
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: isMobile ? 10 : 12, marginTop: isMobile ? 16 : isTablet ? 18 : 20, flexWrap: 'wrap' }}>
              {uploadSection.formActions.map((action: any, idx: number) => (
                <button
                  key={idx}
                  style={{
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: 8,
                    border: action.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: action.variant === 'primary' ? '#2563EB' : '#FFFFFF',
                    color: action.variant === 'primary' ? '#FFFFFF' : '#64748B',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map Excel/CSV Fields Section */}
          <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
            <div style={{ marginBottom: isMobile ? 16 : isTablet ? 18 : 20 }}>
              <h2
                style={{
                  fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 4,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {fieldMapping.title}
              </h2>
              <p
                style={{
                  fontSize: isMobile ? 12 : 13,
                  color: '#64748B',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {fieldMapping.subtitle}
              </p>
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 600 : 'auto' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {fieldMapping.tableHeaders.map((header: string) => (
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
                  {fieldMapping.mappings.map((mapping: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                        {mapping.systemField}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', wordBreak: 'break-word' }}>
                        {mapping.fileColumn}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', wordBreak: 'break-word' }}>
                        {mapping.sampleData}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {mapping.required}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: isMobile ? 16 : isTablet ? 18 : 20 }}>
              <button
                style={{
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box'
                }}
              >
                {fieldMapping.actionButton}
              </button>
            </div>
          </div>

          {/* Review & Confirmation Queue Section */}
          <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                gap: isMobile ? 12 : 0
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 4,
                    marginLeft: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {reviewQueue.title}
                </h2>
                <p
                  style={{
                    fontSize: isMobile ? 12 : 13,
                    color: '#64748B',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {reviewQueue.subtitle}
                </p>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                {reviewQueue.bulkActions.map((action: any, idx: number) => (
                  <button
                    key={idx}
                    style={{
                      padding: isMobile ? '6px 12px' : '8px 16px',
                      borderRadius: 8,
                      border: action.variant === 'primary' ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: action.variant === 'primary' ? '#2563EB' : '#FFFFFF',
                      color: action.variant === 'primary' ? '#FFFFFF' : '#64748B',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 12 : isTablet ? 14 : 16 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
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
                  placeholder={reviewQueue.searchPlaceholder}
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
            </div>
            <div style={{ display: 'flex', gap: isMobile ? 6 : 8, marginBottom: isMobile ? 12 : isTablet ? 14 : 16, flexWrap: 'wrap', overflowX: 'auto' }}>
              {reviewQueue.filterTabs.map((tab: string) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  style={{
                    padding: isMobile ? '6px 12px' : '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: selectedTab === tab ? '#2563EB' : '#F1F5F9',
                    color: selectedTab === tab ? '#FFFFFF' : '#64748B',
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 1000 : 'auto' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: isMobile ? '10px 12px' : '12px 16px', textAlign: 'left', width: isMobile ? 32 : 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.size === reviewQueue.items.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        style={{
                          width: isMobile ? 16 : 18,
                          height: isMobile ? 16 : 18,
                          cursor: 'pointer'
                        }}
                      />
                    </th>
                    {reviewQueue.tableHeaders.slice(1).map((header: string) => (
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
                  {reviewQueue.items.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
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
                              fontSize: isMobile ? 12 : 13,
                              fontWeight: 500,
                              color: '#0F172A',
                              marginBottom: 2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.extractedData.parcelId}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: '#64748B',
                              marginBottom: 2,
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.extractedData.ownerName}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: '#64748B',
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.extractedData.taxYear}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 150 : 'auto' }}>
                        {item.proposedMatch.propertyId ? (
                          <div>
                            <div
                              style={{
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: 500,
                                color: '#0F172A',
                                marginBottom: 2,
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.proposedMatch.address}
                            </div>
                            <div
                              style={{
                                fontSize: isMobile ? 11 : 12,
                                color: '#64748B',
                                wordBreak: 'break-word'
                              }}
                            >
                              {item.proposedMatch.propertyId}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontSize: isMobile ? 12 : 13,
                              color: item.status === 'No Match' ? '#DC2626' : '#F59E0B',
                              fontWeight: 500,
                              wordBreak: 'break-word'
                            }}
                          >
                            {item.proposedMatch.address}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', minWidth: isMobile ? 100 : 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8 }}>
                          <div
                            style={{
                              flex: 1,
                              height: isMobile ? 6 : 8,
                              borderRadius: 4,
                              backgroundColor: '#E2E8F0',
                              overflow: 'hidden',
                              minWidth: 60
                            }}
                          >
                            <div
                              style={{
                                width: `${item.confidence}%`,
                                height: '100%',
                                backgroundColor:
                                  item.confidence >= 80
                                    ? '#10B981'
                                    : item.confidence >= 50
                                    ? '#F59E0B'
                                    : '#DC2626',
                                transition: 'width 0.3s'
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: 500,
                              color: '#64748B',
                              minWidth: isMobile ? 35 : 40,
                              textAlign: 'right',
                              flexShrink: 0
                            }}
                          >
                            {item.confidence}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 500,
                            backgroundColor: item.statusBg,
                            color: item.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                        <div style={{ display: 'flex', gap: isMobile ? 6 : 8, flexWrap: 'wrap' }}>
                          {item.actions.map((action: string, idx: number) => (
                            <button
                              key={idx}
                              style={{
                                padding: isMobile ? '5px 10px' : '6px 12px',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor:
                                  action === 'Confirm' ? '#10B981' : action === 'Search' ? '#2563EB' : '#FFFFFF',
                                color:
                                  action === 'Confirm' || action === 'Search'
                                    ? '#FFFFFF'
                                    : action === 'Select'
                                    ? '#F59E0B'
                                    : '#64748B',
                                fontSize: isMobile ? 11 : 12,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxSizing: 'border-box'
                              }}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workflow Integration Section */}
          <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
            <h2
              style={{
                fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                fontWeight: 600,
                color: '#0F172A',
                marginTop: 0,
                marginRight: 0,
                marginBottom: isMobile ? 12 : isTablet ? 14 : 16,
                marginLeft: 0,
                wordBreak: 'break-word'
              }}
            >
              {workflowIntegration.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 12 }}>
              {workflowIntegration.items.map((item: any) => {
                const ItemIcon = iconMap[item.icon] || CheckCircle2;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      padding: isMobile ? '10px 12px' : '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F9FAFB',
                      gap: isMobile ? 10 : 0,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, flex: 1, minWidth: 0 }}>
                      <ItemIcon style={{ width: isMobile ? 18 : 20, height: isMobile ? 18 : 20, color: item.color, flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          color: '#0F172A',
                          wordBreak: 'break-word'
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                    <button
                      style={{
                        padding: isMobile ? '6px 12px' : '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#64748B',
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        width: isMobile ? '100%' : 'auto'
                      }}
                    >
                      {item.action}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import Batches Section */}
          <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: isMobile ? 16 : isTablet ? 18 : 20,
                gap: isMobile ? 12 : 0
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? 16 : isTablet ? 17 : 18,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  wordBreak: 'break-word'
                }}
              >
                {importBatches.title}
              </h2>
              <button
                style={{
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {importBatches.actionButton}
              </button>
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 800 : 'auto' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {importBatches.tableHeaders.map((header: string) => (
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
                  {importBatches.batches.map((batch: any) => (
                    <tr key={batch.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                        {batch.batchName}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {batch.date}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', wordBreak: 'break-word' }}>
                        {batch.uploadedBy}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {batch.items}
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 500,
                            backgroundColor: batch.statusBg,
                            color: batch.statusColor,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                        <button
                          style={{
                            padding: isMobile ? '5px 10px' : '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            color: '#64748B',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxSizing: 'border-box'
                          }}
                        >
                          {batch.action}
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
    </div>
  );
}

