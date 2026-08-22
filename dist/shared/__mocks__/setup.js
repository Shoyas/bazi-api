"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_1 = require("./prisma");
vitest_1.vi.mock('../prisma', () => ({
    prisma: prisma_1.prismaMock,
}));
