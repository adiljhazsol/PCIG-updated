import { CSSProperties, useState, useRef, useEffect, RefObject } from 'react';
import {
  Plus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Globe,
  LayoutGrid,
  Clock,
  Percent,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Copy,
  Edit,
  Gavel,
  File,
  Trash2,
  Save,
  X,
  Eye,
  Loader2
} from 'lucide-react';
import AdminNav from '../../components/admin/AdminNav';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import adminData from '../../data/admin.json';
import api from '../../services/api';

// Icon mapping from JSON string names to actual icon components
const iconMap: { [key: string]: any } = {
  Plus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Globe,
  LayoutGrid,
  Clock,
  Percent,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Copy,
  Edit,
  Gavel,
  File
};

export default function CityCountyStateConfig() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isMobileOrTablet = isMobile || isTablet;

  // Extract data from JSON with safe defaults
  const configData: any = adminData?.cityCountyStateConfig || {};
  const header = configData?.header || {
    title: 'City, County & State Configuration',
    subtitle: 'Manage jurisdiction rules and settings'
  };
  const overviewCards = configData?.overviewCards || [];
  const leftSidebar = configData?.leftSidebar || {
    navigation: []
  };
  const countySelector = configData?.countySelector || {
    label: 'Select County',
    options: []
  };
  const redemptionRules = configData?.redemptionRules || {
    title: 'Redemption Rules',
    sections: []
  };
  const barmentRules = configData?.barmentRules || {
    title: 'Barment Rules',
    sections: []
  };
  const localFees = configData?.localFees || {
    title: 'Local Fees & Taxes',
    sections: []
  };
  const statutoryTemplates = configData?.statutoryTemplates || {
    title: 'Statutory Templates',
    subtitle: 'Manage document templates for notices and legal filings',
    addButton: {
      label: 'Add Template',
      icon: 'Plus'
    },
    table: {
      headers: ['Template Name', 'Type', 'Last Updated', 'Actions']
    }
  };

  const [activeSidebarItem, setActiveSidebarItem] = useState<string>(
    leftSidebar.items.find((item: any) => item.active)?.id || 'overview'
  );
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data States
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [statsCards, setStatsCards] = useState<any[]>(configData?.overviewCards || []);

  // Form States - Redemption
  const [statutoryInterestRate, setStatutoryInterestRate] = useState<string>(
    redemptionRules.fields.statutoryInterestRate.value
  );
  const [interestMethod, setInterestMethod] = useState<string>(
    redemptionRules.fields.interestCalculationMethod.options.find((opt: any) => opt.selected)?.value || 'simple'
  );
  const [redemptionPeriod, setRedemptionPeriod] = useState<string>(
    redemptionRules.fields.redemptionPeriod.value
  );
  const [includeExpenses, setIncludeExpenses] = useState<boolean>(
    redemptionRules.fields.includeExpenses.enabled
  );
  const [includedCategories, setIncludedCategories] = useState<{ [key: string]: boolean }>(
    redemptionRules.fields.includedCategories.options.reduce((acc: any, opt: any) => {
      acc[opt.label] = opt.checked;
      return acc;
    }, {})
  );

  // Form States - Barment
  const [barmentPeriod, setBarmentPeriod] = useState<string>(
    barmentRules.fields.barmentPeriod.value
  );
  const [sendByDeadline, setSendByDeadline] = useState<string>(
    barmentRules.fields.sendByDeadline.value
  );
  const [noticeRequired, setNoticeRequired] = useState<boolean>(
    barmentRules.fields.noticeRequired.enabled
  );
  const [statutoryTemplate, setStatutoryTemplate] = useState<string>('');

  // Form States - Basic Info
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [jurisdictionName, setJurisdictionName] = useState(countySelector.selectedCounty.name);
  const [stateCode, setStateCode] = useState(countySelector.selectedCounty.state);
  const [fipsCode, setFipsCode] = useState('');
  const [timeZone, setTimeZone] = useState('Eastern Time (US & Canada)');

  // Form States - Fees
  const [fees, setFees] = useState<any[]>(localFees.table.rows || []);

  // Form States - Auction
  const [auctionSchedules, setAuctionSchedules] = useState<any[]>([]);

  // Form States - Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
    const [editContentTemplateId, setEditContentTemplateId] = useState<number | null>(null);

  // Form States - Add Location Modal
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [newLocationState, setNewLocationState] = useState('');
  const [newLocationCounty, setNewLocationCounty] = useState('');

  // Form States - Quiet Title
  const [quietTitleWaitingPeriod, setQuietTitleWaitingPeriod] = useState<string>('30');
  const [quietTitleRequiredDocs, setQuietTitleRequiredDocs] = useState<{ [key: string]: boolean }>({
    'Complaint': true,
    'Summons': true,
    'Lis Pendens': true
  });

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/locations/dashboard-data');
        const data = response.data;
        
        if (data) {
          if (data.locations) setLocations(data.locations);
          if (data.overviewCards) setStatsCards(data.overviewCards);
          
          if (data.locations && data.locations.length > 0 && !selectedLocationId) {
             // Select the first one by default if none selected
             setSelectedLocationId(data.locations[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch locations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Update form fields when selectedLocationId changes
  useEffect(() => {
    if (!selectedLocationId || locations.length === 0) return;

    const selected = locations.find(l => l.id === selectedLocationId);
    if (!selected) return;

    // Basic Info
    setJurisdictionName(selected.county || selected.city || 'Unknown Jurisdiction');
    setStateCode(selected.state || '');
    if (selected.contact_info) {
        setFipsCode(selected.contact_info.fips_code || '');
        setTimeZone(selected.contact_info.time_zone || 'Eastern Time (US & Canada)');
    }

    // Fees
    if (selected.fees && Array.isArray(selected.fees)) {
        setFees(selected.fees);
    } else {
        setFees([]);
    }

    // Rules
    if (selected.rules) {
      // Redemption
      if (selected.rules.redemption) {
        setStatutoryInterestRate(selected.rules.redemption.statutoryInterestRate || redemptionRules.fields.statutoryInterestRate.value);
        setInterestMethod(selected.rules.redemption.interestMethod || 'simple');
        setRedemptionPeriod(selected.rules.redemption.redemptionPeriod || redemptionRules.fields.redemptionPeriod.value);
        setIncludeExpenses(selected.rules.redemption.includeExpenses ?? true);
        if (selected.rules.redemption.includedCategories) {
             setIncludedCategories(selected.rules.redemption.includedCategories);
        }
      }

      // Barment
      if (selected.rules.barment) {
        setBarmentPeriod(selected.rules.barment.barmentPeriod || barmentRules.fields.barmentPeriod.value);
        setSendByDeadline(selected.rules.barment.sendByDeadline || barmentRules.fields.sendByDeadline.value);
        setNoticeRequired(selected.rules.barment.noticeRequired ?? true);
        setStatutoryTemplate(selected.rules.barment.statutoryTemplate || '');
      }

      // Quiet Title
      if (selected.rules.quiet_title) {
          setQuietTitleWaitingPeriod(selected.rules.quiet_title.waitingPeriod || '30');
          if (selected.rules.quiet_title.requiredDocs) {
              setQuietTitleRequiredDocs(selected.rules.quiet_title.requiredDocs);
          }
      } else {
          // Defaults
          setQuietTitleWaitingPeriod('30');
          setQuietTitleRequiredDocs({
            'Complaint': true,
            'Summons': true,
            'Lis Pendens': true
          });
      }

      // Auction
      if (selected.rules.auction && selected.rules.auction.schedules) {
          setAuctionSchedules(selected.rules.auction.schedules);
      } else {
          setAuctionSchedules([]);
      }

      // Templates
      if (selected.rules.templates) {
          setTemplates(selected.rules.templates);
      } else {
          setTemplates([]);
      }
    } else {
        // Reset to defaults if no rules found
        setQuietTitleWaitingPeriod('30');
        setAuctionSchedules([]);
        setTemplates([]);
    }
  }, [selectedLocationId, locations]);

  const handleSaveBasicInfo = async () => {
    if (!selectedLocationId) return;
    const currentLocation = locations.find(l => l.id === selectedLocationId);
    if (!currentLocation) return;

    try {
      setSaving(true);
      
      const updateData: any = {
        state: stateCode,
        contact_info: {
             fips_code: fipsCode,
             time_zone: timeZone
        }
      };

      // Handle County vs City update correctly
      if (currentLocation.city) {
          updateData.city = jurisdictionName;
      } else {
          updateData.county = jurisdictionName;
      }

      await api.put(`/admin/locations/${selectedLocationId}`, updateData);
      
      setIsEditingBasicInfo(false);
      
      // Update local locations list to reflect name change
      setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, ...updateData } : l));
      
      setSuccessMessage('Basic information saved');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving basic info:', err);
      setError('Failed to save basic information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRedemptionRules = async () => {
    if (!selectedLocationId) return;
    
    try {
      setSaving(true);
      const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
      
      const updatedRules = {
        ...currentRules,
        redemption: {
          statutoryInterestRate,
          interestMethod,
          redemptionPeriod,
          includeExpenses,
          includedCategories
        }
      };

      await api.put(`/admin/locations/${selectedLocationId}`, {
        rules: updatedRules
      });
      
      setSuccessMessage('Redemption rules saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving redemption rules:', err);
      setError('Failed to save redemption rules');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = () => {
    setNewLocationState('');
    setNewLocationCounty('');
    setIsAddLocationModalOpen(true);
  };

  const closeAddLocationModal = () => {
    setIsAddLocationModalOpen(false);
  };

  const confirmAddLocation = async () => {
    if (!newLocationState || !newLocationCounty) {
        alert("Please enter both State Code and County Name");
        return;
    }

    try {
      setSaving(true);
      const response = await api.post('/admin/locations', { 
        state: newLocationState, 
        county: newLocationCounty, 
        type: 'County',
        rules: {},
        fees: [],
        contact_info: {}
      });
      
      if (response.data.success) {
        const newLocation = response.data.data;
        setLocations([...locations, newLocation]);
        setSelectedLocationId(newLocation.id);
        
        // Update basic info fields
        setJurisdictionName(newLocation.county || newLocation.city || 'New Location');
        setStateCode(newLocation.state || '');
        setFees([]);
        setAuctionSchedules([]);
        setTemplates([]);
        
        setSuccessMessage('Location added successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        closeAddLocationModal();
      }
    } catch (err) {
      console.error('Error adding location:', err);
      setError('Failed to add location');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCloneLocation = async () => {
    if (!selectedLocationId) return;
    const currentLocation = locations.find(l => l.id === selectedLocationId);
    if (!currentLocation) return;

    const confirm = window.confirm(`Clone settings for ${currentLocation.county}?`);
    if (!confirm) return;

    try {
      setSaving(true);
      const newLocationData = {
        ...currentLocation,
        county: `${currentLocation.county} (Copy)`,
        city: currentLocation.city ? `${currentLocation.city} (Copy)` : null,
      };
      
      // Remove ID and timestamps to create new
      delete newLocationData.id;
      delete newLocationData.created_at;
      delete newLocationData.updated_at;

      const response = await api.post('/admin/locations', newLocationData);
      
      if (response.data.success) {
        const newLocation = response.data.data;
        setLocations([...locations, newLocation]);
        setSelectedLocationId(newLocation.id);
        
        setJurisdictionName(newLocation.county || newLocation.city);
        setStateCode(newLocation.state);
        
        setSuccessMessage('Location cloned successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error cloning location:', err);
      setError('Failed to clone location');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBarmentRules = async () => {
    if (!selectedLocationId) return;

    try {
      setSaving(true);
      const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
      
      const updatedRules = {
        ...currentRules,
        barment: {
          barmentPeriod,
          sendByDeadline,
          noticeRequired,
          statutoryTemplate
        }
      };

      await api.put(`/admin/locations/${selectedLocationId}`, {
        rules: updatedRules
      });
      
      // Update local locations state
      setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, rules: updatedRules } : l));

      setSuccessMessage('Barment rules saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving barment rules:', err);
      setError('Failed to save barment rules');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuietTitleRules = async () => {
    if (!selectedLocationId) return;

    try {
      setSaving(true);
      const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
      
      const updatedRules = {
        ...currentRules,
        quiet_title: {
            waitingPeriod: quietTitleWaitingPeriod,
            requiredDocs: quietTitleRequiredDocs
        }
      };

      await api.put(`/admin/locations/${selectedLocationId}`, {
        rules: updatedRules
      });
      
      // Update local locations state to prevent stale data on next save
      setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, rules: updatedRules } : l));

      setSuccessMessage('Quiet Title rules saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving quiet title rules:', err);
      setError('Failed to save quiet title rules');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFee = () => {
    if (!selectedLocationId) return;
    
    const newFee = {
        id: Date.now(),
        feeType: '',
        amount: '',
        category: 'General',
        effectiveDate: new Date().toISOString().split('T')[0],
        isEditing: true, 
        isNew: true
    };
    
    setFees([...fees, newFee]);
  };

  const handleEditFee = (id: any) => {
    setFees(fees.map(f => f.id === id ? { ...f, isEditing: true, original: { ...f } } : f));
  };

  const handleCancelEditFee = (id: any) => {
    setFees(fees.map(f => {
      if (f.id !== id) return f;
      if (f.isNew) return null;
      return { ...f.original, isEditing: false, original: undefined };
    }).filter(Boolean));
  };

  const handleSaveFee = async (id: any) => {
    if (!selectedLocationId) return;
    const feeToSave = fees.find(f => f.id === id);
    if (!feeToSave) return;

    // Remove internal flags
    const { isEditing, isNew, original, ...cleanFee } = feeToSave;
    
    // Clean up other fees for save
    const updatedFeesForSave = fees
        .filter(f => f.id === id || !f.isNew)
        .map(f => {
            if (f.id === id) return cleanFee;
            if (f.isEditing && f.original) {
                 const { isEditing: _ie, isNew: _in, original: _o, ...rest } = f.original;
                 return rest;
            }
            const { isEditing: _ie, isNew: _in, original: _o, ...rest } = f;
            return rest;
        });
    
    try {
      setSaving(true);
      await api.put(`/admin/locations/${selectedLocationId}`, {
        fees: updatedFeesForSave
      });
      
      // Update local state to reflect saved state (not editing)
      setFees(fees.map(f => f.id === id ? { ...cleanFee, isEditing: false } : f));
      
      setSuccessMessage('Fee saved');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving fee:', err);
      setError('Failed to save fee');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFee = async (id: any) => {
    if (!selectedLocationId) return;
    if (!window.confirm('Delete this fee?')) return;

    const updatedFees = fees.filter(f => f.id !== id);
    
    const cleanFees = updatedFees
        .filter(f => !f.isNew)
        .map(f => {
            if (f.isEditing && f.original) {
                 const { isEditing: _ie, isNew: _in, original: _o, ...rest } = f.original;
                 return rest;
            }
            const { isEditing: _ie, isNew: _in, original: _o, ...rest } = f;
            return rest;
        });
    
    try {
      setSaving(true);
      await api.put(`/admin/locations/${selectedLocationId}`, {
        fees: cleanFees
      });
      
      // Update local locations state
      setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, fees: cleanFees } : l));

      setFees(updatedFees);
      setSuccessMessage('Fee deleted');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting fee:', err);
      setError('Failed to delete fee');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFeeField = (id: any, field: string, value: string) => {
    setFees(fees.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleEditTemplate = (id: any) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, isEditing: true, original: { ...t } } : t));
  };

  const handleCancelEditTemplate = (id: any) => {
    setTemplates(templates.map(t => {
      if (t.id !== id) return t;
      if (t.isNew) return null;
      return { ...t.original, isEditing: false, original: undefined };
    }).filter(Boolean));
  };

  const handleUpdateTemplateField = (id: any, field: string, value: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleSaveTemplate = async (id: any) => {
      if (!selectedLocationId) return;
      const templateToSave = templates.find(t => t.id === id);
      if (!templateToSave) return;

      // Remove internal flags and update timestamp
      const { isEditing, isNew, original, ...cleanTemplate } = templateToSave;
      cleanTemplate.updatedAt = new Date().toLocaleDateString();
      
      const updatedTemplatesForSave = templates
          .filter(t => t.id === id || !t.isNew)
          .map(t => {
              if (t.id === id) return cleanTemplate;
              if (t.isEditing && t.original) {
                  const { isEditing: _ie, isNew: _in, original: _o, ...rest } = t.original;
                  return rest;
              }
              const { isEditing: _ie, isNew: _in, original: _o, ...rest } = t;
              return rest;
          });

      try {
          setSaving(true);
          const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
          const updatedRules = {
              ...currentRules,
              templates: updatedTemplatesForSave
          };
          
          await api.put(`/admin/locations/${selectedLocationId}`, {
              rules: updatedRules
          });
          
          // Update local locations state
          setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, rules: updatedRules } : l));
          
          setTemplates(templates.map(t => t.id === id ? { ...cleanTemplate, isEditing: false } : t));
          
          setSuccessMessage('Template saved');
          setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
          console.error('Error saving template:', err);
          setError('Failed to save template');
          setTimeout(() => setError(null), 3000);
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteTemplate = async (id: any) => {
      if (!selectedLocationId) return;
      if (!window.confirm('Delete this template?')) return;

      const updatedTemplates = templates.filter(t => t.id !== id);
      
      const cleanTemplates = updatedTemplates
          .filter(t => !t.isNew)
          .map(t => {
              if (t.isEditing && t.original) {
                  const { isEditing: _ie, isNew: _in, original: _o, ...rest } = t.original;
                  return rest;
              }
              const { isEditing: _ie, isNew: _in, original: _o, ...rest } = t;
              return rest;
          });

      try {
          setSaving(true);
          const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
          const updatedRules = {
              ...currentRules,
              templates: cleanTemplates
          };

          await api.put(`/admin/locations/${selectedLocationId}`, {
              rules: updatedRules
          });
          
          setTemplates(updatedTemplates);
          setSuccessMessage('Template deleted');
          setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
          console.error('Error deleting template:', err);
          setError('Failed to delete template');
          setTimeout(() => setError(null), 3000);
      } finally {
          setSaving(false);
      }
  };

  const handlePreviewTemplate = (id: any) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setPreviewTemplate(template);
    }
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const handleEditContent = (id: any) => {
    setEditContentTemplateId(id);
  };

  const closeEditContent = () => {
    setEditContentTemplateId(null);
  };

  const saveContent = (content: string) => {
    if (editContentTemplateId) {
        handleUpdateTemplateField(editContentTemplateId, 'content', content);
        closeEditContent();
    }
  };

  const handleAddAuctionSchedule = () => {
      if (!selectedLocationId) return;
      
      const newSchedule = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'Tax Deed',
          venue: 'Online',
          status: 'Scheduled',
          isEditing: true,
          isNew: true
      };
      
      setAuctionSchedules([...auctionSchedules, newSchedule]);
  };

  const handleEditAuctionSchedule = (id: any) => {
    setAuctionSchedules(auctionSchedules.map(s => s.id === id ? { ...s, isEditing: true, original: { ...s } } : s));
  };

  const handleCancelEditAuctionSchedule = (id: any) => {
    setAuctionSchedules(auctionSchedules.map(s => {
      if (s.id !== id) return s;
      if (s.isNew) return null;
      return { ...s.original, isEditing: false, original: undefined };
    }).filter(Boolean));
  };

  const handleSaveAuctionSchedule = async (id: any) => {
      if (!selectedLocationId) return;
      const scheduleToSave = auctionSchedules.find(s => s.id === id);
      if (!scheduleToSave) return;

      // Remove internal flags
      const { isEditing, isNew, original, ...cleanSchedule } = scheduleToSave;
      
      // Prepare schedules for backend:
      // 1. Include the one being saved (with current values)
      // 2. Include other existing schedules (reverting to original if they are currently being edited)
      // 3. Exclude other "new" schedules that haven't been saved yet
      const allSchedulesClean = auctionSchedules
          .filter(s => s.id === id || !s.isNew)
          .map(s => {
              if (s.id === id) return cleanSchedule;
              
              // If another item is being edited, use its original value for the backend save
              // so we don't commit incomplete edits
              if (s.isEditing && s.original) {
                  const { isEditing: _ie, isNew: _in, original: _o, ...rest } = s.original;
                  return rest;
              }
              
              // Otherwise use the item as is (stripping flags)
              const { isEditing: _ie, isNew: _in, original: _o, ...rest } = s;
              return rest;
          });

      try {
          setSaving(true);
          const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
          const updatedRules = {
              ...currentRules,
              auction: {
                  ...(currentRules.auction || {}),
                  schedules: allSchedulesClean
              }
          };
          
          await api.put(`/admin/locations/${selectedLocationId}`, {
              rules: updatedRules
          });
          
          // Update local state
          setAuctionSchedules(auctionSchedules.map(s => s.id === id ? { ...cleanSchedule, isEditing: false } : s));
          
          // Update local locations state
          setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, rules: updatedRules } : l));

          setSuccessMessage('Auction schedule saved');
          setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
          console.error('Error saving schedule:', err);
          setError('Failed to save schedule');
          setTimeout(() => setError(null), 3000);
      } finally {
          setSaving(false);
      }
  };

  const handleDeleteAuctionSchedule = async (id: any) => {
    if (!selectedLocationId) return;
    if (!window.confirm('Delete this schedule?')) return;

    const updatedSchedules = auctionSchedules.filter(s => s.id !== id);
    
    // Prepare schedules for backend (excluding the deleted one)
    // Also exclude other new/unsaved schedules and revert edited ones to original
    const cleanSchedules = updatedSchedules
        .filter(s => !s.isNew)
        .map(s => {
            if (s.isEditing && s.original) {
                const { isEditing: _ie, isNew: _in, original: _o, ...rest } = s.original;
                return rest;
            }
            const { isEditing: _ie, isNew: _in, original: _o, ...rest } = s;
            return rest;
        });

    try {
        setSaving(true);
        const currentRules = locations.find(l => l.id === selectedLocationId)?.rules || {};
        const updatedRules = {
            ...currentRules,
            auction: {
                ...(currentRules.auction || {}),
                schedules: cleanSchedules
            }
        };

        await api.put(`/admin/locations/${selectedLocationId}`, {
            rules: updatedRules
        });
        
        // Update local locations state
        setLocations(locations.map(l => l.id === selectedLocationId ? { ...l, rules: updatedRules } : l));
        
        setAuctionSchedules(updatedSchedules);
        setSuccessMessage('Auction schedule deleted');
        setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
        console.error('Error deleting schedule:', err);
        setError('Failed to delete schedule');
        setTimeout(() => setError(null), 3000);
    } finally {
        setSaving(false);
    }
  };

  const handleUpdateAuctionScheduleField = (id: any, field: string, value: string) => {
    setAuctionSchedules(auctionSchedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddTemplate = () => {
       if (!selectedLocationId) return;
      
      const newTemplate = {
          id: Date.now(),
          name: 'New Template',
          updatedAt: new Date().toLocaleDateString(),
          type: 'Notice',
          content: 'Enter template content here...',
          isEditing: true,
          isNew: true
      };
      
      setTemplates([...templates, newTemplate]);
  };


  // Refs for scrolling
  const overviewRef = useRef<HTMLDivElement>(null);
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const redemptionRef = useRef<HTMLDivElement>(null);
  const barmentRef = useRef<HTMLDivElement>(null);
  const quietTitleRef = useRef<HTMLDivElement>(null);
  const auctionRef = useRef<HTMLDivElement>(null);
  const feesRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  const sidebarItems = [
    { id: 'overview', label: 'Overview & List', icon: 'LayoutGrid' },
    { id: 'basic', label: 'Basic Information', icon: 'FileText' },
    { id: 'redemption', label: 'Redemption Rules', icon: 'Clock' },
    { id: 'barment', label: 'Barment Rules', icon: 'AlertTriangle' },
    { id: 'quietTitle', label: 'Quiet Title Rules', icon: 'Gavel' },
    { id: 'auction', label: 'Auction Schedules', icon: 'Calendar' },
    { id: 'fees', label: 'Local Fees', icon: 'DollarSign' },
    { id: 'templates', label: 'Statutory Templates', icon: 'File' }
  ];

  const scrollToSection = (id: string) => {
    setActiveSidebarItem(id);
    const refMap: { [key: string]: RefObject<HTMLDivElement | null> } = {
      'overview': overviewRef,
      'basic': basicInfoRef,
      'redemption': redemptionRef,
      'barment': barmentRef,
      'quietTitle': quietTitleRef,
      'auction': auctionRef,
      'fees': feesRef,
      'templates': templatesRef
    };
    
    const ref = refMap[id];
    if (ref && ref.current) {
      const yOffset = -100;
      const element = ref.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const pageWrapperStyle: CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: 0,
    padding: 0
  };

  const cardStyle: CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    padding: isMobile ? 12 : isTablet ? 16 : 20,
    boxSizing: 'border-box'
  };

  const AddButtonIcon = iconMap[header.addButton.icon] || Plus;
  const CloneIcon = iconMap[countySelector.cloneButton.icon] || Copy;
  const AddFeeIcon = iconMap[localFees.addButton.icon] || Plus;
  const AddTemplateIcon = iconMap[statutoryTemplates.addButton.icon] || Plus;

  const getSectionStatus = (section: string) => {
      const location = locations.find(l => l.id === selectedLocationId);
      if (!location) return { label: 'Unknown', bg: '#F1F5F9', color: '#64748B' };
      
      const rules = location.rules || {};
      
      if (section === 'redemption') {
          if (rules.redemption) return { label: 'Configured', bg: '#DCFCE7', color: '#166534' };
      } else if (section === 'barment') {
          if (rules.barment) return { label: 'Configured', bg: '#DCFCE7', color: '#166534' };
          return { label: 'Incomplete', bg: '#FEE2E2', color: '#991B1B' };
      } else if (section === 'quiet_title') {
          if (rules.quiet_title) return { label: 'Configured', bg: '#DCFCE7', color: '#166534' };
          return { label: 'Configuration Needed', bg: '#FEF3C7', color: '#B45309' };
      }
      
      return { label: 'Incomplete', bg: '#FEE2E2', color: '#991B1B' };
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
        {/* Main Layout: 2 columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '240px 1fr',
            gap: isMobile ? 16 : isTablet ? 20 : 24,
            width: '100%',
            minWidth: 0
          }}
        >
          {/* Left Sidebar */}
          <div style={{ 
            display: isMobileOrTablet ? 'none' : 'block', 
            minWidth: 0,
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column', 
              gap: 8,
              position: 'sticky',
              top: 125,
              maxHeight: 'calc(100vh - 145px)',
              overflowY: 'auto'
            }}>
            <div
              style={{
                fontSize: isMobile ? 10 : 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                marginBottom: 12,
                paddingLeft: 4
              }}
            >
              {leftSidebar.title}
            </div>
            {sidebarItems.map((item: any) => {
              const ItemIcon = iconMap[item.icon] || LayoutGrid;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 10,
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: activeSidebarItem === item.id ? '#2563EB' : 'transparent',
                    color: activeSidebarItem === item.id ? '#FFFFFF' : '#64748B',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: activeSidebarItem === item.id ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <ItemIcon style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18, flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </button>
              );
            })}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24, minWidth: 0, width: '100%' }}>
            <div ref={overviewRef} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24 }}>
            {/* Header */}
            <div style={{ width: '100%', minWidth: 0 }}>
              {successMessage && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #10B981'
                }}>
                  {successMessage}
                </div>
              )}
              {error && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  border: '1px solid #EF4444'
                }}>
                  {error}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
                  marginBottom: isMobile ? 12 : 16,
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
                <button
                  onClick={handleAddLocation}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: saving ? '#94A3B8' : '#2563EB',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <AddButtonIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />}
                  <span style={{ whiteSpace: 'nowrap' }}>{header.addButton.label}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: isMobile ? 16 : isTablet ? 20 : 24, width: '100%', minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    gap: 4
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      color: '#64748B'
                    }}
                  >
                    {header.completeness.label}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 600,
                      color: '#0F172A'
                    }}
                  >
                    {header.completeness.percentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: isMobile ? 6 : 8,
                    borderRadius: 4,
                    backgroundColor: '#E2E8F0',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${header.completeness.percentage}%`,
                      height: '100%',
                      backgroundColor: header.completeness.color,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : isTablet ? 14 : 16,
                width: '100%',
                minWidth: 0
              }}
            >
              {statsCards.map((card: any, idx: number) => {
                const CardIcon = iconMap[card.icon] || Layers;
                const SubIcon = card.subIcon ? iconMap[card.subIcon] : null;
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
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        <CardIcon style={{ width: isMobile ? 18 : isTablet ? 19 : 20, height: isMobile ? 18 : isTablet ? 19 : 20 }} />
                        {SubIcon && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              width: isMobile ? 16 : 18,
                              height: isMobile ? 16 : 18,
                              borderRadius: '50%',
                              backgroundColor: SubIcon === CheckCircle2 ? '#10B981' : card.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #FFFFFF'
                            }}
                          >
                            <SubIcon style={{ width: isMobile ? 9 : 10, height: isMobile ? 9 : 10, color: '#FFFFFF' }} />
                          </div>
                        )}
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
                            color: card.color
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* County Selector */}
            <div style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginBottom: isMobile ? 12 : 16,
                  gap: isMobile ? 12 : 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: isMobile ? 40 : isTablet ? 44 : 48,
                      height: isMobile ? 40 : isTablet ? 44 : 48,
                      borderRadius: '50%',
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                      fontWeight: 600,
                      color: '#0F172A',
                      flexShrink: 0
                    }}
                  >
                    {countySelector.selectedCounty.state}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? 14 : isTablet ? 15 : 16,
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: 4,
                        wordBreak: 'break-word'
                      }}
                    >
                      {countySelector.selectedCounty.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: isMobile ? 10 : 11,
                          fontWeight: 500,
                          backgroundColor: countySelector.selectedCounty.statusBg,
                          color: countySelector.selectedCounty.statusColor,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {countySelector.selectedCounty.status}
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: '#64748B',
                          wordBreak: 'break-word'
                        }}
                      >
                        Last updated: {countySelector.selectedCounty.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                  <select
                    style={{
                      padding: isMobile ? '8px 10px' : '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      cursor: 'pointer',
                      minWidth: isMobile ? '100%' : 200,
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                    value={selectedLocationId || ''}
                    onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                  >
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                            {loc.county || loc.city || loc.state || 'Unnamed Location'}
                        </option>
                    ))}
                    {locations.length === 0 && <option value="">No locations found</option>}
                  </select>
                  <button
                    onClick={handleCloneLocation}
                    disabled={saving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: isMobile ? '8px 14px' : '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: saving ? '#94A3B8' : '#64748B',
                      fontSize: isMobile ? 12 : 13,
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: isMobile ? 'center' : 'flex-start',
                      boxSizing: 'border-box'
                    }}
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <CloneIcon style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />}
                    <span style={{ whiteSpace: 'nowrap' }}>{countySelector.cloneButton.label}</span>
                  </button>
                </div>
              </div>
            </div>

            </div>

            {/* Basic Information */}
            <div ref={basicInfoRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 16 : isTablet ? 17 : 18, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 4 }}>Basic Information</h2>
                  <p style={{ fontSize: isMobile ? 12 : 13, color: '#64748B', margin: 0 }}>Jurisdiction details and settings</p>
                </div>
                <button 
                  onClick={() => {
                    if (isEditingBasicInfo) {
                      handleSaveBasicInfo();
                    } else {
                      setIsEditingBasicInfo(true);
                    }
                  }}
                  disabled={saving}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '6px 12px', 
                    borderRadius: 6, 
                    border: '1px solid #E2E8F0', 
                    backgroundColor: isEditingBasicInfo ? '#2563EB' : '#FFFFFF', 
                    fontSize: 12, 
                    fontWeight: 500, 
                    color: isEditingBasicInfo ? '#FFFFFF' : '#64748B', 
                    cursor: saving ? 'not-allowed' : 'pointer' 
                  }}
                >
                   {saving ? <Loader2 size={14} className="animate-spin" /> : isEditingBasicInfo ? <Save size={14} /> : <Edit size={14} />} 
                   {isEditingBasicInfo ? 'Save' : 'Edit'}
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>Jurisdiction Name</label>
                  <input 
                    type="text" 
                    value={jurisdictionName} 
                    onChange={(e) => setJurisdictionName(e.target.value)}
                    disabled={!isEditingBasicInfo}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box', backgroundColor: isEditingBasicInfo ? '#FFFFFF' : '#F8FAFC' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>State Code</label>
                  <input 
                    type="text" 
                    value={stateCode} 
                    onChange={(e) => setStateCode(e.target.value)}
                    disabled={!isEditingBasicInfo}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box', backgroundColor: isEditingBasicInfo ? '#FFFFFF' : '#F8FAFC' }} 
                  />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>FIPS Code</label>
                   <input 
                     type="text" 
                     placeholder="e.g. 12086" 
                     value={fipsCode}
                     onChange={(e) => setFipsCode(e.target.value)}
                     disabled={!isEditingBasicInfo}
                     style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box', backgroundColor: isEditingBasicInfo ? '#FFFFFF' : '#F8FAFC' }} 
                   />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>Time Zone</label>
                   <select 
                     value={timeZone}
                     onChange={(e) => setTimeZone(e.target.value)}
                     disabled={!isEditingBasicInfo}
                     style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box', backgroundColor: isEditingBasicInfo ? '#FFFFFF' : '#F8FAFC' }}
                   >
                     <option>Eastern Time (US & Canada)</option>
                     <option>Central Time (US & Canada)</option>
                     <option>Mountain Time (US & Canada)</option>
                     <option>Pacific Time (US & Canada)</option>
                   </select>
                </div>
              </div>
            </div>

            {/* Redemption Rules */}
            <div ref={redemptionRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
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
                    {redemptionRules.title}
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
                    {redemptionRules.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: getSectionStatus('redemption').bg,
                    color: getSectionStatus('redemption').color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {getSectionStatus('redemption').label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, width: '100%', minWidth: 0 }}>
                {/* Statutory Interest Rate */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.statutoryInterestRate.label}
                  </label>
                  <p
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.statutoryInterestRate.description}
                  </p>
                  <input
                    type="text"
                    value={statutoryInterestRate}
                    onChange={(e) => setStatutoryInterestRate(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Interest Calculation Method */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 12,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.interestCalculationMethod.label}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                    {redemptionRules.fields.interestCalculationMethod.options.map((option: any) => (
                      <label
                        key={option.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 8 : 10,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="interestMethod"
                          value={option.value}
                          checked={interestMethod === option.value}
                          onChange={(e) => setInterestMethod(e.target.value)}
                          style={{
                            width: isMobile ? 16 : 18,
                            height: isMobile ? 16 : 18,
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <span
                          style={{
                            fontSize: isMobile ? 13 : 14,
                            color: '#0F172A',
                            wordBreak: 'break-word'
                          }}
                        >
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Redemption Period */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 6,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.redemptionPeriod.label}
                  </label>
                  <p
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: '#64748B',
                      marginTop: 0,
                      marginRight: 0,
                      marginBottom: 8,
                      marginLeft: 0,
                      wordBreak: 'break-word'
                    }}
                  >
                    {redemptionRules.fields.redemptionPeriod.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 8 : 12, width: '100%' }}>
                    <input
                      type="text"
                      value={redemptionPeriod}
                      onChange={(e) => setRedemptionPeriod(e.target.value)}
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: isMobile ? '100%' : 200,
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span
                      style={{
                        fontSize: isMobile ? 12 : 13,
                        color: '#64748B',
                        whiteSpace: isMobile ? 'normal' : 'nowrap'
                      }}
                    >
                      {redemptionRules.fields.redemptionPeriod.fromLabel}
                    </span>
                    <input
                      type="text"
                      defaultValue={redemptionRules.fields.redemptionPeriod.auctionDate}
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: isMobile ? '100%' : 120,
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        fontSize: isMobile ? 13 : 14,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Include Expenses */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: isMobile ? 12 : 16,
                      gap: 12
                    }}
                  >
                    <label
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        color: '#0F172A',
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {redemptionRules.fields.includeExpenses.label}
                    </label>
                    <button
                      onClick={() => setIncludeExpenses(!includeExpenses)}
                      style={{
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 22 : 24,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: includeExpenses ? '#2563EB' : '#E2E8F0',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: isMobile ? 18 : 20,
                          height: isMobile ? 18 : 20,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: 2,
                          left: includeExpenses ? (isMobile ? 20 : 22) : 2,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </button>
                  </div>

                  {/* Included Categories */}
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: isMobile ? 12 : 13,
                        fontWeight: 500,
                        color: '#64748B',
                        marginBottom: 12,
                        wordBreak: 'break-word'
                      }}
                    >
                      {redemptionRules.fields.includedCategories.label}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 10 }}>
                      {redemptionRules.fields.includedCategories.options.map((option: any) => (
                        <label
                          key={option.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 8 : 10,
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={includedCategories[option.label]}
                            onChange={(e) =>
                              setIncludedCategories((prev) => ({
                                ...prev,
                                [option.label]: e.target.checked
                              }))
                            }
                            style={{
                              width: isMobile ? 16 : 18,
                              height: isMobile ? 16 : 18,
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          />
                          <span
                            style={{
                              fontSize: isMobile ? 13 : 14,
                              color: '#0F172A',
                              wordBreak: 'break-word'
                            }}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, justifyContent: 'flex-end', marginTop: 8, width: '100%' }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {redemptionRules.actions.cancel}
                  </button>
                  <button
                    onClick={handleSaveRedemptionRules}
                    disabled={saving}
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: saving ? '#94A3B8' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    {redemptionRules.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Barment Rules */}
            <div ref={barmentRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
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
                    {barmentRules.title}
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
                    {barmentRules.subtitle}
                  </p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: barmentRules.status.bg,
                    color: barmentRules.status.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {barmentRules.status.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 18 : 20, width: '100%', minWidth: 0 }}>
                {/* Barment Period */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.barmentPeriod.label}
                  </label>
                  <input
                    type="text"
                    placeholder={barmentRules.fields.barmentPeriod.placeholder}
                    value={barmentPeriod}
                    onChange={(e) => setBarmentPeriod(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Send-By Deadline */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.sendByDeadline.label}
                  </label>
                  <input
                    type="text"
                    defaultValue={barmentRules.fields.sendByDeadline.value}
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 200,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Notice Required */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <label
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        fontWeight: 500,
                        color: '#0F172A',
                        cursor: 'pointer',
                        flex: 1,
                        minWidth: 0,
                        wordBreak: 'break-word'
                      }}
                    >
                      {barmentRules.fields.noticeRequired.label}
                    </label>
                    <button
                      onClick={() => setNoticeRequired(!noticeRequired)}
                      style={{
                        width: isMobile ? 40 : 44,
                        height: isMobile ? 22 : 24,
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: noticeRequired ? '#2563EB' : '#E2E8F0',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: isMobile ? 18 : 20,
                          height: isMobile ? 18 : 20,
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          position: 'absolute',
                          top: 2,
                          left: noticeRequired ? (isMobile ? 20 : 22) : 2,
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Statutory Template */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#0F172A',
                      marginBottom: 8,
                      wordBreak: 'break-word'
                    }}
                  >
                    {barmentRules.fields.statutoryTemplate.label}
                  </label>
                  <select
                    style={{
                      width: '100%',
                      maxWidth: isMobile ? '100%' : 300,
                      padding: isMobile ? '8px 12px' : '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      color: '#64748B',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                    value={statutoryTemplate}
                    onChange={(e) => setStatutoryTemplate(e.target.value)}
                  >
                    <option value="" disabled>
                      {barmentRules.fields.statutoryTemplate.placeholder}
                    </option>
                    {templates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, justifyContent: 'flex-end', marginTop: 8, width: '100%' }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    {barmentRules.actions.cancel}
                  </button>
                  <button
                    onClick={handleSaveBarmentRules}
                    disabled={saving}
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: saving ? '#94A3B8' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    {barmentRules.actions.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Quiet Title Rules */}
            <div ref={quietTitleRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 16 : isTablet ? 17 : 18, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 4 }}>Quiet Title Rules</h2>
                  <p style={{ fontSize: isMobile ? 12 : 13, color: '#64748B', margin: 0 }}>Configure quiet title action parameters</p>
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 500,
                    backgroundColor: getSectionStatus('quiet_title').bg,
                    color: getSectionStatus('quiet_title').color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {getSectionStatus('quiet_title').label}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                 <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>Waiting Period (Days)</label>
                    <input 
                        type="number" 
                        value={quietTitleWaitingPeriod}
                        onChange={(e) => setQuietTitleWaitingPeriod(e.target.value)}
                        style={{ width: '100%', maxWidth: 200, padding: '10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} 
                    />
                 </div>
                 <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>Required Documents</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {Object.keys(quietTitleRequiredDocs).map(doc => (
                           <label key={doc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0F172A' }}>
                               <input 
                                   type="checkbox" 
                                   checked={quietTitleRequiredDocs[doc]}
                                   onChange={(e) => setQuietTitleRequiredDocs({ ...quietTitleRequiredDocs, [doc]: e.target.checked })}
                               /> 
                               {doc}
                           </label>
                       ))}
                    </div>
                 </div>
                 
                 {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, justifyContent: 'flex-end', marginTop: 8, width: '100%' }}>
                  <button
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuietTitleRules}
                    disabled={saving}
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: saving ? '#94A3B8' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      width: isMobile ? '100%' : 'auto',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {saving && <Loader2 className="animate-spin" size={16} />}
                    Save Quiet Title Rules
                  </button>
                </div>
              </div>
            </div>

            {/* Auction Schedules */}
            <div ref={auctionRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 16 : isTablet ? 17 : 18, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 4 }}>Auction Schedules</h2>
                  <p style={{ fontSize: isMobile ? 12 : 13, color: '#64748B', margin: 0 }}>Manage tax deed auction dates</p>
                </div>
                <button 
                  onClick={handleAddAuctionSchedule}
                  disabled={saving}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '6px 12px', 
                    borderRadius: 6, 
                    border: 'none', 
                    backgroundColor: saving ? '#94A3B8' : '#2563EB', 
                    fontSize: 12, 
                    fontWeight: 500, 
                    color: '#FFFFFF', 
                    cursor: saving ? 'not-allowed' : 'pointer' 
                  }}
                >
                   {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
                   Add Schedule
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                       <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontWeight: 600 }}>Date</th>
                       <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontWeight: 600 }}>Type</th>
                       <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontWeight: 600 }}>Venue</th>
                       <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontWeight: 600 }}>Status</th>
                       <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontWeight: 600, width: 100 }}></th>
                     </tr>
                   </thead>
                   <tbody>
                     {auctionSchedules.length > 0 ? (
                       auctionSchedules.map((schedule: any) => (
                         <tr key={schedule.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                           <td style={{ padding: '12px', color: '#0F172A' }}>
                               {schedule.isEditing ? (
                                   <input 
                                       type="date" 
                                       value={schedule.date} 
                                       onChange={(e) => handleUpdateAuctionScheduleField(schedule.id, 'date', e.target.value)}
                                       style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                   />
                               ) : schedule.date}
                           </td>
                           <td style={{ padding: '12px', color: '#64748B' }}>
                               {schedule.isEditing ? (
                                   <select
                                       value={schedule.type}
                                       onChange={(e) => handleUpdateAuctionScheduleField(schedule.id, 'type', e.target.value)}
                                       style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                   >
                                       <option>Tax Deed</option>
                                       <option>Tax Lien</option>
                                       <option>Foreclosure</option>
                                   </select>
                               ) : schedule.type}
                           </td>
                           <td style={{ padding: '12px', color: '#64748B' }}>
                               {schedule.isEditing ? (
                                   <input 
                                       type="text" 
                                       value={schedule.venue} 
                                       onChange={(e) => handleUpdateAuctionScheduleField(schedule.id, 'venue', e.target.value)}
                                       style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                   />
                               ) : schedule.venue}
                           </td>
                           <td style={{ padding: '12px' }}>
                               {schedule.isEditing ? (
                                   <select
                                       value={schedule.status}
                                       onChange={(e) => handleUpdateAuctionScheduleField(schedule.id, 'status', e.target.value)}
                                       style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                   >
                                       <option>Scheduled</option>
                                       <option>Completed</option>
                                       <option>Cancelled</option>
                                   </select>
                               ) : (
                                   <span style={{ padding: '2px 8px', borderRadius: 999, backgroundColor: '#EFF6FF', color: '#1E3A5F', fontSize: 11 }}>{schedule.status}</span>
                               )}
                           </td>
                           <td style={{ padding: '12px' }}>
                               {schedule.isEditing ? (
                                 <div style={{ display: 'flex', gap: 6 }}>
                                   <button
                                     onClick={() => handleSaveAuctionSchedule(schedule.id)}
                                     style={{
                                       display: 'inline-flex',
                                       alignItems: 'center',
                                       padding: '6px',
                                       borderRadius: 6,
                                       border: 'none',
                                       backgroundColor: '#2563EB',
                                       color: '#FFFFFF',
                                       cursor: 'pointer'
                                     }}
                                     title="Save"
                                   >
                                     <Save size={14} />
                                   </button>
                                   <button
                                     onClick={() => handleCancelEditAuctionSchedule(schedule.id)}
                                     style={{
                                       display: 'inline-flex',
                                       alignItems: 'center',
                                       padding: '6px',
                                       borderRadius: 6,
                                       border: '1px solid #E2E8F0',
                                       backgroundColor: '#FFFFFF',
                                       color: '#64748B',
                                       cursor: 'pointer'
                                  }}
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                               ) : (
                                 <button
                                   onClick={() => handleEditAuctionSchedule(schedule.id)}
                                   style={{
                                     display: 'inline-flex',
                                     alignItems: 'center',
                                     gap: 6,
                                     padding: isMobile ? '5px 10px' : '6px 12px',
                                     borderRadius: 6,
                                     border: '1px solid #E2E8F0',
                                     backgroundColor: '#FFFFFF',
                                     color: '#64748B',
                                     fontSize: isMobile ? 11 : 12,
                                     fontWeight: 500,
                                     cursor: 'pointer',
                                     whiteSpace: 'nowrap'
                                   }}
                                 >
                                   <Edit style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                                   Edit
                                 </button>
                               )}
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={5} style={{ padding: '12px', textAlign: 'center', color: '#64748B' }}>No auction schedules found.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
              </div>
            </div>

            {/* Statutory Templates */}
            <div ref={templatesRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: isMobile ? 16 : isTablet ? 17 : 18, fontWeight: 600, color: '#0F172A', marginTop: 0, marginBottom: 4 }}>{statutoryTemplates.title}</h2>
                  <p style={{ fontSize: isMobile ? 12 : 13, color: '#64748B', margin: 0 }}>{statutoryTemplates.subtitle}</p>
                </div>
                <button 
                  onClick={handleAddTemplate}
                  disabled={saving}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '6px 12px', 
                    borderRadius: 6, 
                    border: 'none', 
                    backgroundColor: saving ? '#94A3B8' : '#2563EB', 
                    fontSize: 12, 
                    fontWeight: 500, 
                    color: '#FFFFFF', 
                    cursor: saving ? 'not-allowed' : 'pointer' 
                  }}
                >
                   {saving ? <Loader2 size={14} className="animate-spin" /> : <AddTemplateIcon size={14} />} 
                   {statutoryTemplates.addButton.label}
                </button>
              </div>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 600 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {statutoryTemplates.table.headers.map((header: string) => (
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
                    {templates.length > 0 ? (
                      templates.map((template: any) => (
                        <tr key={template.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                            {template.isEditing ? (
                              <input 
                                type="text" 
                                value={template.name} 
                                onChange={(e) => handleUpdateTemplateField(template.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                placeholder="Template Name"
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={16} color="#2563EB" />
                                <span>{template.name}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {template.isEditing ? (
                              <select 
                                value={template.type} 
                                onChange={(e) => handleUpdateTemplateField(template.id, 'type', e.target.value)}
                                style={{ padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                              >
                                <option>Notice</option>
                                <option>Affidavit</option>
                                <option>Filing</option>
                                <option>Letter</option>
                              </select>
                            ) : (
                              template.type
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                             {template.updatedAt}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            {template.isEditing ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleEditContent(template.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    cursor: 'pointer'
                                  }}
                                  title="Edit Content"
                                >
                                  <FileText size={14} />
                                </button>
                                <button
                                  onClick={() => handleSaveTemplate(template.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    cursor: 'pointer'
                                  }}
                                  title="Save"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => handleCancelEditTemplate(template.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    cursor: 'pointer'
                                  }}
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleEditTemplate(template.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: isMobile ? '5px 10px' : '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    fontSize: isMobile ? 11 : 12,
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit size={isMobile ? 12 : 14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handlePreviewTemplate(template.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: isMobile ? '5px 10px' : '6px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    fontSize: isMobile ? 11 : 12,
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Eye size={isMobile ? 12 : 14} />
                                  Preview
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>
                           No templates found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Local Fees */}
            <div ref={feesRef} style={{ ...cardStyle, width: '100%', minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'flex-start',
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
                    {localFees.title}
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
                    {localFees.subtitle}
                  </p>
                </div>
                <button
                  onClick={handleAddFee}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: isMobile ? '8px 16px' : '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: saving ? '#94A3B8' : '#2563EB',
                    color: '#FFFFFF',
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <AddFeeIcon style={{ width: isMobile ? 14 : 16, height: isMobile ? 14 : 16, flexShrink: 0 }} />}
                  <span style={{ whiteSpace: 'nowrap' }}>{localFees.addButton.label}</span>
                </button>
              </div>

              {/* Fees Table */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 12 : 13, minWidth: isMobileOrTablet ? 600 : 'auto' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {localFees.table.headers.map((header: string) => (
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
                    {fees.length > 0 ? (
                      fees.map((row: any) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', fontWeight: 500, wordBreak: 'break-word' }}>
                            {row.isEditing ? (
                              <input 
                                type="text" 
                                value={row.feeType} 
                                onChange={(e) => handleUpdateFeeField(row.id, 'feeType', e.target.value)}
                                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                placeholder="Fee Type"
                              />
                            ) : (
                              row.feeType
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {row.isEditing ? (
                              <input 
                                type="text" 
                                value={row.amount} 
                                onChange={(e) => handleUpdateFeeField(row.id, 'amount', e.target.value)}
                                style={{ width: 80, padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                                placeholder="$0.00"
                              />
                            ) : (
                              row.amount
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {row.isEditing ? (
                              <select 
                                value={row.category} 
                                onChange={(e) => handleUpdateFeeField(row.id, 'category', e.target.value)}
                                style={{ padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                              >
                                <option>General</option>
                                <option>Recording</option>
                                <option>Filing</option>
                                <option>Service</option>
                              </select>
                            ) : (
                              row.category
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {row.isEditing ? (
                              <input 
                                type="date" 
                                value={row.effectiveDate} 
                                onChange={(e) => handleUpdateFeeField(row.id, 'effectiveDate', e.target.value)}
                                style={{ width: 110, padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}
                              />
                            ) : (
                              row.effectiveDate
                            )}
                          </td>
                          <td style={{ padding: isMobile ? '12px' : '14px 16px' }}>
                            {row.isEditing ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleSaveFee(row.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    cursor: 'pointer'
                                  }}
                                  title="Save"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => handleCancelEditFee(row.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: '1px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#64748B',
                                    cursor: 'pointer'
                                  }}
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditFee(row.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: isMobile ? '5px 10px' : '6px 12px',
                                  borderRadius: 6,
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                  color: '#64748B',
                                  fontSize: isMobile ? 11 : 12,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <Edit style={{ width: isMobile ? 12 : 14, height: isMobile ? 12 : 14, flexShrink: 0 }} />
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: '12px', textAlign: 'center', color: '#64748B' }}>No fees configured.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            boxSizing: 'border-box'
          }}
          onClick={closePreview}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 600,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Preview: {previewTemplate.name}</h3>
              <button
                onClick={closePreview}
                style={{ border: 'none', backgroundColor: 'transparent', color: '#64748B', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 4, padding: 32, backgroundColor: '#FFFFFF', minHeight: 300 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{jurisdictionName}</h2>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{previewTemplate.type.toUpperCase()}</h3>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: '#334155' }}>
                  {previewTemplate.content && previewTemplate.content !== 'Enter template content here...' ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{previewTemplate.content}</div>
                  ) : (
                    <>
                      <p><strong>To:</strong> [Recipient Name]</p>
                      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>Re:</strong> Property Tax Matter - [Parcel ID]</p>
                      <br />
                      <p>NOTICE IS HEREBY GIVEN regarding the property located in {jurisdictionName}, {stateCode}. This is a formal {previewTemplate.type.toLowerCase()} pursuant to state statutes.</p>
                      <p>This document serves as a placeholder for the actual template content. In a production environment, this would display the rendered PDF or document template populated with sample data.</p>
                      <br />
                      <br />
                      <p>Sincerely,</p>
                      <br />
                      <p>[Signature]</p>
                      <p>Tax Commissioner / Sheriff</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closePreview}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <FileText size={16} />
                Download Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editContentTemplateId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            boxSizing: 'border-box'
          }}
          onClick={closeEditContent}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 600,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Edit Template Content</h3>
              <button
                onClick={closeEditContent}
                style={{ border: 'none', backgroundColor: 'transparent', color: '#64748B', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
               <textarea
                 style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    resize: 'none',
                    boxSizing: 'border-box'
                 }}
                 defaultValue={templates.find(t => t.id === editContentTemplateId)?.content || ''}
                 id="template-content-textarea"
               />
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeEditContent}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                    const content = (document.getElementById('template-content-textarea') as HTMLTextAreaElement).value;
                    saveContent(content);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Save size={16} />
                Save Content
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Location Modal */}
      {isAddLocationModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            boxSizing: 'border-box'
          }}
          onClick={closeAddLocationModal}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0F172A' }}>Add New Location</h3>
              <button
                onClick={closeAddLocationModal}
                style={{ border: 'none', backgroundColor: 'transparent', color: '#64748B', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>State Code</label>
                  <input
                    type="text"
                    value={newLocationState}
                    onChange={(e) => setNewLocationState(e.target.value.toUpperCase())}
                    placeholder="e.g. GA"
                    maxLength={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 6 }}>County Name</label>
                  <input
                    type="text"
                    value={newLocationCounty}
                    onChange={(e) => setNewLocationCounty(e.target.value)}
                    placeholder="e.g. Fulton"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
               </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeAddLocationModal}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAddLocation}
                disabled={saving || !newLocationState || !newLocationCounty}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: saving || !newLocationState || !newLocationCounty ? '#94A3B8' : '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: saving || !newLocationState || !newLocationCounty ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {saving && <Loader2 className="animate-spin" size={16} />}
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

