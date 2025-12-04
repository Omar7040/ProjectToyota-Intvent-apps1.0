import { Router, Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';
import { CreateInventoryCountDTO } from '@toyota-inventory/common';

const router = Router();

/**
 * GET /api/inventory/counts
 * Get all inventory counts
 */
router.get('/counts', (_req: Request, res: Response) => {
  try {
    const counts = inventoryService.getAllInventoryCounts();
    return res.json(counts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inventory counts' });
  }
});

/**
 * GET /api/inventory/counts/latest
 * Get the latest inventory count
 */
router.get('/counts/latest', (_req: Request, res: Response) => {
  try {
    const count = inventoryService.getLatestInventoryCount();
    if (!count) {
      return res.status(404).json({ error: 'No inventory counts found' });
    }
    return res.json(count);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch latest inventory count' });
  }
});

/**
 * GET /api/inventory/counts/:id
 * Get inventory count by ID
 */
router.get('/counts/:id', (req: Request, res: Response) => {
  try {
    const count = inventoryService.getInventoryCountById(req.params.id);
    if (!count) {
      return res.status(404).json({ error: 'Inventory count not found' });
    }
    return res.json(count);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inventory count' });
  }
});

/**
 * POST /api/inventory/counts
 * Create a new inventory count (perform count)
 */
router.post('/counts', (req: Request, res: Response) => {
  try {
    const dto: CreateInventoryCountDTO = req.body;
    
    // Validate required fields
    if (!dto.dealerId || !dto.countedBy) {
      return res.status(400).json({ error: 'Missing required fields: dealerId, countedBy' });
    }

    const count = inventoryService.createInventoryCount(dto);
    return res.status(201).json(count);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create inventory count' });
  }
});

/**
 * GET /api/inventory/summary/:dealerId
 * Get real-time inventory summary for a dealer
 */
router.get('/summary/:dealerId', (req: Request, res: Response) => {
  try {
    const summary = inventoryService.getInventorySummary(req.params.dealerId);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get inventory summary' });
  }
});

/**
 * GET /api/inventory/history/:dealerId
 * Get inventory count history for a dealer
 */
router.get('/history/:dealerId', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const history = inventoryService.getInventoryHistory(req.params.dealerId, limit);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get inventory history' });
  }
});

export default router;
