import { Router, Request, Response } from 'express';
import { customerService } from '../services/customerService';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerStatus } from '@toyota-inventory/common';

const router = Router();

/**
 * GET /api/customers
 * Get all customers or filter by query params
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { name, email, phone, status } = req.query;
    
    if (Object.keys(req.query).length > 0) {
      const customers = customerService.searchCustomers({
        name: name as string,
        email: email as string,
        phone: phone as string,
        status: status as CustomerStatus
      });
      return res.json(customers);
    }

    const customers = customerService.getAllCustomers();
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

/**
 * GET /api/customers/leads
 * Get all leads (potential customers)
 */
router.get('/leads', (_req: Request, res: Response) => {
  try {
    const leads = customerService.getCustomersByStatus(CustomerStatus.LEAD);
    return res.json(leads);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

/**
 * GET /api/customers/conversion-stats
 * Get lead conversion statistics
 */
router.get('/conversion-stats', (_req: Request, res: Response) => {
  try {
    const stats = customerService.getLeadConversionStats();
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get conversion stats' });
  }
});

/**
 * GET /api/customers/sales-person/:salesPersonId
 * Get customers assigned to a sales person
 */
router.get('/sales-person/:salesPersonId', (req: Request, res: Response) => {
  try {
    const customers = customerService.getCustomersBySalesPerson(req.params.salesPersonId);
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

/**
 * GET /api/customers/:id
 * Get customer by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const customer = customerService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

/**
 * POST /api/customers
 * Create a new customer (lead)
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const dto: CreateCustomerDTO = req.body;
    
    // Validate required fields
    if (!dto.firstName || !dto.lastName || !dto.email || !dto.phone) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, phone' });
    }

    const customer = customerService.createCustomer(dto);
    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

/**
 * PUT /api/customers/:id
 * Update a customer
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const dto: UpdateCustomerDTO = req.body;
    const customer = customerService.updateCustomer(req.params.id, dto);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

/**
 * POST /api/customers/:id/interested-vehicle/:vehicleId
 * Add interested vehicle to customer
 */
router.post('/:id/interested-vehicle/:vehicleId', (req: Request, res: Response) => {
  try {
    const customer = customerService.addInterestedVehicle(req.params.id, req.params.vehicleId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(customer);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add interested vehicle' });
  }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = customerService.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
