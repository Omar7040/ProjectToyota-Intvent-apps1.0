import { v4 as uuidv4 } from 'uuid';
import { 
  Sale, 
  SaleStatus, 
  CreateSaleDTO, 
  UpdateSaleDTO,
  SalesStatistics,
  VehicleStatus
} from '@toyota-inventory/common';
import { sales } from '../data/saleStore';
import { vehicleService } from './vehicleService';
import { customerService } from './customerService';
import { CustomerStatus } from '@toyota-inventory/common';

export class SaleService {
  /**
   * Get all sales
   */
  getAllSales(): Sale[] {
    return Array.from(sales.values());
  }

  /**
   * Get sales by status
   */
  getSalesByStatus(status: SaleStatus): Sale[] {
    return Array.from(sales.values()).filter(s => s.status === status);
  }

  /**
   * Get sale by ID
   */
  getSaleById(id: string): Sale | undefined {
    return sales.get(id);
  }

  /**
   * Get sales by customer
   */
  getSalesByCustomer(customerId: string): Sale[] {
    return Array.from(sales.values()).filter(s => s.customerId === customerId);
  }

  /**
   * Get sales by sales person
   */
  getSalesBySalesPerson(salesPersonId: string): Sale[] {
    return Array.from(sales.values()).filter(s => s.salesPersonId === salesPersonId);
  }

  /**
   * Create a new sale
   */
  createSale(dto: CreateSaleDTO): Sale {
    const id = uuidv4();
    const now = new Date();
    
    const sale: Sale = {
      id,
      vehicleId: dto.vehicleId,
      customerId: dto.customerId,
      salesPersonId: dto.salesPersonId,
      dealerId: dto.dealerId,
      status: SaleStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      salePrice: dto.salePrice,
      discount: dto.discount,
      tradeInValue: dto.tradeInValue,
      tradeInVehicleId: dto.tradeInVehicleId,
      downPayment: dto.downPayment,
      notes: dto.notes || '',
      createdAt: now,
      updatedAt: now
    };

    // Update vehicle status to RESERVED
    vehicleService.updateVehicle(dto.vehicleId, { status: VehicleStatus.RESERVED });

    // Update customer status to NEGOTIATING
    customerService.updateCustomer(dto.customerId, { status: CustomerStatus.NEGOTIATING });

    sales.set(id, sale);
    return sale;
  }

  /**
   * Update a sale
   */
  updateSale(id: string, dto: UpdateSaleDTO): Sale | undefined {
    const sale = sales.get(id);
    if (!sale) {
      return undefined;
    }

    const updatedSale: Sale = {
      ...sale,
      ...dto,
      updatedAt: new Date()
    };

    // Handle status changes
    if (dto.status === SaleStatus.COMPLETED && sale.status !== SaleStatus.COMPLETED) {
      updatedSale.completedAt = new Date();
      // Update vehicle status to SOLD
      vehicleService.updateVehicle(sale.vehicleId, { status: VehicleStatus.SOLD });
      // Update customer status to PURCHASED
      customerService.updateCustomer(sale.customerId, { status: CustomerStatus.PURCHASED });
    } else if (dto.status === SaleStatus.CANCELLED && sale.status !== SaleStatus.CANCELLED) {
      // Return vehicle to AVAILABLE status
      vehicleService.updateVehicle(sale.vehicleId, { status: VehicleStatus.AVAILABLE });
      // Update customer status to LOST
      customerService.updateCustomer(sale.customerId, { status: CustomerStatus.LOST });
    }

    sales.set(id, updatedSale);
    return updatedSale;
  }

  /**
   * Delete a sale
   */
  deleteSale(id: string): boolean {
    return sales.delete(id);
  }

  /**
   * Get sales statistics
   */
  getSalesStatistics(startDate?: Date, endDate?: Date): SalesStatistics {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || now;

    const filteredSales = Array.from(sales.values()).filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });

    const completedSales = filteredSales.filter(s => s.status === SaleStatus.COMPLETED);
    const pendingSales = filteredSales.filter(s => 
      [SaleStatus.PENDING, SaleStatus.IN_PROGRESS, SaleStatus.FINANCING_PENDING, SaleStatus.FINANCING_APPROVED].includes(s.status)
    );
    const cancelledSales = filteredSales.filter(s => s.status === SaleStatus.CANCELLED);

    const totalRevenue = completedSales.reduce((sum, sale) => {
      const discount = sale.discount || 0;
      return sum + (sale.salePrice - discount);
    }, 0);

    const avgSalePrice = completedSales.length > 0 
      ? totalRevenue / completedSales.length 
      : 0;

    // Calculate conversion rate from leads
    const leadStats = customerService.getLeadConversionStats();

    return {
      totalSales: filteredSales.length,
      completedSales: completedSales.length,
      pendingSales: pendingSales.length,
      cancelledSales: cancelledSales.length,
      totalRevenue,
      averageSalePrice: avgSalePrice,
      conversionRate: leadStats.conversionRate,
      periodStart: start,
      periodEnd: end
    };
  }

  /**
   * Get sales pipeline (sales grouped by status)
   */
  getSalesPipeline(): Record<SaleStatus, Sale[]> {
    const pipeline: Record<SaleStatus, Sale[]> = {
      [SaleStatus.PENDING]: [],
      [SaleStatus.IN_PROGRESS]: [],
      [SaleStatus.FINANCING_PENDING]: [],
      [SaleStatus.FINANCING_APPROVED]: [],
      [SaleStatus.COMPLETED]: [],
      [SaleStatus.CANCELLED]: []
    };

    sales.forEach(sale => {
      pipeline[sale.status].push(sale);
    });

    return pipeline;
  }
}

export const saleService = new SaleService();
