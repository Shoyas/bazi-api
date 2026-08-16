import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CustomWebhookService } from './customWebhook.service';

const createWebhook = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CustomWebhookService.createWebhook(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Custom webhook endpoint registered successfully.',
    data: result,
  });
});

const getUserWebhooks = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CustomWebhookService.getUserWebhooks(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook endpoints retrieved successfully.',
    data: result,
  });
});

const getWebhookDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CustomWebhookService.getWebhookDetails(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook details retrieved successfully.',
    data: result,
  });
});

const updateWebhook = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CustomWebhookService.updateWebhook(userId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook endpoint updated successfully.',
    data: result,
  });
});

const deleteWebhook = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CustomWebhookService.deleteWebhook(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook endpoint deleted successfully.',
    data: result,
  });
});

const triggerTestWebhook = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CustomWebhookService.triggerTestWebhook(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Test ping event dispatched.',
    data: result,
  });
});

const getWebhookDeliveryLogs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CustomWebhookService.getWebhookDeliveryLogs(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook delivery logs retrieved successfully.',
    data: result,
  });
});

export const CustomWebhookController = {
  createWebhook,
  getUserWebhooks,
  getWebhookDetails,
  updateWebhook,
  deleteWebhook,
  triggerTestWebhook,
  getWebhookDeliveryLogs,
};
