// User & Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'worker' | 'investor';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Property Types
export interface Property {
  id: string;
  parcelId: string;
  address: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  status: PropertyStatus;
  workflowStage: WorkflowStage;
  purchasePrice?: number;
  currentValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyStatus = 
  | 'active'
  | 'pending'
  | 'redeemed'
  | 'barment'
  | 'quiet_title'
  | 'reo'
  | 'sold'
  | 'leased';

export type WorkflowStage = 
  | 'fifa_import'
  | 'parcel_research'
  | 'fifa_processing'
  | 'sheriff_workflow'
  | 'redemption_tracking'
  | 'barment'
  | 'quiet_title'
  | 'reo_disposition';

// Fund Types
export interface Fund {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  availableShares: number;
  minimumInvestment: number;
  expectedReturn: number;
  status: FundStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FundStatus = 'open' | 'closed' | 'fully_subscribed';

// Transaction Types
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  propertyId?: string;
  fundId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'buy' | 'sell' | 'lease' | 'deposit' | 'withdrawal' | 'distribution';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Component Props Types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Table Types
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

