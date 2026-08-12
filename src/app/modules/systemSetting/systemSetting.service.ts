import { SystemSetting } from '@prisma/client';
import { prisma } from '../../../shared/prisma';

const getAllSettings = async (): Promise<SystemSetting[]> => {
  const result = await prisma.systemSetting.findMany({
    orderBy: {
      key: 'asc'
    }
  });
  return result;
};

const updateSetting = async (
  key: string,
  payload: { value: string; description?: string }
): Promise<SystemSetting> => {
  const result = await prisma.systemSetting.upsert({
    where: {
      key,
    },
    update: {
      value: payload.value,
      ...(payload.description && { description: payload.description }),
    },
    create: {
      key,
      value: payload.value,
      description: payload.description,
    },
  });

  return result;
};

export const SystemSettingService = {
  getAllSettings,
  updateSetting,
};
