import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;
export const prisma = prismaMock;
