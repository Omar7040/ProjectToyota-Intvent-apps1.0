/**
 * Sales Types
 * Represents the sales process and transactions
 */

export enum SaleStatus {
  PENDING = 'PENDING',             // Sale initiated
  IN_PROGRESS = 'IN_PROGRESS',     // Sale in progress
  FINANCING_PENDING = 'FINANCING_PENDING', // Waiting for financing approval
  FINANCING_APPROVED = 'FINANCING_APPROVED', // Financing approved
  COMPLETED = 'COMPLETED',         // Sale completed
  CANCELLED = 'CANCELLED'          // Sale cancelled
}

export enum PaymentMethod {
  CASH = 'CASH',
  FINANCING = 'FINANCING',
  LEASE = 'LEASE',
  TRADE_IN = 'TRADE_IN'            // Trade-in + payment
}

export interface Sale {
  id: string;
  vehicleId: string;
  customerId: string;
  salesPersonId: string;
  dealerId: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  salePrice: number;
  discount?: number;
  tradeInValue?: number;
  tradeInVehicleId?: string;
  downPayment?: number;
  financingDetails?: FinancingDetails;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface FinancingDetails {
  lender: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  approvalDate?: Date;
}

export interface CreateSaleDTO {
  vehicleId: string;
  customerId: string;
  salesPersonId: string;
  dealerId: string;
  paymentMethod: PaymentMethod;
  salePrice: number;
  discount?: number;
  tradeInValue?: number;
  tradeInVehicleId?: string;
  downPayment?: number;
  notes?: string;
}

export interface UpdateSaleDTO {
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  salePrice?: number;
  discount?: number;
  tradeInValue?: number;
  tradeInVehicleId?: string;
  downPayment?: number;
  financingDetails?: FinancingDetails;
  notes?: string;
}

/**
 * Sales Statistics for dashboard and reporting
 */
export interface SalesStatistics {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  cancelledSales: number;
  totalRevenue: number;
  averageSalePrice: number;
  conversionRate: number;          // Percentage of leads converted to sales
  periodStart: Date;
  periodEnd: Date;
}

export interface LeadConversionStats {
  totalLeads: number;
  convertedToSale: number;
  inProgress: number;
  lost: number;
  conversionRate: number;
}
