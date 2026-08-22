import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyService } from '../../../src/app/modules/apiKey/apiKey.service';
import { prismaMock } from '../../../src/shared/__mocks__/prisma';
import httpStatus from 'http-status';

vi.mock('../../../src/shared/prisma');

describe('ApiKeyService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('generateApiKey', () => {
    it('should generate an API key successfully for a free user if count is 0', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        password: 'hash',
        role: 'USER',
        isEmailVerified: true,
        verificationToken: null,
        isDeleted: false,
        status: 'active',
        country: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: { plan: 'FREE' } as any,
      } as any);

      prismaMock.apiKey.count.mockResolvedValue(0);

      prismaMock.apiKey.create.mockResolvedValue({
        id: 'key-1',
        prefix: 'bazi_abcd',
        keyHash: 'hash',
        isActive: true,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await ApiKeyService.generateApiKey('user-1');

      expect(result.apiKey).toBeDefined();
      expect(result.apiKey).toContain('bazi_');
      expect(result.prefix).toBe('bazi_abcd');
      expect(prismaMock.apiKey.create).toHaveBeenCalledOnce();
    });

    it('should throw error for free user if they already have 1 key', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'FREE' } as any,
      } as any);

      prismaMock.apiKey.count.mockResolvedValue(1);

      await expect(ApiKeyService.generateApiKey('user-1')).rejects.toThrowError(
        'Free users can only have 1 active API Key at a time.'
      );
    });

    it('should throw error for monthly user if they have 20 keys', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'MONTHLY' } as any,
      } as any);

      prismaMock.apiKey.count.mockResolvedValue(20);

      await expect(ApiKeyService.generateApiKey('user-1')).rejects.toThrowError(
        'Subscribed users can have a maximum of 20 active API Keys at a time.'
      );
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key successfully', async () => {
      prismaMock.apiKey.findFirst.mockResolvedValue({
        id: 'key-1',
        userId: 'user-1',
      } as any);

      prismaMock.apiKey.update.mockResolvedValue({
        id: 'key-1',
        isActive: false,
      } as any);

      await ApiKeyService.revokeApiKey('user-1', 'key-1');

      expect(prismaMock.apiKey.update).toHaveBeenCalledWith({
        where: { id: 'key-1' },
        data: { isActive: false },
      });
    });

    it('should throw error if key not found', async () => {
      prismaMock.apiKey.findFirst.mockResolvedValue(null);

      await expect(ApiKeyService.revokeApiKey('user-1', 'key-1')).rejects.toThrowError(
        'API Key not found'
      );
    });
  });
});
