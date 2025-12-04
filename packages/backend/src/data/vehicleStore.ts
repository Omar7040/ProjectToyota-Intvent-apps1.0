import { 
  Vehicle, 
  VehicleStatus, 
  VehicleCondition 
} from '@toyota-inventory/common';

// In-memory data store for vehicles
export const vehicles: Map<string, Vehicle> = new Map();

// Initialize with sample data
const sampleVehicles: Vehicle[] = [
  {
    id: 'v1',
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    color: 'Silver',
    condition: VehicleCondition.NEW,
    status: VehicleStatus.AVAILABLE,
    price: 28500,
    mileage: 15,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    features: ['Backup Camera', 'Bluetooth', 'Apple CarPlay', 'Lane Assist'],
    images: [],
    dealerId: 'd1',
    location: 'Lot A-12',
    dateAdded: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'v2',
    vin: '2T1BURHE4JC984276',
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    color: 'White',
    condition: VehicleCondition.NEW,
    status: VehicleStatus.AVAILABLE,
    price: 24500,
    mileage: 8,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    features: ['Backup Camera', 'Bluetooth', 'USB Ports'],
    images: [],
    dealerId: 'd1',
    location: 'Lot A-15',
    dateAdded: new Date('2024-01-10'),
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'v3',
    vin: '5YFBURHE2LP123456',
    make: 'Toyota',
    model: 'RAV4',
    year: 2024,
    color: 'Blue',
    condition: VehicleCondition.NEW,
    status: VehicleStatus.RESERVED,
    price: 35200,
    mileage: 12,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    features: ['AWD', 'Panoramic Sunroof', 'Navigation', 'Heated Seats'],
    images: [],
    dealerId: 'd1',
    location: 'Lot B-03',
    dateAdded: new Date('2024-01-05'),
    lastUpdated: new Date('2024-01-18')
  },
  {
    id: 'v4',
    vin: 'JTDKARFU5L3123456',
    make: 'Toyota',
    model: 'Prius',
    year: 2023,
    color: 'Red',
    condition: VehicleCondition.CERTIFIED_PRE_OWNED,
    status: VehicleStatus.AVAILABLE,
    price: 29800,
    mileage: 12500,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    features: ['Navigation', 'JBL Audio', 'Safety Sense'],
    images: [],
    dealerId: 'd1',
    location: 'Lot C-07',
    dateAdded: new Date('2024-01-08'),
    lastUpdated: new Date('2024-01-08')
  },
  {
    id: 'v5',
    vin: '5TDKK3DC1NS123456',
    make: 'Toyota',
    model: 'Highlander',
    year: 2024,
    color: 'Black',
    condition: VehicleCondition.NEW,
    status: VehicleStatus.IN_TRANSIT,
    price: 45800,
    mileage: 5,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    features: ['Third Row Seating', 'AWD', 'Premium Package', 'Towing Package'],
    images: [],
    dealerId: 'd1',
    location: '',
    dateAdded: new Date('2024-01-20'),
    lastUpdated: new Date('2024-01-20')
  }
];

// Initialize vehicles map
sampleVehicles.forEach(vehicle => {
  vehicles.set(vehicle.id, vehicle);
});

export default vehicles;
