/**
 * Inventory Types
 * Represents inventory counts and statistics
 */

export interface InventoryCount {
  id: string;
  dealerId: string;
  countDate: Date;
  totalVehicles: number;
  availableCount: number;
  reservedCount: number;
  soldCount: number;
  inTransitCount: number;
  maintenanceCount: number;
  newVehiclesCount: number;
  usedVehiclesCount: number;
  certifiedPreOwnedCount: number;
  countedBy: string;               // User ID who performed the count
  notes?: string;
  createdAt: Date;
}

export interface InventoryByModel {
  model: string;
  count: number;
  available: number;
  reserved: number;
  sold: number;
}

export interface InventoryByCondition {
  condition: string;
  count: number;
  totalValue: number;
  averagePrice: number;
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
  byCondition: InventoryByCondition[];
  byModel: InventoryByModel[];
  lastCountDate: Date;
}

export interface CreateInventoryCountDTO {
  dealerId: string;
  countedBy: string;
  notes?: string;
}
