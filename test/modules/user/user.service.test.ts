import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../../src/app/modules/user/user.service';
import { prismaMock } from '../../../src/shared/__mocks__/prisma';
import { AppError } from '../../../src/errors/AppError';

vi.mock('../../../src/shared/prisma');

describe('UserService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUserDetails', () => {
    it('should return user details successfully', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'USER',
        isDeleted: false,
        status: 'active',
        subscription: { plan: 'FREE' },
        apiKeys: [],
        _count: { apiLogs: 0 },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await UserService.getUserDetails('user-1');
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledOnce();
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.getUserDetails('unknown')).rejects.toThrowError(
        'User not found'
      );
    });
  });

  describe('updateUserStatus', () => {
    it('should allow SUPER_ADMIN to block an ADMIN', async () => {
      const mockUser = { id: 'admin-1', role: 'ADMIN', status: 'active', password: 'hash' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      
      prismaMock.user.update.mockResolvedValue({ ...mockUser, status: 'blocked' } as any);

      const requestor = { userId: 'super-admin-1', role: 'SUPER_ADMIN' };
      
      const result = await UserService.updateUserStatus('admin-1', { status: 'blocked' }, requestor);
      
      expect(result.status).toBe('blocked');
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it('should NOT allow ADMIN to block SUPER_ADMIN', async () => {
      const mockUser = { id: 'super-admin-1', role: 'SUPER_ADMIN', status: 'active' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      
      const requestor = { userId: 'admin-1', role: 'ADMIN' };
      
      await expect(
        UserService.updateUserStatus('super-admin-1', { status: 'blocked' }, requestor)
      ).rejects.toThrowError('You cannot perform this action on a Super Admin');
    });
  });
});
