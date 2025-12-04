// Vehicle types
export {
  Vehicle,
  VehicleStatus,
  VehicleCondition,
  CreateVehicleDTO,
  UpdateVehicleDTO
} from './vehicle';

// Customer types
export {
  Customer,
  CustomerStatus,
  ContactPreference,
  CreateCustomerDTO,
  UpdateCustomerDTO
} from './customer';

// Sale types
export {
  Sale,
  SaleStatus,
  PaymentMethod,
  FinancingDetails,
  CreateSaleDTO,
  UpdateSaleDTO,
  SalesStatistics,
  LeadConversionStats
} from './sale';

// Inventory types
export {
  InventoryCount,
  InventoryByModel,
  InventoryByCondition,
  InventorySummary,
  CreateInventoryCountDTO
} from './inventory';

// User and Dealer types
export {
  User,
  UserRole,
  Dealer,
  CreateUserDTO,
  LoginDTO,
  AuthResponse
} from './user';
