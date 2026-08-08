import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ApiKeyService } from './apiKey.service';

const generateApiKey = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ApiKeyService.generateApiKey(userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'API Key generated successfully. Save it now, it will not be shown again.',
    data: result,
  });
});

const getApiKeys = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ApiKeyService.getApiKeys(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'API Keys retrieved successfully',
    data: result,
  });
});

const revokeApiKey = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const keyId = req.params.keyId as string;
  const result = await ApiKeyService.revokeApiKey(userId, keyId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'API Key revoked successfully',
    data: result,
  });
});

export const ApiKeyController = {
  generateApiKey,
  getApiKeys,
  revokeApiKey,
};
