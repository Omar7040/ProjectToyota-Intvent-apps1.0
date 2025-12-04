import { InventoryCount } from '@toyota-inventory/common';

// In-memory data store for inventory counts
export const inventoryCounts: Map<string, InventoryCount> = new Map();

// Initialize with sample data
const sampleInventoryCounts: InventoryCount[] = [
  {
    id: 'ic1',
    dealerId: 'd1',
    countDate: new Date('2024-01-20'),
    totalVehicles: 45,
    availableCount: 28,
    reservedCount: 5,
    soldCount: 8,
    inTransitCount: 3,
    maintenanceCount: 1,
    newVehiclesCount: 35,
    usedVehiclesCount: 5,
    certifiedPreOwnedCount: 5,
    countedBy: 'u1',
    notes: 'Monthly inventory count completed',
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'ic2',
    dealerId: 'd1',
    countDate: new Date('2024-01-13'),
    totalVehicles: 42,
    availableCount: 25,
    reservedCount: 4,
    soldCount: 10,
    inTransitCount: 2,
    maintenanceCount: 1,
    newVehiclesCount: 32,
    usedVehiclesCount: 5,
    certifiedPreOwnedCount: 5,
    countedBy: 'u2',
    notes: 'Weekly count',
    createdAt: new Date('2024-01-13')
  },
  {
    id: 'ic3',
    dealerId: 'd1',
    countDate: new Date('2024-01-06'),
    totalVehicles: 48,
    availableCount: 32,
    reservedCount: 3,
    soldCount: 8,
    inTransitCount: 4,
    maintenanceCount: 1,
    newVehiclesCount: 38,
    usedVehiclesCount: 5,
    certifiedPreOwnedCount: 5,
    countedBy: 'u1',
    notes: 'Beginning of month count',
    createdAt: new Date('2024-01-06')
  }
];

// Initialize inventory counts map
sampleInventoryCounts.forEach(count => {
  inventoryCounts.set(count.id, count);
});

export default inventoryCounts;
