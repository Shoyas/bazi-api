import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SystemSettingService } from './systemSetting.service';
import { SystemSetting } from '@prisma/client';

const getAllSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SystemSettingService.getAllSettings();

  sendResponse<SystemSetting[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System settings retrieved successfully',
    data: result,
  });
});

const updateSetting = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params;
  const result = await SystemSettingService.updateSetting(key as string, req.body);

  sendResponse<SystemSetting>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System setting updated successfully',
    data: result,
  });
});

export const SystemSettingController = {
  getAllSettings,
  updateSetting,
};
