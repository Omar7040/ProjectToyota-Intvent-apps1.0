/**
 * Customer Types
 * Represents customers and potential customers (leads)
 */

export enum CustomerStatus {
  LEAD = 'LEAD',                   // Potential customer, first contact
  INTERESTED = 'INTERESTED',       // Showed interest in a vehicle
  NEGOTIATING = 'NEGOTIATING',     // In negotiation process
  APPROVED = 'APPROVED',           // Financing approved
  PURCHASED = 'PURCHASED',         // Completed purchase
  LOST = 'LOST'                    // Lost lead/customer
}

export enum ContactPreference {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP'
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: CustomerStatus;
  contactPreference: ContactPreference;
  interestedVehicles: string[];    // Array of vehicle IDs
  assignedSalesPersonId?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPreference?: ContactPreference;
  interestedVehicles?: string[];
  assignedSalesPersonId?: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status?: CustomerStatus;
  contactPreference?: ContactPreference;
  interestedVehicles?: string[];
  assignedSalesPersonId?: string;
  notes?: string;
}
