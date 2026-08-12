import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import { prismaMock } from '../../../src/shared/__mocks__/prisma';

vi.mock('../../../src/shared/prisma');

// Mock rate-limit-redis to bypass Redis connection issues during tests
vi.mock('rate-limit-redis', () => {
  return {
    RedisStore: class MockStore {
      init() {}
      async increment() { return { totalHits: 1, resetTime: new Date() }; }
      decrement() {}
      resetKey() {}
    },
    default: class MockStore {
      init() {}
      async increment() { return { totalHits: 1, resetTime: new Date() }; }
      decrement() {}
      resetKey() {}
    }
  };
});

describe('Bazi Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/v1/bazi/calculate', () => {
    it('should return 401 if no API key is provided', async () => {
      const response = await request(app)
        .post('/api/v1/bazi/calculate')
        .send({
          birthDate: '2004-08-12',
          birthTime: '12:00',
          gender: 'male',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('API Key is missing');
    });

    it('should return 401 if API key is invalid', async () => {
      prismaMock.apiKey.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/v1/bazi/calculate')
        .set('x-api-key', 'bazi_invalid_key_1234')
        .send({
          birthDate: '2004-08-12',
          birthTime: '12:00',
          gender: 'male',
        });

      if (response.status === 500) console.log(response.body);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid or revoked API Key');
    });

    it('should successfully calculate BaZi with a valid API Key', async () => {
      // Mock valid API key
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('bazi_valid_key_1234', 1);
      prismaMock.apiKey.findMany.mockResolvedValue([{
        id: 'key-1',
        userId: 'user-1',
        isActive: true,
        keyHash: hash,
        createdAt: new Date(),
        user: { subscription: { plan: 'FREE' } }
      } as any]);

      // Mock ApiLog creation
      prismaMock.apiLog.create.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/v1/bazi/calculate')
        .set('x-api-key', 'bazi_valid_key_1234')
        .send({
          birthDate: '2004-08-12',
          birthTime: '12:00',
          gender: 'male',
        });

      if (response.status === 500) console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.input.birthDate).toBe('2004-08-12');
      expect(response.body.data.solar.solarYear).toBe(2004);
    });

    it('should return 400 if validation fails (missing birthDate)', async () => {
      // Mock valid API key
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('bazi_valid_key_1234', 1);
      prismaMock.apiKey.findMany.mockResolvedValue([{
        id: 'key-1',
        userId: 'user-1',
        isActive: true,
        keyHash: hash,
        createdAt: new Date(),
        user: { subscription: { plan: 'FREE' } }
      } as any]);

      const response = await request(app)
        .post('/api/v1/bazi/calculate')
        .set('x-api-key', 'bazi_valid_key_1234')
        .send({
          birthTime: '12:00',
          gender: 'male',
        }); // missing birthDate

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      // Zod validation error format
      expect(response.body.message).toContain('expected string, received undefined');
    });
  });
});
