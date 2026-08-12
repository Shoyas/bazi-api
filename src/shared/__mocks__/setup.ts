import { vi } from 'vitest';
import { prismaMock } from './prisma';

vi.mock('../prisma', () => ({
  prisma: prismaMock,
}));
