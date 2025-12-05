import { Router, Request, Response } from 'express';
import { vehicleService } from '../services/vehicleService';
import { 
  CreateVehicleDTO, 
  UpdateVehicleDTO, 
  VehicleStatus,
  validateVin,
  decodeVin,
  VinLookupResult 
} from '@toyota-inventory/common';

const router = Router();

/**
 * GET /api/vehicles
 * Get all vehicles or filter by query params
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { make, model, year, minPrice, maxPrice, condition, status } = req.query;
    
    if (Object.keys(req.query).length > 0) {
      const vehicles = vehicleService.searchVehicles({
        make: make as string,
        model: model as string,
        year: year ? parseInt(year as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        condition: condition as string,
        status: status as VehicleStatus
      });
      return res.json(vehicles);
    }

    const vehicles = vehicleService.getAllVehicles();
    return res.json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

/**
 * GET /api/vehicles/status-count
 * Get count of vehicles by status
 */
router.get('/status-count', (_req: Request, res: Response) => {
  try {
    const counts = vehicleService.getCountByStatus();
    return res.json(counts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get vehicle counts' });
  }
});

/**
 * GET /api/vehicles/available
 * Get all available vehicles
 */
router.get('/available', (_req: Request, res: Response) => {
  try {
    const vehicles = vehicleService.getVehiclesByStatus(VehicleStatus.AVAILABLE);
    return res.json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch available vehicles' });
  }
});

/**
 * GET /api/vehicles/vin/:vin
 * Get vehicle by VIN - simple lookup
 */
router.get('/vin/:vin', (req: Request, res: Response) => {
  try {
    const vehicle = vehicleService.getVehicleByVin(req.params.vin);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

/**
 * POST /api/vehicles/vin/lookup
 * Lookup vehicle by VIN with validation and decoding
 * Returns vehicle if found in inventory, plus decoded VIN information
 */
router.post('/vin/lookup', (req: Request, res: Response) => {
  try {
    const { vin } = req.body;
    
    if (!vin) {
      return res.status(400).json({ error: 'VIN is required' });
    }

    // Validate the VIN
    const validation = validateVin(vin);
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid VIN',
        details: validation.error 
      });
    }

    // Decode VIN information
    const decoded = decodeVin(vin);

    // Search for vehicle in inventory
    const vehicle = vehicleService.getVehicleByVin(validation.normalizedVin || vin);
    
    const result: VinLookupResult = {
      found: !!vehicle,
      vehicle: vehicle ? {
        id: vehicle.id,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        condition: vehicle.condition,
        status: vehicle.status,
        price: vehicle.price,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        location: vehicle.location
      } : undefined,
      decoded: decoded || undefined
    };

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to lookup VIN' });
  }
});

/**
 * GET /api/vehicles/:id
 * Get vehicle by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const vehicle = vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

/**
 * POST /api/vehicles
 * Create a new vehicle
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const dto: CreateVehicleDTO = req.body;
    
    // Validate required fields
    if (!dto.vin || !dto.make || !dto.model || !dto.year || !dto.dealerId) {
      return res.status(400).json({ error: 'Missing required fields: vin, make, model, year, dealerId' });
    }

    // Check for duplicate VIN
    const existingVehicle = vehicleService.getVehicleByVin(dto.vin);
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle with this VIN already exists' });
    }

    const vehicle = vehicleService.createVehicle(dto);
    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

/**
 * PUT /api/vehicles/:id
 * Update a vehicle
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const dto: UpdateVehicleDTO = req.body;
    const vehicle = vehicleService.updateVehicle(req.params.id, dto);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = vehicleService.deleteVehicle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
