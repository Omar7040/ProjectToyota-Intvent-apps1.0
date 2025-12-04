import { 
  Customer, 
  CustomerStatus, 
  ContactPreference 
} from '@toyota-inventory/common';

// In-memory data store for customers
export const customers: Map<string, Customer> = new Map();

// Initialize with sample data
const sampleCustomers: Customer[] = [
  {
    id: 'c1',
    firstName: 'Juan',
    lastName: 'García',
    email: 'juan.garcia@email.com',
    phone: '555-0101',
    address: '123 Main St',
    city: 'San Juan',
    state: 'PR',
    zipCode: '00901',
    status: CustomerStatus.INTERESTED,
    contactPreference: ContactPreference.PHONE,
    interestedVehicles: ['v1', 'v3'],
    assignedSalesPersonId: 'u1',
    notes: 'Interested in family vehicles, prefers Toyota Camry or RAV4',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'c2',
    firstName: 'María',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '555-0102',
    address: '456 Oak Ave',
    city: 'Mayagüez',
    state: 'PR',
    zipCode: '00680',
    status: CustomerStatus.NEGOTIATING,
    contactPreference: ContactPreference.EMAIL,
    interestedVehicles: ['v3'],
    assignedSalesPersonId: 'u1',
    notes: 'Looking for a hybrid vehicle, budget around $35,000',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'c3',
    firstName: 'Carlos',
    lastName: 'Méndez',
    email: 'carlos.mendez@email.com',
    phone: '555-0103',
    address: '789 Pine Rd',
    city: 'Ponce',
    state: 'PR',
    zipCode: '00730',
    status: CustomerStatus.LEAD,
    contactPreference: ContactPreference.WHATSAPP,
    interestedVehicles: ['v2'],
    assignedSalesPersonId: 'u2',
    notes: 'First-time buyer, needs financing assistance',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'c4',
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@email.com',
    phone: '555-0104',
    address: '321 Cedar Ln',
    city: 'Carolina',
    state: 'PR',
    zipCode: '00982',
    status: CustomerStatus.PURCHASED,
    contactPreference: ContactPreference.SMS,
    interestedVehicles: [],
    assignedSalesPersonId: 'u1',
    notes: 'Purchased Toyota Corolla, excellent credit score',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'c5',
    firstName: 'Pedro',
    lastName: 'Santos',
    email: 'pedro.santos@email.com',
    phone: '555-0105',
    address: '654 Maple Dr',
    city: 'Bayamón',
    state: 'PR',
    zipCode: '00959',
    status: CustomerStatus.APPROVED,
    contactPreference: ContactPreference.PHONE,
    interestedVehicles: ['v5'],
    assignedSalesPersonId: 'u2',
    notes: 'Financing approved, waiting for Highlander arrival',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-19')
  }
];

// Initialize customers map
sampleCustomers.forEach(customer => {
  customers.set(customer.id, customer);
});

export default customers;
