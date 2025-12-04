/**
 * Vehicle/Car Types
 * Represents the inventory items (cars) in the dealer's inventory
 */

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',       // Available for sale
  RESERVED = 'RESERVED',         // Reserved by a customer
  SOLD = 'SOLD',                 // Sold to a customer
  IN_TRANSIT = 'IN_TRANSIT',     // In transit to dealer
  MAINTENANCE = 'MAINTENANCE'    // Under maintenance/preparation
}

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED_PRE_OWNED = 'CERTIFIED_PRE_OWNED'
}

export interface Vehicle {
  id: string;
  vin: string;                    // Vehicle Identification Number
  make: string;                   // e.g., "Toyota"
  model: string;                  // e.g., "Camry", "Corolla", "RAV4"
  year: number;
  color: string;
  condition: VehicleCondition;
  status: VehicleStatus;
  price: number;
  mileage: number;
  fuelType: string;               // e.g., "Gasoline", "Hybrid", "Electric"
  transmission: string;           // e.g., "Automatic", "Manual"
  features: string[];             // List of features
  images: string[];               // URLs to images
  dealerId: string;
  location: string;               // Location in the lot
  dateAdded: Date;
  lastUpdated: Date;
}

export interface CreateVehicleDTO {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  condition: VehicleCondition;
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
  condition?: VehicleCondition;
  status?: VehicleStatus;
  price?: number;
  mileage?: number;
  features?: string[];
  images?: string[];
  location?: string;
}
