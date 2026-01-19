import { CSSProperties, useState } from 'react';
import {
  Download,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import adminData from '../../data/admin.json';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Download,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2
};

export default function CalendarDeadlineEngine() {
  // Extract data from JSON
  const calendarData = adminData.calendarDeadlineEngine;
  const header = calendarData.header;
  const actionButtons = calendarData.actionButtons;
  const leftSidebar = calendarData.leftSidebar;
  const summaryCards = calendarData.summaryCards;
  const calendar = calendarData.calendar;
  const rightSidebar = calendarData.rightSidebar;

  const [selectedView, setSelectedView] = useState<string>(leftSidebar.views.selected);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(leftSidebar.workflows.selected);

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Create a map of deadlines by date for quick lookup
  const deadlinesByDate = new Map<number, any[]>();
  calendar.deadlines.forEach((deadline: any) => {
    deadlinesByDate.set(deadline.date, deadline.items);
  });

  // Generate calendar grid for December 2024
  // December 1, 2024 is a Sunday (day 0)
  const daysInMonth = 31;
  const firstDayOfMonth = new Date(2024, 11, 1).getDay(); // 0 = Sunday
  
  const weeks: Array<Array<{ date: number | null; isCurrentMonth: boolean; deadlines: any[] }>> = [];
  let currentWeek: Array<{ date: number | null; isCurrentMonth: boolean; deadlines: any[] }> = [];
  
  // Pad the first week with empty cells before Dec 1
  // Since Dec 1 is Sunday (0), no padding needed - it's the first day of the week
  // But if we want to start from Monday, we'd pad with 1 empty cell
  // Actually, let's start from Sunday as that's standard
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push({ date: null, isCurrentMonth: false, deadlines: [] });
  }
  
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    currentWeek.push({
      date: i,
      isCurrentMonth: true,
      deadlines: deadlinesByDate.get(i) || []
    });
    
    // If we've filled a week (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Pad the last week to complete it
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push({ date: null, isCurrentMonth: false, deadlines: [] });
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

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
    padding: 20
  };

  const ExportIcon = iconMap[actionButtons.export.icon] || Download;
  const AddManualIcon = iconMap[actionButtons.addManual.icon] || Plus;

  return (
    <div style={pageWrapperStyle}>
      <AdminNav />

      <div
        style={{
          padding: isMobile ? '20px 16px' : isTablet ? '24px 24px' : '32px 48px',
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Main Layout: 3 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '280px 1.6fr 320px',
            gap: isMobileOrTablet ? 16 : 24,
            alignItems: 'start',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0
          }}
        >
          {/* Left Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            {/* Views */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.views.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leftSidebar.views.options.map((view: string) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedView === view ? '#2563EB' : 'transparent',
                      color: selectedView === view ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: selectedView === view ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {/* Workflows */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.workflows.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leftSidebar.workflows.options.map((workflow: string) => (
                  <button
                    key={workflow}
                    onClick={() => setSelectedWorkflow(workflow)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedWorkflow === workflow ? '#2563EB' : 'transparent',
                      color: selectedWorkflow === workflow ? '#FFFFFF' : '#64748B',
                      fontSize: 14,
                      fontWeight: selectedWorkflow === workflow ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {workflow}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Type */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.deadlineType.label}
              </div>
              <input
                type="text"
                value={leftSidebar.deadlineType.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Date Range */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.dateRange.label}
              </div>
              <input
                type="text"
                value={leftSidebar.dateRange.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* County */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.county.label}
              </div>
              <input
                type="text"
                value={leftSidebar.county.value}
                readOnly
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F9FAFB',
                  fontSize: 14,
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Legend */}
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  marginBottom: 12
                }}
              >
                {leftSidebar.legend.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leftSidebar.legend.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: '#64748B'
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            {/* Header */}
            <div>
              <h1
                style={{
                  fontSize: isMobile ? 22 : 28,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 8,
                  marginLeft: 0
                }}
              >
                {header.title}
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: '#64748B',
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0
                }}
              >
                {header.subtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                justifyContent: 'flex-end',
                alignItems: isMobile ? 'stretch' : 'center'
              }}
            >
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <ExportIcon style={{ width: 16, height: 16 }} />
                {actionButtons.export.label}
              </button>
              <button
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <AddManualIcon style={{ width: 16, height: 16 }} />
                {actionButtons.addManual.label}
              </button>
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr'
                  : isTablet
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(4, minmax(0, 1fr))',
                gap: 16
              }}
            >
              {summaryCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || AlertCircle;
                return (
                  <div
                    key={idx}
                    style={{
                      ...cardStyle,
                      backgroundColor: card.bg,
                      border: `1px solid ${card.color}20`,
                      padding: 20
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: card.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <CardIcon style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: card.color,
                            marginBottom: 4
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#0F172A'
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#64748B',
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                        lineHeight: 1.5
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Calendar */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: isMobile ? 16 : isTablet ? 18 : 20,
              minWidth: 0,
              overflowX: 'auto'
            }}>
              {/* Calendar Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? 16 : isTablet ? 20 : 24
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? 18 : isTablet ? 19 : 20,
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  {calendar.month} {calendar.year}
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 6 : 8 }}>
                  <button
                    style={{
                      width: isMobile ? 28 : isTablet ? 30 : 32,
                      height: isMobile ? 28 : isTablet ? 30 : 32,
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
                    <ChevronLeft style={{ width: isMobile ? 14 : isTablet ? 15 : 16, height: isMobile ? 14 : isTablet ? 15 : 16, color: '#64748B' }} />
                  </button>
                  <button
                    style={{
                      width: isMobile ? 28 : isTablet ? 30 : 32,
                      height: isMobile ? 28 : isTablet ? 30 : 32,
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
                    <ChevronRight style={{ width: isMobile ? 14 : isTablet ? 15 : 16, height: isMobile ? 14 : isTablet ? 15 : 16, color: '#64748B' }} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid Container */}
              <div style={{ minWidth: 0, width: '100%' }}>
                {/* Days of Week Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: isMobile ? 4 : isTablet ? 6 : 8,
                    marginBottom: 12
                  }}
                >
                  {calendar.daysOfWeek.map((day: string) => (
                    <div
                      key={day}
                      style={{
                        fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                        fontWeight: 600,
                        color: '#64748B',
                        textAlign: 'center',
                        padding: isMobile ? '6px 0' : '8px 0'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 4 : isTablet ? 6 : 8 }}>
                {weeks.map((week, weekIdx) => (
                  <div
                    key={weekIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: isMobile ? 4 : isTablet ? 6 : 8
                    }}
                  >
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        style={{
                          aspectRatio: '1',
                          padding: isMobile ? '6px' : isTablet ? '7px' : '8px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          backgroundColor: day.date ? '#FFFFFF' : '#F8FAFC',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: isMobile ? 3 : isTablet ? 4 : 6,
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        {day.date && (
                          <>
                            <div
                              style={{
                                fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                                fontWeight: 600,
                                color: '#0F172A',
                                lineHeight: 1.2
                              }}
                            >
                              {day.date}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : isTablet ? 3 : 4, flex: 1, minHeight: 0 }}>
                              {day.deadlines.map((deadline: any, deadlineIdx: number) => (
                                <div
                                  key={deadlineIdx}
                                  style={{
                                    padding: isMobile ? '2px 6px' : isTablet ? '3px 7px' : '4px 8px',
                                    borderRadius: isMobile ? 4 : isTablet ? 5 : 6,
                                    backgroundColor: deadline.bg,
                                    color: deadline.color,
                                    fontSize: isMobile ? 9 : isTablet ? 10 : 11,
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {deadline.type}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                </div>
              </div>

              {/* Calendar Footer */}
              <div
                style={{
                  marginTop: isMobile ? 16 : isTablet ? 18 : 20,
                  paddingTop: isMobile ? 16 : isTablet ? 18 : 20,
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? 8 : 0
                }}
              >
                <span
                  style={{
                    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
                    color: '#64748B'
                  }}
                >
                  {calendar.footerText}
                </span>
                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#2563EB',
                    fontSize: isMobile ? 12 : isTablet ? 12.5 : 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {calendar.viewAsListLink}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 16 : 24, minWidth: 0 }}>
            <div style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#0F172A',
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0
                  }}
                >
                  {rightSidebar.title}
                </h3>
                <select
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F9FAFB',
                    fontSize: 12,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                  defaultValue={rightSidebar.filter}
                >
                  <option>{rightSidebar.filter}</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {rightSidebar.deadlines.map((deadline: any) => (
                  <div
                    key={deadline.id}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        borderRadius: 2,
                        backgroundColor: deadline.barColor,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 4
                        }}
                      >
                        {deadline.type} - {deadline.propertyId}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#64748B',
                          marginBottom: 8
                        }}
                      >
                        {deadline.property}
                        {deadline.county && ` • ${deadline.county}`}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#64748B',
                          marginBottom: 8
                        }}
                      >
                        Due in {deadline.dueIn}
                      </div>
                      <button
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#2563EB',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        {deadline.link}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

