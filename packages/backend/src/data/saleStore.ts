import { 
  Sale, 
  SaleStatus, 
  PaymentMethod 
} from '@toyota-inventory/common';

// In-memory data store for sales
export const sales: Map<string, Sale> = new Map();

// Initialize with sample data
const sampleSales: Sale[] = [
  {
    id: 's1',
    vehicleId: 'v6', // A sold vehicle not in current inventory
    customerId: 'c4',
    salesPersonId: 'u1',
    dealerId: 'd1',
    status: SaleStatus.COMPLETED,
    paymentMethod: PaymentMethod.FINANCING,
    salePrice: 24500,
    discount: 500,
    downPayment: 5000,
    financingDetails: {
      lender: 'Toyota Financial Services',
      loanAmount: 19000,
      interestRate: 4.9,
      termMonths: 60,
      monthlyPayment: 357.50,
      approvalDate: new Date('2024-01-15')
    },
    notes: 'Smooth transaction, customer satisfied',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    completedAt: new Date('2024-01-20')
  },
  {
    id: 's2',
    vehicleId: 'v3',
    customerId: 'c2',
    salesPersonId: 'u1',
    dealerId: 'd1',
    status: SaleStatus.FINANCING_PENDING,
    paymentMethod: PaymentMethod.FINANCING,
    salePrice: 35200,
    discount: 700,
    downPayment: 7000,
    notes: 'Waiting for financing approval from TFS',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 's3',
    vehicleId: 'v5',
    customerId: 'c5',
    salesPersonId: 'u2',
    dealerId: 'd1',
    status: SaleStatus.IN_PROGRESS,
    paymentMethod: PaymentMethod.FINANCING,
    salePrice: 45800,
    discount: 1000,
    downPayment: 10000,
    financingDetails: {
      lender: 'Toyota Financial Services',
      loanAmount: 34800,
      interestRate: 5.5,
      termMonths: 72,
      monthlyPayment: 573.20,
      approvalDate: new Date('2024-01-19')
    },
    notes: 'Vehicle in transit, expected delivery next week',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 's4',
    vehicleId: 'v7', // Previous sale
    customerId: 'c6',
    salesPersonId: 'u2',
    dealerId: 'd1',
    status: SaleStatus.CANCELLED,
    paymentMethod: PaymentMethod.CASH,
    salePrice: 32000,
    notes: 'Customer changed mind, found better deal elsewhere',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12')
  }
];

// Initialize sales map
sampleSales.forEach(sale => {
  sales.set(sale.id, sale);
});

export default sales;
