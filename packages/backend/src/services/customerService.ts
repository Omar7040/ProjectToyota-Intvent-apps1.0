import { v4 as uuidv4 } from 'uuid';
import { 
  Customer, 
  CustomerStatus, 
  CreateCustomerDTO, 
  UpdateCustomerDTO,
  ContactPreference,
  LeadConversionStats
} from '@toyota-inventory/common';
import { customers } from '../data/customerStore';

export class CustomerService {
  /**
   * Get all customers
   */
  getAllCustomers(): Customer[] {
    return Array.from(customers.values());
  }

  /**
   * Get customers by status
   */
  getCustomersByStatus(status: CustomerStatus): Customer[] {
    return Array.from(customers.values()).filter(c => c.status === status);
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Customer | undefined {
    return customers.get(id);
  }

  /**
   * Get customers by sales person
   */
  getCustomersBySalesPerson(salesPersonId: string): Customer[] {
    return Array.from(customers.values()).filter(
      c => c.assignedSalesPersonId === salesPersonId
    );
  }

  /**
   * Create a new customer
   */
  createCustomer(dto: CreateCustomerDTO): Customer {
    const id = uuidv4();
    const now = new Date();
    
    const customer: Customer = {
      id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      alternatePhone: dto.alternatePhone,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      zipCode: dto.zipCode,
      status: CustomerStatus.LEAD,
      contactPreference: dto.contactPreference || ContactPreference.PHONE,
      interestedVehicles: dto.interestedVehicles || [],
      assignedSalesPersonId: dto.assignedSalesPersonId,
      notes: dto.notes || '',
      createdAt: now,
      updatedAt: now
    };

    customers.set(id, customer);
    return customer;
  }

  /**
   * Update a customer
   */
  updateCustomer(id: string, dto: UpdateCustomerDTO): Customer | undefined {
    const customer = customers.get(id);
    if (!customer) {
      return undefined;
    }

    const updatedCustomer: Customer = {
      ...customer,
      ...dto,
      updatedAt: new Date()
    };

    customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): boolean {
    return customers.delete(id);
  }

  /**
   * Add interested vehicle to customer
   */
  addInterestedVehicle(customerId: string, vehicleId: string): Customer | undefined {
    const customer = customers.get(customerId);
    if (!customer) {
      return undefined;
    }

    if (!customer.interestedVehicles.includes(vehicleId)) {
      customer.interestedVehicles.push(vehicleId);
      customer.updatedAt = new Date();
      customers.set(customerId, customer);
    }

    return customer;
  }

  /**
   * Get lead conversion statistics
   */
  getLeadConversionStats(): LeadConversionStats {
    const allCustomers = Array.from(customers.values());
    const totalLeads = allCustomers.length;
    const convertedToSale = allCustomers.filter(
      c => c.status === CustomerStatus.PURCHASED
    ).length;
    const inProgress = allCustomers.filter(
      c => [
        CustomerStatus.INTERESTED, 
        CustomerStatus.NEGOTIATING, 
        CustomerStatus.APPROVED
      ].includes(c.status)
    ).length;
    const lost = allCustomers.filter(
      c => c.status === CustomerStatus.LOST
    ).length;

    return {
      totalLeads,
      convertedToSale,
      inProgress,
      lost,
      conversionRate: totalLeads > 0 ? (convertedToSale / totalLeads) * 100 : 0
    };
  }

  /**
   * Search customers
   */
  searchCustomers(query: {
    name?: string;
    email?: string;
    phone?: string;
    status?: CustomerStatus;
  }): Customer[] {
    return Array.from(customers.values()).filter(customer => {
      if (query.name) {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        if (!fullName.includes(query.name.toLowerCase())) {
          return false;
        }
      }
      if (query.email && !customer.email.toLowerCase().includes(query.email.toLowerCase())) {
        return false;
      }
      if (query.phone && !customer.phone.includes(query.phone)) {
        return false;
      }
      if (query.status && customer.status !== query.status) {
        return false;
      }
      return true;
    });
  }
}

export const customerService = new CustomerService();
