import { v4 as uuidv4 } from 'uuid';
import { 
  Vehicle, 
  VehicleStatus, 
  CreateVehicleDTO, 
  UpdateVehicleDTO 
} from '@toyota-inventory/common';
import { vehicles } from '../data/vehicleStore';

export class VehicleService {
  /**
   * Get all vehicles
   */
  getAllVehicles(): Vehicle[] {
    return Array.from(vehicles.values());
  }

  /**
   * Get vehicles by status
   */
  getVehiclesByStatus(status: VehicleStatus): Vehicle[] {
    return Array.from(vehicles.values()).filter(v => v.status === status);
  }

  /**
   * Get vehicle by ID
   */
  getVehicleById(id: string): Vehicle | undefined {
    return vehicles.get(id);
  }

  /**
   * Get vehicle by VIN
   */
  getVehicleByVin(vin: string): Vehicle | undefined {
    return Array.from(vehicles.values()).find(v => v.vin === vin);
  }

  /**
   * Create a new vehicle
   */
  createVehicle(dto: CreateVehicleDTO): Vehicle {
    const id = uuidv4();
    const now = new Date();
    
    const vehicle: Vehicle = {
      id,
      vin: dto.vin,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      condition: dto.condition,
      status: VehicleStatus.AVAILABLE,
      price: dto.price,
      mileage: dto.mileage,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      features: dto.features || [],
      images: dto.images || [],
      dealerId: dto.dealerId,
      location: dto.location || '',
      dateAdded: now,
      lastUpdated: now
    };

    vehicles.set(id, vehicle);
    return vehicle;
  }

  /**
   * Update a vehicle
   */
  updateVehicle(id: string, dto: UpdateVehicleDTO): Vehicle | undefined {
    const vehicle = vehicles.get(id);
    if (!vehicle) {
      return undefined;
    }

    const updatedVehicle: Vehicle = {
      ...vehicle,
      ...dto,
      lastUpdated: new Date()
    };

    vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  /**
   * Delete a vehicle
   */
  deleteVehicle(id: string): boolean {
    return vehicles.delete(id);
  }

  /**
   * Search vehicles
   */
  searchVehicles(query: {
    make?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: VehicleStatus;
  }): Vehicle[] {
    return Array.from(vehicles.values()).filter(vehicle => {
      if (query.make && !vehicle.make.toLowerCase().includes(query.make.toLowerCase())) {
        return false;
      }
      if (query.model && !vehicle.model.toLowerCase().includes(query.model.toLowerCase())) {
        return false;
      }
      if (query.year && vehicle.year !== query.year) {
        return false;
      }
      if (query.minPrice && vehicle.price < query.minPrice) {
        return false;
      }
      if (query.maxPrice && vehicle.price > query.maxPrice) {
        return false;
      }
      if (query.condition && vehicle.condition !== query.condition) {
        return false;
      }
      if (query.status && vehicle.status !== query.status) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get vehicle count by status
   */
  getCountByStatus(): Record<VehicleStatus, number> {
    const counts = {
      [VehicleStatus.AVAILABLE]: 0,
      [VehicleStatus.RESERVED]: 0,
      [VehicleStatus.SOLD]: 0,
      [VehicleStatus.IN_TRANSIT]: 0,
      [VehicleStatus.MAINTENANCE]: 0
    };

    vehicles.forEach(vehicle => {
      counts[vehicle.status]++;
    });

    return counts;
  }
}

export const vehicleService = new VehicleService();
