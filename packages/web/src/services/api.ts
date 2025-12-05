const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Vehicle API
export const vehicleApi = {
  getAll: () => fetchApi<Vehicle[]>('/vehicles'),
  getById: (id: string) => fetchApi<Vehicle>(`/vehicles/${id}`),
  getAvailable: () => fetchApi<Vehicle[]>('/vehicles/available'),
  getStatusCount: () => fetchApi<Record<string, number>>('/vehicles/status-count'),
  getByVin: (vin: string) => fetchApi<Vehicle>(`/vehicles/vin/${vin}`),
  lookupVin: (vin: string) => fetchApi<VinLookupResult>('/vehicles/vin/lookup', {
    method: 'POST',
    body: JSON.stringify({ vin }),
  }),
  create: (data: CreateVehicleDTO) => fetchApi<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateVehicleDTO) => fetchApi<Vehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<void>(`/vehicles/${id}`, { method: 'DELETE' }),
  search: (params: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return fetchApi<Vehicle[]>(`/vehicles?${searchParams.toString()}`);
  },
};

// Customer API
export const customerApi = {
  getAll: () => fetchApi<Customer[]>('/customers'),
  getById: (id: string) => fetchApi<Customer>(`/customers/${id}`),
  getLeads: () => fetchApi<Customer[]>('/customers/leads'),
  getConversionStats: () => fetchApi<LeadConversionStats>('/customers/conversion-stats'),
  create: (data: CreateCustomerDTO) => fetchApi<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateCustomerDTO) => fetchApi<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<void>(`/customers/${id}`, { method: 'DELETE' }),
  addInterestedVehicle: (customerId: string, vehicleId: string) => 
    fetchApi<Customer>(`/customers/${customerId}/interested-vehicle/${vehicleId}`, { method: 'POST' }),
};

// Sales API
export const salesApi = {
  getAll: () => fetchApi<Sale[]>('/sales'),
  getById: (id: string) => fetchApi<Sale>(`/sales/${id}`),
  getStatistics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return fetchApi<SalesStatistics>(`/sales/statistics${query ? '?' + query : ''}`);
  },
  getPipeline: () => fetchApi<Record<string, Sale[]>>('/sales/pipeline'),
  create: (data: CreateSaleDTO) => fetchApi<Sale>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateSaleDTO) => fetchApi<Sale>(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  complete: (id: string) => fetchApi<Sale>(`/sales/${id}/complete`, { method: 'PUT' }),
  cancel: (id: string) => fetchApi<Sale>(`/sales/${id}/cancel`, { method: 'PUT' }),
  delete: (id: string) => fetchApi<void>(`/sales/${id}`, { method: 'DELETE' }),
};

// Inventory API
export const inventoryApi = {
  getCounts: () => fetchApi<InventoryCount[]>('/inventory/counts'),
  getLatestCount: () => fetchApi<InventoryCount>('/inventory/counts/latest'),
  getSummary: (dealerId: string) => fetchApi<InventorySummary>(`/inventory/summary/${dealerId}`),
  getHistory: (dealerId: string, limit?: number) => 
    fetchApi<InventoryCount[]>(`/inventory/history/${dealerId}${limit ? '?limit=' + limit : ''}`),
  createCount: (data: CreateInventoryCountDTO) => fetchApi<InventoryCount>('/inventory/counts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

/**
 * API Response Types
 * 
 * Note: These types are intentionally defined here rather than imported from @toyota-inventory/common
 * because they represent the JSON API response format where dates are strings (ISO 8601)
 * rather than Date objects. This ensures type safety when working with API responses.
 */
export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  condition: string;
  status: string;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  features: string[];
  images: string[];
  dealerId: string;
  location: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface CreateVehicleDTO {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  condition: string;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  features?: string[];
  images?: string[];
  dealerId: string;
  location?: string;
}

export interface UpdateVehicleDTO {
  color?: string;
  condition?: string;
  status?: string;
  price?: number;
  mileage?: number;
  features?: string[];
  images?: string[];
  location?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  contactPreference: string;
  interestedVehicles: string[];
  assignedSalesPersonId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPreference?: string;
  interestedVehicles?: string[];
  assignedSalesPersonId?: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  vehicleId: string;
  customerId: string;
  salesPersonId: string;
  dealerId: string;
  status: string;
  paymentMethod: string;
  salePrice: number;
  discount?: number;
  tradeInValue?: number;
  downPayment?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateSaleDTO {
  vehicleId: string;
  customerId: string;
  salesPersonId: string;
  dealerId: string;
  paymentMethod: string;
  salePrice: number;
  discount?: number;
  tradeInValue?: number;
  downPayment?: number;
  notes?: string;
}

export interface UpdateSaleDTO {
  status?: string;
  paymentMethod?: string;
  salePrice?: number;
  discount?: number;
  notes?: string;
}

export interface SalesStatistics {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  cancelledSales: number;
  totalRevenue: number;
  averageSalePrice: number;
  conversionRate: number;
  periodStart: string;
  periodEnd: string;
}

export interface LeadConversionStats {
  totalLeads: number;
  convertedToSale: number;
  inProgress: number;
  lost: number;
  conversionRate: number;
}

export interface InventoryCount {
  id: string;
  dealerId: string;
  countDate: string;
  totalVehicles: number;
  availableCount: number;
  reservedCount: number;
  soldCount: number;
  inTransitCount: number;
  maintenanceCount: number;
  newVehiclesCount: number;
  usedVehiclesCount: number;
  certifiedPreOwnedCount: number;
  countedBy: string;
  notes?: string;
  createdAt: string;
}

export interface InventorySummary {
  dealerId: string;
  totalVehicles: number;
  totalValue: number;
  byStatus: {
    available: number;
    reserved: number;
    sold: number;
    inTransit: number;
    maintenance: number;
  };
  byCondition: Array<{
    condition: string;
    count: number;
    totalValue: number;
    averagePrice: number;
  }>;
  byModel: Array<{
    model: string;
    count: number;
    available: number;
    reserved: number;
    sold: number;
  }>;
  lastCountDate: string;
}

export interface CreateInventoryCountDTO {
  dealerId: string;
  countedBy: string;
  notes?: string;
}

/**
 * VIN Validation Result
 */
export interface VinValidationResult {
  isValid: boolean;
  error?: string;
  normalizedVin?: string;
}

/**
 * Decoded VIN information
 */
export interface VinDecodedInfo {
  vin: string;
  worldManufacturerIdentifier: string;
  vehicleDescriptorSection: string;
  checkDigit: string;
  modelYear: string;
  plantCode: string;
  sequentialNumber: string;
  decodedYear?: number;
  isNorthAmerican: boolean;
}

/**
 * VIN lookup result
 */
export interface VinLookupResult {
  found: boolean;
  vehicle?: {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    color: string;
    condition: string;
    status: string;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    location: string;
  };
  decoded?: VinDecodedInfo;
}
