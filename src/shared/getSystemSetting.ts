import { prisma } from './prisma';

export const getSystemSetting = async (key: string, defaultValue: string): Promise<string> => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (setting) {
    return setting.value;
  }

  // If not found, we can optionally create the default one so it shows up in UI for admin
  try {
    await prisma.systemSetting.create({
      data: {
        key,
        value: defaultValue,
        description: `Auto-generated default for ${key}`,
      },
    });
  } catch (error) {
    // Ignore error if it was created concurrently
  }

  return defaultValue;
};
