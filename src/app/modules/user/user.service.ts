import { prisma } from '../../../shared/prisma';
import { AppError } from '../../../errors/AppError';
import httpStatus from 'http-status';
import { IUpdateUserStatus, IBulkSoftDelete } from './user.interface';

const getAllUsers = async (query: any) => {
  const { page = 1, limit = 10, search, status, role, isDeleted = 'false' } = query;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (role) {
    where.role = role;
  }
  
  if (isDeleted === 'false') {
    where.isDeleted = false;
  } else if (isDeleted === 'true') {
    where.isDeleted = true;
  }

  const result = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      country: true,
      role: true,
      isEmailVerified: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  const total = await prisma.user.count({ where });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: result,
  };
};

const getUserDetails = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      subscription: true,
      apiKeys: {
        select: {
          id: true,
          prefix: true,
          isActive: true,
          createdAt: true,
        }
      },
      apiLogs: {
        take: 50, // Limit to 50 recent logs for performance
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Remove password before returning
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const updateUserStatus = async (
  id: string,
  payload: IUpdateUserStatus,
  requestor: { userId: string, role: string }
) => {
  const targetUser = await prisma.user.findUnique({ where: { id } });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Hierarchy check: ADMIN cannot modify SUPER_ADMIN
  if (requestor.role === 'ADMIN' && targetUser.role === 'SUPER_ADMIN') {
    throw new AppError(httpStatus.FORBIDDEN, 'You cannot perform this action on a Super Admin');
  }

  const result = await prisma.user.update({
    where: { id },
    data: { status: payload.status },
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const bulkSoftDelete = async (
  payload: IBulkSoftDelete,
  requestor: { userId: string, role: string }
) => {
  const { userIds } = payload;

  const usersToUpdate = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });

  if (usersToUpdate.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No users found');
  }

  // Hierarchy check for all target users
  if (requestor.role === 'ADMIN') {
    const hasSuperAdmin = usersToUpdate.some(u => u.role === 'SUPER_ADMIN');
    if (hasSuperAdmin) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You cannot perform soft delete on one or more Super Admins in the selection'
      );
    }
  }

  // Soft delete them
  await prisma.user.updateMany({
    where: {
      id: { in: userIds },
    },
    data: {
      isDeleted: true,
    },
  });

  return { message: `${usersToUpdate.length} users have been soft deleted.` };
};

export const UserService = {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  bulkSoftDelete,
};
