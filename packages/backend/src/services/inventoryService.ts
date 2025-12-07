import { v4 as uuidv4 } from 'uuid';
import { 
  InventoryCount, 
  InventorySummary,
  InventoryByModel,
  InventoryByCondition,
  CreateInventoryCountDTO,
  VehicleStatus,
  VehicleCondition
} from '@toyota-inventory/common';
import { inventoryCounts } from '../data/inventoryStore';
import { vehicleService } from './vehicleService';

export class InventoryService {
  /**
   * Get all inventory counts
   */
  getAllInventoryCounts(): InventoryCount[] {
    return Array.from(inventoryCounts.values())
      .sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime());
  }

  /**
   * Get inventory count by ID
   */
  getInventoryCountById(id: string): InventoryCount | undefined {
    return inventoryCounts.get(id);
  }

  /**
   * Get latest inventory count
   */
  getLatestInventoryCount(): InventoryCount | undefined {
    const counts = this.getAllInventoryCounts();
    return counts.length > 0 ? counts[0] : undefined;
  }

  /**
   * Create a new inventory count (performs actual count)
   */
  createInventoryCount(dto: CreateInventoryCountDTO): InventoryCount {
    const id = uuidv4();
    const now = new Date();
    const vehicles = vehicleService.getAllVehicles();
    const statusCounts = vehicleService.getCountByStatus();

    const inventoryCount: InventoryCount = {
      id,
      dealerId: dto.dealerId,
      countDate: now,
      totalVehicles: vehicles.length,
      availableCount: statusCounts[VehicleStatus.AVAILABLE],
      reservedCount: statusCounts[VehicleStatus.RESERVED],
      soldCount: statusCounts[VehicleStatus.SOLD],
      inTransitCount: statusCounts[VehicleStatus.IN_TRANSIT],
      maintenanceCount: statusCounts[VehicleStatus.MAINTENANCE],
      newVehiclesCount: vehicles.filter(v => v.condition === VehicleCondition.NEW).length,
      usedVehiclesCount: vehicles.filter(v => v.condition === VehicleCondition.USED).length,
      certifiedPreOwnedCount: vehicles.filter(v => v.condition === VehicleCondition.CERTIFIED_PRE_OWNED).length,
      countedBy: dto.countedBy,
      notes: dto.notes,
      createdAt: now
    };

    inventoryCounts.set(id, inventoryCount);
    return inventoryCount;
  }

  /**
   * Get inventory summary (real-time)
   */
  getInventorySummary(dealerId: string): InventorySummary {
    const vehicles = vehicleService.getAllVehicles().filter(v => v.dealerId === dealerId);
    const statusCounts = vehicleService.getCountByStatus();
    const latestCount = this.getLatestInventoryCount();

    // Calculate total value
    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);

    // Group by model
    const byModelMap = new Map<string, InventoryByModel>();
    vehicles.forEach(vehicle => {
      const existing = byModelMap.get(vehicle.model);
      if (existing) {
        existing.count++;
        if (vehicle.status === VehicleStatus.AVAILABLE) existing.available++;
        if (vehicle.status === VehicleStatus.RESERVED) existing.reserved++;
        if (vehicle.status === VehicleStatus.SOLD) existing.sold++;
      } else {
        byModelMap.set(vehicle.model, {
          model: vehicle.model,
          count: 1,
          available: vehicle.status === VehicleStatus.AVAILABLE ? 1 : 0,
          reserved: vehicle.status === VehicleStatus.RESERVED ? 1 : 0,
          sold: vehicle.status === VehicleStatus.SOLD ? 1 : 0
        });
      }
    });

    // Group by condition
    const byConditionMap = new Map<string, { count: number; totalValue: number }>();
    vehicles.forEach(vehicle => {
      const existing = byConditionMap.get(vehicle.condition);
      if (existing) {
        existing.count++;
        existing.totalValue += vehicle.price;
      } else {
        byConditionMap.set(vehicle.condition, {
          count: 1,
          totalValue: vehicle.price
        });
      }
    });

    const byCondition: InventoryByCondition[] = Array.from(byConditionMap.entries()).map(
      ([condition, data]) => ({
        condition,
        count: data.count,
        totalValue: data.totalValue,
        averagePrice: data.totalValue / data.count
      })
    );

    return {
      dealerId,
      totalVehicles: vehicles.length,
      totalValue,
      byStatus: {
        available: statusCounts[VehicleStatus.AVAILABLE],
        reserved: statusCounts[VehicleStatus.RESERVED],
        sold: statusCounts[VehicleStatus.SOLD],
        inTransit: statusCounts[VehicleStatus.IN_TRANSIT],
        maintenance: statusCounts[VehicleStatus.MAINTENANCE]
      },
      byCondition,
      byModel: Array.from(byModelMap.values()),
      lastCountDate: latestCount?.countDate || new Date()
    };
  }

  /**
   * Get inventory history
   */
  getInventoryHistory(dealerId: string, limit: number = 10): InventoryCount[] {
    return Array.from(inventoryCounts.values())
      .filter(count => count.dealerId === dealerId)
      .sort((a, b) => new Date(b.countDate).getTime() - new Date(a.countDate).getTime())
      .slice(0, limit);
  }
}

export const inventoryService = new InventoryService();
