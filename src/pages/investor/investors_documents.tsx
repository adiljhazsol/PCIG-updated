import { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  FileText,
  CloudDownload,
  BarChart3,
  Receipt,
  Building2,
  Shield,
  CheckCircle2
} from 'lucide-react';
import InvestorNav from '../../components/investor/InvestorNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import investorsData from '../../data/investors.json';

// Icon mapping for documents
const documentIconMap: { [key: string]: any } = {
  FileText,
  FileCheck: CheckCircle2,
  PieChart: BarChart3, // Using BarChart3 as PieChart may not be available
  Receipt,
  Building2,
  Shield
};

// Note: summaryIconMap removed as it's not being used - summary cards are hardcoded

export default function InvestorsDocuments() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();


  const [activeCategory, setActiveCategory] = useState<string>(investorsData.documents.defaultCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>(investorsData.documents.defaultFilter);
  const [sortBy, setSortBy] = useState<string>(investorsData.documents.defaultSort);
  const [viewMode, setViewMode] = useState<string>(investorsData.documents.defaultView);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Reset to first page when search, category, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, activeFilter]);



  // Calculate summary statistics from all documents
  const allDocuments = investorsData.documents.documents;

  // Helper function to parse date strings like "Oct 31, 2023" or "Jan 10, 2023"
  const parseDocumentDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Clean up the date string (remove "Generated: " or "Uploaded: " prefix)
    const cleaned = dateStr.replace(/^(Generated|Uploaded):\s*/i, '').trim();

    try {
      // Try parsing as-is (should work for "Oct 31, 2023" format)
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch {
      // If parsing fails, return null
      return null;
    }

    return null;
  };

  // Get documents filtered by active category (for summary cards)
  const categoryFilteredDocuments = activeCategory === 'All Documents'
    ? allDocuments
    : allDocuments.filter(doc => doc.category === activeCategory);

  // Calculate summary statistics based on active category
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Total Documents: Count of documents in the active category
  const totalDocuments = categoryFilteredDocuments.length;

  // Tax Documents Available: 
  // - If viewing All Documents: show all tax documents
  // - If viewing Tax Documents category: show count for that category
  // - Otherwise: show 0 (not applicable for other categories)
  const taxDocumentsAvailable = activeCategory === 'All Documents'
    ? allDocuments.filter(doc => doc.category === 'Tax Documents').length
    : activeCategory === 'Tax Documents'
      ? categoryFilteredDocuments.length
      : 0;

  // New This Month: Count documents generated this month (from filtered category)
  const newThisMonth = categoryFilteredDocuments.filter(doc => {
    const dateStr = doc.generatedDate || doc.description;
    const docDate = parseDocumentDate(dateStr);

    if (!docDate) return false;

    return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
  }).length;

  // PDF Documents count for the active category
  const pdfDocumentsCount = categoryFilteredDocuments.filter(doc => doc.format === 'PDF').length;

  // Filter documents based on category, search, and filter
  let filteredDocuments = allDocuments.filter(doc => {
    // Apply category filter
    if (activeCategory !== 'All Documents' && doc.category !== activeCategory) {
      return false;
    }

    // Apply search filter
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply filter buttons
    if (activeFilter === 'PDF' && doc.format !== 'PDF') {
      return false;
    }
    if (activeFilter === 'This Year') {
      const dateStr = doc.generatedDate || doc.description;
      const docDate = parseDocumentDate(dateStr);
      if (!docDate || docDate.getFullYear() !== currentYear) {
        return false;
      }
    }
    if (activeFilter === 'Last Year') {
      const dateStr = doc.generatedDate || doc.description;
      const docDate = parseDocumentDate(dateStr);
      if (!docDate || docDate.getFullYear() !== currentYear - 1) {
        return false;
      }
    }

    return true;
  });

  // Sort documents
  filteredDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime();
      case 'Oldest':
        return new Date(a.generatedDate).getTime() - new Date(b.generatedDate).getTime();
      case 'Name A-Z':
        return a.name.localeCompare(b.name);
      case 'Name Z-A':
        return b.name.localeCompare(a.name);
      case 'Size':
        // Simple size comparison (extract numbers)
        const aSize = parseFloat(a.size.replace(/[^0-9.]/g, '')) || 0;
        const bSize = parseFloat(b.size.replace(/[^0-9.]/g, '')) || 0;
        return bSize - aSize;
      default:
        return 0;
    }
  });

  // Pagination
  const itemsPerPage = investorsData.documents.itemsPerPage;
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  // Dynamic count display
  const showingCount = filteredDocuments.length > 0
    ? `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredDocuments.length)}`
    : '0-0';
  const totalCount = filteredDocuments.length;

  return (
    <>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        overflowX: 'hidden',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        {/* Navbar */}
        {/* Top Navigation Bar */}
        <InvestorNav />



        {/* Main Content */}
        <div style={{
          padding: isMobile ? `clamp(12px, 1.5vw, 16px)` : `clamp(16px, 2vw, 32px)`,
          maxWidth: '100%',
          boxSizing: 'border-box',
          width: '100%',
          overflowX: 'hidden'
        }}>
          {/* Page Header */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-start',
            marginBottom: `clamp(16px, 2vh, 24px)`,
            flexWrap: 'wrap',
            gap: `clamp(12px, 1.5vw, 16px)`,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <h1 style={{
                fontSize: `clamp(20px, 2.5vw, 28px)`,
                fontWeight: 700,
                color: '#0F172A',
                marginTop: 0,
                marginLeft: 0,
                marginRight: 0,
                marginBottom: `clamp(6px, 0.8vh, 8px)`,
                lineHeight: 1.2
              }}>
                {investorsData.documents.header.title}
              </h1>
              <p style={{
                fontSize: `clamp(13px, 1.5vw, 14px)`,
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5
              }}>
                {investorsData.documents.header.subtitle}
              </p>
            </div>
            <button
              onClick={() => { /* Implement Generate Custom Report Function */ }}
              style={{
                padding: `clamp(8px, 1vh, 10px) clamp(14px, 1.8vw, 20px)`,
                fontSize: `clamp(12px, 1.3vw, 13px)`,
                fontWeight: 500,
                color: '#FFFFFF',
                backgroundColor: '#1E3A5F',
                border: 'none',
                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto'
              }}>
              Generate Custom Report
            </button>
          </div>

          {/* Category Tabs */}
          <div
            className="category-tabs-scroll"
            style={{
              display: 'flex',
              gap: `clamp(8px, 1vw, 12px)`,
              marginBottom: `clamp(16px, 2vh, 24px)`,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '4px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
            {investorsData.documents.categories.map((category) => {
              // Calculate count for each category
              const categoryCount = category === 'All Documents'
                ? allDocuments.length
                : allDocuments.filter(doc => doc.category === category).length;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(12px, 1.3vw, 13px)`,
                    fontWeight: activeCategory === category ? 600 : 500,
                    color: activeCategory === category ? '#1E3A5F' : '#64748B',
                    backgroundColor: activeCategory === category ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.6vw, 6px)`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderBottom: activeCategory === category ? '2px solid #1E3A5F' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `clamp(6px, 0.8vw, 8px)`
                  }}
                >
                  <span>{category}</span>
                  {categoryCount > 0 && (
                    <span style={{
                      fontSize: `clamp(10px, 1.1vw, 11px)`,
                      color: activeCategory === category ? '#1E3A5F' : '#94A3B8',
                      backgroundColor: activeCategory === category ? '#EFF6FF' : '#F1F5F9',
                      padding: `clamp(2px, 0.3vh, 3px) clamp(6px, 0.8vw, 8px)`,
                      borderRadius: `clamp(8px, 1vw, 10px)`,
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      {categoryCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Summary Cards - Dynamic based on active category */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: `clamp(12px, 1.5vw, 16px)`,
            marginBottom: `clamp(16px, 2vh, 24px)`,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Total Documents Card - Shows count for active category */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(10px, 1.2vw, 12px)`,
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              <div style={{
                width: `clamp(36px, 4.5vw, 44px)`,
                height: `clamp(36px, 4.5vw, 44px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText style={{ width: `clamp(18px, 2.2vw, 22px)`, height: `clamp(18px, 2.2vw, 22px)`, color: '#1E3A5F' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: `clamp(24px, 3vw, 28px)`,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: `clamp(4px, 0.5vh, 6px)`,
                  lineHeight: 1.2
                }}>
                  {totalDocuments}
                </div>
                <div style={{
                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  wordWrap: 'break-word'
                }}>
                  {activeCategory === 'All Documents' ? 'Total Documents' : activeCategory}
                </div>
              </div>
            </div>

            {/* Second Card - Dynamic based on category */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(10px, 1.2vw, 12px)`,
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              <div style={{
                width: `clamp(36px, 4.5vw, 44px)`,
                height: `clamp(36px, 4.5vw, 44px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText style={{ width: `clamp(18px, 2.2vw, 22px)`, height: `clamp(18px, 2.2vw, 22px)`, color: '#1E3A5F' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: `clamp(24px, 3vw, 28px)`,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: `clamp(4px, 0.5vh, 6px)`,
                  lineHeight: 1.2
                }}>
                  {activeCategory === 'All Documents' || activeCategory === 'Tax Documents'
                    ? taxDocumentsAvailable
                    : pdfDocumentsCount}
                </div>
                <div style={{
                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: `clamp(2px, 0.3vh, 4px)`,
                  wordWrap: 'break-word'
                }}>
                  {activeCategory === 'All Documents' || activeCategory === 'Tax Documents'
                    ? 'Tax Documents Available'
                    : 'PDF Documents'}
                </div>
                <div style={{
                  fontSize: `clamp(11px, 1.2vw, 12px)`,
                  color: '#94A3B8',
                  wordWrap: 'break-word'
                }}>
                  {activeCategory === 'All Documents' || activeCategory === 'Tax Documents'
                    ? 'K-1 forms, tax packages'
                    : `PDF format in ${activeCategory}`}
                </div>
              </div>
            </div>

            {/* New This Month Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: `clamp(12px, 1.5vw, 16px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(10px, 1.2vw, 12px)`,
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              <div style={{
                width: `clamp(36px, 4.5vw, 44px)`,
                height: `clamp(36px, 4.5vw, 44px)`,
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CloudDownload style={{ width: `clamp(18px, 2.2vw, 22px)`, height: `clamp(18px, 2.2vw, 22px)`, color: '#1E3A5F' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: `clamp(24px, 3vw, 28px)`,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: `clamp(4px, 0.5vh, 6px)`,
                  lineHeight: 1.2
                }}>
                  {newThisMonth}
                </div>
                <div style={{
                  fontSize: `clamp(12px, 1.3vw, 13px)`,
                  fontWeight: 500,
                  color: '#0F172A',
                  marginBottom: `clamp(2px, 0.3vh, 4px)`
                }}>
                  New This Month
                </div>
                <div style={{
                  fontSize: `clamp(11px, 1.2vw, 12px)`,
                  color: '#94A3B8',
                  wordWrap: 'break-word'
                }}>
                  {activeCategory === 'All Documents' ? 'Recently added documents' : `New in ${activeCategory}`}
                </div>
              </div>
            </div>
          </div>

          {/* Tax Documents Available Section - Only show if there are tax documents */}
          {taxDocumentsAvailable > 0 && (activeCategory === 'All Documents' || activeCategory === 'Tax Documents') && (
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: `clamp(16px, 2vw, 20px)`,
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              marginBottom: `clamp(16px, 2vh, 24px)`,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'flex-start',
              gap: `clamp(16px, 2vw, 24px)`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
                <h3 style={{
                  fontSize: `clamp(16px, 2vw, 18px)`,
                  fontWeight: 600,
                  color: '#0F172A',
                  marginTop: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  marginBottom: `clamp(8px, 1vh, 12px)`
                }}>
                  {investorsData.documents.taxDocumentsSection.title}
                </h3>
                <p style={{
                  fontSize: `clamp(13px, 1.5vw, 14px)`,
                  color: '#64748B',
                  margin: 0,
                  marginBottom: `clamp(16px, 2vh, 20px)`,
                  lineHeight: 1.5
                }}>
                  {investorsData.documents.taxDocumentsSection.description}
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: `clamp(10px, 1.2vw, 12px)`,
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  {investorsData.documents.taxDocumentsSection.buttons.map((btn, idx) => {
                    const IconComponent = documentIconMap[btn.icon] || FileText;
                    return (
                      <button
                        key={idx}
                        style={{
                          padding: `clamp(12px, 1.5vh, 16px)`,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: `clamp(4px, 0.6vw, 6px)`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: `clamp(10px, 1.2vw, 12px)`,
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{
                          width: `clamp(36px, 4.5vw, 44px)`,
                          height: `clamp(36px, 4.5vw, 44px)`,
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComponent style={{ width: `clamp(18px, 2.2vw, 22px)`, height: `clamp(18px, 2.2vw, 22px)`, color: '#1E3A5F' }} />
                        </div>
                        <span style={{
                          fontSize: `clamp(13px, 1.5vw, 14px)`,
                          fontWeight: 500,
                          color: '#0F172A',
                          wordWrap: 'break-word',
                          flex: 1,
                          textAlign: 'left'
                        }}>
                          {btn.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `clamp(10px, 1.2vw, 12px)`,
                minWidth: isMobile ? '100%' : '200px',
                width: isMobile ? '100%' : 'auto'
              }}>
                {investorsData.documents.taxDocumentsSection.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (action.text === 'Download All') {
                        /* Implement Download All Tax Documents Function */
                      } else if (action.text === 'View Tax Summary') {
                        /* Implement View Tax Summary Function */
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: `clamp(8px, 1vh, 10px) clamp(14px, 1.8vw, 20px)`,
                      fontSize: `clamp(12px, 1.3vw, 13px)`,
                      fontWeight: 500,
                      color: action.type === 'primary' ? '#FFFFFF' : '#1E3A5F',
                      backgroundColor: action.type === 'primary' ? '#1E3A5F' : '#FFFFFF',
                      border: action.type === 'primary' ? 'none' : '1px solid #1E3A5F',
                      borderRadius: `clamp(4px, 0.6vw, 6px)`,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `clamp(12px, 1.5vw, 16px)`,
            marginBottom: `clamp(16px, 2vh, 20px)`,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: `clamp(10px, 1.2vw, 12px)`,
              alignItems: isMobile ? 'stretch' : 'center',
              flexWrap: 'wrap',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Search Bar */}
              <div style={{
                position: 'relative',
                flex: isMobile ? '1 1 100%' : 1,
                minWidth: isMobile ? '100%' : '250px',
                width: isMobile ? '100%' : 'auto'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: `clamp(12px, 1.5vw, 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 2vw, 18px)`,
                  height: `clamp(16px, 2vw, 18px)`,
                  color: '#64748B',
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  placeholder={investorsData.documents.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(10px, 1.2vh, 12px) clamp(40px, 5vw, 48px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Filter Buttons */}
              <div
                className="filter-buttons-scroll"
                style={{
                  display: 'flex',
                  gap: `clamp(8px, 1vw, 12px)`,
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  alignItems: 'center',
                  overflowX: isMobile ? 'auto' : 'visible',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  width: isMobile ? '100%' : 'auto',
                  paddingBottom: isMobile ? '4px' : '0',
                  boxSizing: 'border-box'
                }}>
                {investorsData.documents.filters.map((filter) => {
                  // Calculate count for each filter
                  let filterCount = 0;
                  if (filter === 'All') {
                    filterCount = allDocuments.length;
                  } else if (filter === 'PDF') {
                    filterCount = allDocuments.filter(doc => doc.format === 'PDF').length;
                  } else if (filter === 'This Year') {
                    filterCount = allDocuments.filter(doc => {
                      const dateStr = doc.generatedDate || doc.description;
                      const docDate = parseDocumentDate(dateStr);
                      return docDate && docDate.getFullYear() === currentYear;
                    }).length;
                  } else if (filter === 'Last Year') {
                    filterCount = allDocuments.filter(doc => {
                      const dateStr = doc.generatedDate || doc.description;
                      const docDate = parseDocumentDate(dateStr);
                      return docDate && docDate.getFullYear() === currentYear - 1;
                    }).length;
                  }

                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      style={{
                        padding: `clamp(6px, 0.8vh, 8px) clamp(12px, 1.5vw, 16px)`,
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        fontWeight: activeFilter === filter ? 600 : 500,
                        color: activeFilter === filter ? '#1E3A5F' : '#64748B',
                        backgroundColor: activeFilter === filter ? '#FFFFFF' : 'transparent',
                        border: activeFilter === filter ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
                        borderRadius: `clamp(4px, 0.6vw, 6px)`,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: `clamp(6px, 0.8vw, 8px)`,
                        flexShrink: 0
                      }}
                    >
                      <span>{filter}</span>
                      {filterCount > 0 && filter !== 'All' && (
                        <span style={{
                          fontSize: `clamp(10px, 1.1vw, 11px)`,
                          color: activeFilter === filter ? '#1E3A5F' : '#94A3B8',
                          backgroundColor: activeFilter === filter ? '#EFF6FF' : '#F1F5F9',
                          padding: `clamp(2px, 0.3vh, 3px) clamp(6px, 0.8vw, 8px)`,
                          borderRadius: `clamp(8px, 1vw, 10px)`,
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}>
                          {filterCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Advanced Filters */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                <button
                  onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(16px, 2vw, 20px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    fontWeight: 500,
                    color: '#64748B',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    gap: `clamp(6px, 0.8vw, 8px)`,
                    boxSizing: 'border-box'
                  }}
                >
                  Advanced Filters
                  <ChevronDown style={{
                    width: `clamp(16px, 2vw, 18px)`,
                    height: `clamp(16px, 2vw, 18px)`,
                    transform: advancedFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>
              </div>
            </div>

            {/* Display Options and Sort */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexWrap: 'wrap',
              gap: `clamp(10px, 1.2vw, 12px)`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* View Mode Icons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: `clamp(4px, 0.5vw, 6px)`,
                backgroundColor: '#F1F5F9',
                padding: '4px',
                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px)`,
                    backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LayoutGrid style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: viewMode === 'grid' ? '#1E3A5F' : '#64748B' }} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: `clamp(6px, 0.8vh, 8px)`,
                    backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: `clamp(4px, 0.5vw, 6px)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <List style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: viewMode === 'list' ? '#1E3A5F' : '#64748B' }} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: `clamp(10px, 1.2vh, 12px) clamp(32px, 4vw, 40px) clamp(10px, 1.2vh, 12px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(13px, 1.4vw, 14px)`,
                    border: '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontWeight: 500,
                    boxSizing: 'border-box'
                  }}
                >
                  {investorsData.documents.sortOptions.map((option) => (
                    <option key={option} value={option}>Sort by: {option}</option>
                  ))}
                </select>
                <ChevronDown style={{
                  position: 'absolute',
                  right: `clamp(12px, 1.5vw, 16px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `clamp(16px, 1.8vw, 18px)`,
                  height: `clamp(16px, 1.8vw, 18px)`,
                  color: '#64748B',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* Document Count */}
              <div style={{
                fontSize: `clamp(12px, 1.3vw, 14px)`,
                color: '#64748B',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                textAlign: isMobile ? 'center' : 'left',
                width: isMobile ? '100%' : 'auto'
              }}>
                Showing {showingCount} of {totalCount} documents
              </div>
            </div>
          </div>

          {/* Documents Grid View */}
          {viewMode === 'grid' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: `clamp(12px, 1.5vw, 16px)`,
              marginBottom: `clamp(16px, 2vh, 24px)`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {currentDocuments.map((doc) => {
                const IconComponent = documentIconMap[doc.icon] || FileText;
                return (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: `clamp(12px, 1.5vw, 16px)`,
                      borderRadius: `clamp(6px, 0.8vw, 8px)`,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0
                    }}
                  >
                    {/* Tags */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: `clamp(16px, 2vh, 20px)`
                    }}>
                      {doc.tag && (
                        <span style={{
                          padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                          fontSize: `clamp(11px, 1.2vw, 12px)`,
                          fontWeight: 500,
                          color: doc.tagColor,
                          backgroundColor: doc.tagBgColor,
                          borderRadius: `clamp(12px, 1.5vw, 16px)`,
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.tag}
                        </span>
                      )}
                      {doc.format && (
                        <span style={{
                          padding: `clamp(4px, 0.5vh, 6px) clamp(10px, 1.3vw, 12px)`,
                          fontSize: `clamp(11px, 1.2vw, 12px)`,
                          fontWeight: 500,
                          color: doc.formatColor,
                          backgroundColor: doc.formatBgColor,
                          borderRadius: `clamp(12px, 1.5vw, 16px)`,
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.format}
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div style={{
                      width: `clamp(48px, 6vw, 64px)`,
                      height: `clamp(48px, 6vw, 64px)`,
                      borderRadius: `clamp(8px, 1vw, 12px)`,
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: `clamp(12px, 1.5vh, 16px)`
                    }}>
                      <IconComponent style={{ width: `clamp(24px, 3vw, 32px)`, height: `clamp(24px, 3vw, 32px)`, color: doc.iconColor }} />
                    </div>

                    {/* Document Details */}
                    <div style={{
                      width: '100%',
                      marginBottom: `clamp(12px, 1.5vh, 16px)`
                    }}>
                      <div style={{
                        fontSize: `clamp(13px, 1.5vw, 15px)`,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: `clamp(6px, 0.8vh, 8px)`,
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>
                        {doc.name}
                      </div>
                      <div style={{
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        color: '#64748B',
                        marginBottom: `clamp(4px, 0.5vh, 6px)`,
                        wordWrap: 'break-word'
                      }}>
                        {doc.type}
                      </div>
                      <div style={{
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        color: '#64748B',
                        marginBottom: `clamp(4px, 0.5vh, 6px)`,
                        wordWrap: 'break-word'
                      }}>
                        {doc.description}
                      </div>
                      <div style={{
                        fontSize: `clamp(11px, 1.2vw, 12px)`,
                        color: '#64748B',
                        fontWeight: 500
                      }}>
                        {doc.size}
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      style={{
                        width: '100%',
                        padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                        fontSize: `clamp(12px, 1.3vw, 13px)`,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#1E3A5F',
                        border: 'none',
                        borderRadius: `clamp(4px, 0.6vw, 6px)`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Documents Table List View */}
          {viewMode === 'list' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: `clamp(6px, 0.8vw, 8px)`,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              overflowX: 'auto',
              marginBottom: `clamp(16px, 2vh, 24px)`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {!isMobile ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isTablet ? '900px' : '1000px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'left', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'left', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'left', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'left', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'left', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Size</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'center', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Format</th>
                      <th style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'center', fontSize: `clamp(10px, 1.1vw, 11px)`, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDocuments.map((doc, index) => {
                      const IconComponent = documentIconMap[doc.icon] || FileText;
                      return (
                        <tr
                          key={doc.id}
                          style={{
                            borderBottom: index < currentDocuments.length - 1 ? '1px solid #E2E8F0' : 'none'
                          }}
                        >
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(10px, 1.2vw, 12px)` }}>
                              <div style={{
                                width: `clamp(36px, 4.5vw, 44px)`,
                                height: `clamp(36px, 4.5vw, 44px)`,
                                borderRadius: `clamp(6px, 0.8vw, 8px)`,
                                backgroundColor: '#F8FAFC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <IconComponent style={{ width: `clamp(18px, 2.2vw, 22px)`, height: `clamp(18px, 2.2vw, 22px)`, color: doc.iconColor }} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: `clamp(13px, 1.5vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: '4px', wordWrap: 'break-word' }}>
                                  {doc.name}
                                </div>
                                {doc.tag && (
                                  <span style={{
                                    padding: `clamp(2px, 0.3vh, 3px) clamp(6px, 0.8vw, 8px)`,
                                    fontSize: `clamp(9px, 1vw, 10px)`,
                                    fontWeight: 500,
                                    color: doc.tagColor,
                                    backgroundColor: doc.tagBgColor,
                                    borderRadius: `clamp(8px, 1vw, 10px)`,
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {doc.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', wordWrap: 'break-word' }}>
                            {doc.type}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', wordWrap: 'break-word' }}>
                            {doc.category}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', whiteSpace: 'nowrap' }}>
                            {doc.generatedDate}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {doc.size}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'center' }}>
                            {doc.format && (
                              <span style={{
                                padding: `clamp(3px, 0.4vh, 4px) clamp(8px, 1vw, 10px)`,
                                fontSize: `clamp(10px, 1.1vw, 11px)`,
                                fontWeight: 500,
                                color: doc.formatColor,
                                backgroundColor: doc.formatBgColor,
                                borderRadius: `clamp(10px, 1.2vw, 12px)`,
                                whiteSpace: 'nowrap'
                              }}>
                                {doc.format}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: `clamp(10px, 1.2vw, 12px)`, textAlign: 'center' }}>
                            <button
                              style={{
                                padding: `clamp(5px, 0.6vh, 6px) clamp(10px, 1.2vw, 12px)`,
                                borderRadius: `clamp(4px, 0.6vw, 6px)`,
                                border: 'none',
                                backgroundColor: '#1E3A5F',
                                color: '#FFFFFF',
                                fontSize: `clamp(11px, 1.2vw, 12px)`,
                                fontWeight: 500,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                // Mobile card view for list mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(12px, 1.5vw, 16px)`, padding: `clamp(12px, 1.5vw, 16px)` }}>
                  {currentDocuments.map((doc) => {
                    const IconComponent = documentIconMap[doc.icon] || FileText;
                    return (
                      <div
                        key={doc.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: `clamp(6px, 0.8vw, 8px)`,
                          padding: `clamp(12px, 1.5vw, 16px)`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: `clamp(10px, 1.2vh, 12px)`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: `clamp(10px, 1.2vw, 12px)`, flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: `clamp(32px, 4vw, 40px)`,
                              height: `clamp(32px, 4vw, 40px)`,
                              borderRadius: `clamp(6px, 0.8vw, 8px)`,
                              backgroundColor: '#F8FAFC',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComponent style={{ width: `clamp(16px, 2vw, 20px)`, height: `clamp(16px, 2vw, 20px)`, color: doc.iconColor }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: `clamp(13px, 1.4vw, 14px)`, fontWeight: 600, color: '#0F172A', marginBottom: '4px', wordWrap: 'break-word' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B', wordWrap: 'break-word' }}>
                                {doc.type}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            {doc.tag && (
                              <span style={{
                                padding: `clamp(2px, 0.3vh, 4px) clamp(8px, 1vw, 10px)`,
                                fontSize: `clamp(10px, 1.1vw, 11px)`,
                                fontWeight: 500,
                                color: doc.tagColor,
                                backgroundColor: doc.tagBgColor,
                                borderRadius: `clamp(10px, 1.2vw, 12px)`,
                                whiteSpace: 'nowrap'
                              }}>
                                {doc.tag}
                              </span>
                            )}
                            {doc.format && (
                              <span style={{
                                padding: `clamp(2px, 0.3vh, 4px) clamp(8px, 1vw, 10px)`,
                                fontSize: `clamp(10px, 1.1vw, 11px)`,
                                fontWeight: 500,
                                color: doc.formatColor,
                                backgroundColor: doc.formatBgColor,
                                borderRadius: `clamp(10px, 1.2vw, 12px)`,
                                whiteSpace: 'nowrap'
                              }}>
                                {doc.format}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 0.8vh, 8px)`, fontSize: `clamp(12px, 1.3vw, 13px)`, color: '#64748B' }}>
                          <div>Category: {doc.category}</div>
                          <div>Date: {doc.generatedDate}</div>
                          <div>Size: {doc.size}</div>
                        </div>

                        <div style={{ paddingTop: `clamp(8px, 1vh, 12px)`, borderTop: '1px solid #E2E8F0' }}>
                          <button
                            style={{
                              width: '100%',
                              padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                              borderRadius: `clamp(4px, 0.6vw, 6px)`,
                              border: 'none',
                              backgroundColor: '#1E3A5F',
                              color: '#FFFFFF',
                              fontSize: `clamp(12px, 1.3vw, 13px)`,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `clamp(6px, 0.8vw, 8px)`,
              marginTop: `clamp(16px, 2vh, 24px)`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: `clamp(8px, 1vh, 10px)`,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B' }} />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: `clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px)`,
                    fontSize: `clamp(12px, 1.3vw, 14px)`,
                    fontWeight: currentPage === pageNum ? 600 : 500,
                    color: currentPage === pageNum ? '#FFFFFF' : '#64748B',
                    backgroundColor: currentPage === pageNum ? '#1E3A5F' : '#FFFFFF',
                    border: currentPage === pageNum ? 'none' : '1px solid #E2E8F0',
                    borderRadius: `clamp(6px, 0.8vw, 8px)`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: `clamp(32px, 4vw, 40px)`
                  }}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: `clamp(8px, 1vh, 10px)`,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: `clamp(6px, 0.8vw, 8px)`,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight style={{ width: `clamp(16px, 2vw, 18px)`, height: `clamp(16px, 2vw, 18px)`, color: '#64748B' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            /* Hide scrollbar for category tabs and filter buttons on mobile */
            .category-tabs-scroll::-webkit-scrollbar,
            .filter-buttons-scroll::-webkit-scrollbar {
              display: none;
            }
            .category-tabs-scroll,
            .filter-buttons-scroll {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          }
        `}
      </style>
    </>
  );
}

