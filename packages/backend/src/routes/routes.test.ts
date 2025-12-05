import request from 'supertest';
import { app } from '../index';

describe('Vehicle API', () => {
  describe('GET /api/vehicles', () => {
    it('should return all vehicles', async () => {
      const response = await request(app).get('/api/vehicles');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/vehicles/available', () => {
    it('should return available vehicles', async () => {
      const response = await request(app).get('/api/vehicles/available');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((vehicle: { status: string }) => {
        expect(vehicle.status).toBe('AVAILABLE');
      });
    });
  });

  describe('GET /api/vehicles/status-count', () => {
    it('should return vehicle count by status', async () => {
      const response = await request(app).get('/api/vehicles/status-count');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('AVAILABLE');
      expect(response.body).toHaveProperty('RESERVED');
      expect(response.body).toHaveProperty('SOLD');
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return a vehicle by ID', async () => {
      const response = await request(app).get('/api/vehicles/v1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('v1');
      expect(response.body.make).toBe('Toyota');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app).get('/api/vehicles/nonexistent');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle', async () => {
      const newVehicle = {
        vin: 'TESTVIN123456789',
        make: 'Toyota',
        model: 'Tacoma',
        year: 2024,
        color: 'Gray',
        condition: 'NEW',
        price: 38000,
        mileage: 10,
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        dealerId: 'd1'
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(newVehicle);

      expect(response.status).toBe(201);
      expect(response.body.vin).toBe(newVehicle.vin);
      expect(response.body.model).toBe('Tacoma');
      expect(response.body.status).toBe('AVAILABLE');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({ make: 'Toyota' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/vehicles/vin/lookup', () => {
    it('should lookup a valid VIN and return decoded info', async () => {
      // Using a known VIN from the sample data - let's get one first
      const vehiclesResponse = await request(app).get('/api/vehicles');
      const firstVehicle = vehiclesResponse.body[0];
      
      const response = await request(app)
        .post('/api/vehicles/vin/lookup')
        .send({ vin: firstVehicle.vin });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('found');
      expect(response.body).toHaveProperty('decoded');
    });

    it('should return 400 for missing VIN', async () => {
      const response = await request(app)
        .post('/api/vehicles/vin/lookup')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('VIN is required');
    });

    it('should return 400 for invalid VIN format', async () => {
      const response = await request(app)
        .post('/api/vehicles/vin/lookup')
        .send({ vin: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid VIN');
    });

    it('should return decoded info even when vehicle not found', async () => {
      // Use a valid VIN that isn't in our inventory
      // Note: '11111111111111111' is valid because (1*8+1*7+...+1*2) % 11 = 1, and position 9 is '1'
      const response = await request(app)
        .post('/api/vehicles/vin/lookup')
        .send({ vin: '11111111111111111' });

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(false);
      expect(response.body.decoded).toBeDefined();
      expect(response.body.vehicle).toBeUndefined();
    });
  });
});

describe('Customer API', () => {
  describe('GET /api/customers', () => {
    it('should return all customers', async () => {
      const response = await request(app).get('/api/customers');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/customers/leads', () => {
    it('should return leads', async () => {
      const response = await request(app).get('/api/customers/leads');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/customers/conversion-stats', () => {
    it('should return conversion statistics', async () => {
      const response = await request(app).get('/api/customers/conversion-stats');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalLeads');
      expect(response.body).toHaveProperty('convertedToSale');
      expect(response.body).toHaveProperty('conversionRate');
    });
  });
});

describe('Sales API', () => {
  describe('GET /api/sales', () => {
    it('should return all sales', async () => {
      const response = await request(app).get('/api/sales');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/sales/statistics', () => {
    it('should return sales statistics', async () => {
      const response = await request(app).get('/api/sales/statistics');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('completedSales');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('conversionRate');
    });
  });

  describe('GET /api/sales/pipeline', () => {
    it('should return sales pipeline', async () => {
      const response = await request(app).get('/api/sales/pipeline');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('PENDING');
      expect(response.body).toHaveProperty('COMPLETED');
      expect(response.body).toHaveProperty('CANCELLED');
    });
  });
});

describe('Inventory API', () => {
  describe('GET /api/inventory/counts', () => {
    it('should return inventory counts', async () => {
      const response = await request(app).get('/api/inventory/counts');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/inventory/summary/:dealerId', () => {
    it('should return inventory summary', async () => {
      const response = await request(app).get('/api/inventory/summary/d1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalVehicles');
      expect(response.body).toHaveProperty('totalValue');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byModel');
    });
  });

  describe('POST /api/inventory/counts', () => {
    it('should create a new inventory count', async () => {
      const response = await request(app)
        .post('/api/inventory/counts')
        .send({ dealerId: 'd1', countedBy: 'u1', notes: 'Test count' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('totalVehicles');
      expect(response.body.dealerId).toBe('d1');
    });
  });
});

describe('Health Check', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });
});
