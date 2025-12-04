import { Router, Request, Response } from 'express';
import { saleService } from '../services/saleService';
import { CreateSaleDTO, UpdateSaleDTO, SaleStatus } from '@toyota-inventory/common';

const router = Router();

/**
 * GET /api/sales
 * Get all sales
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const sales = saleService.getAllSales();
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/sales/statistics
 * Get sales statistics
 */
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = saleService.getSalesStatistics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get sales statistics' });
  }
});

/**
 * GET /api/sales/pipeline
 * Get sales pipeline (grouped by status)
 */
router.get('/pipeline', (_req: Request, res: Response) => {
  try {
    const pipeline = saleService.getSalesPipeline();
    return res.json(pipeline);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get sales pipeline' });
  }
});

/**
 * GET /api/sales/status/:status
 * Get sales by status
 */
router.get('/status/:status', (req: Request, res: Response) => {
  try {
    const status = req.params.status as SaleStatus;
    const sales = saleService.getSalesByStatus(status);
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/sales/customer/:customerId
 * Get sales by customer
 */
router.get('/customer/:customerId', (req: Request, res: Response) => {
  try {
    const sales = saleService.getSalesByCustomer(req.params.customerId);
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/sales/sales-person/:salesPersonId
 * Get sales by sales person
 */
router.get('/sales-person/:salesPersonId', (req: Request, res: Response) => {
  try {
    const sales = saleService.getSalesBySalesPerson(req.params.salesPersonId);
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

/**
 * GET /api/sales/:id
 * Get sale by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const sale = saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

/**
 * POST /api/sales
 * Create a new sale
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const dto: CreateSaleDTO = req.body;
    
    // Validate required fields
    if (!dto.vehicleId || !dto.customerId || !dto.salesPersonId || !dto.dealerId || !dto.paymentMethod || !dto.salePrice) {
      return res.status(400).json({ 
        error: 'Missing required fields: vehicleId, customerId, salesPersonId, dealerId, paymentMethod, salePrice' 
      });
    }

    const sale = saleService.createSale(dto);
    return res.status(201).json(sale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create sale' });
  }
});

/**
 * PUT /api/sales/:id
 * Update a sale
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const dto: UpdateSaleDTO = req.body;
    const sale = saleService.updateSale(req.params.id, dto);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update sale' });
  }
});

/**
 * PUT /api/sales/:id/complete
 * Mark a sale as completed
 */
router.put('/:id/complete', (req: Request, res: Response) => {
  try {
    const sale = saleService.updateSale(req.params.id, { status: SaleStatus.COMPLETED });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to complete sale' });
  }
});

/**
 * PUT /api/sales/:id/cancel
 * Cancel a sale
 */
router.put('/:id/cancel', (req: Request, res: Response) => {
  try {
    const sale = saleService.updateSale(req.params.id, { status: SaleStatus.CANCELLED });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    return res.json(sale);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel sale' });
  }
});

/**
 * DELETE /api/sales/:id
 * Delete a sale
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = saleService.deleteSale(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete sale' });
  }
});

export default router;
