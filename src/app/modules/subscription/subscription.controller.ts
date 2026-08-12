import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionService } from './subscription.service';

const getCheckoutUrl = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { plan, billingCycle } = req.body;

  const result = await SubscriptionService.getCheckoutUrl(userId, plan, billingCycle);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Checkout URL generated successfully',
    data: result,
  });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await SubscriptionService.cancelUserSubscription(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.subscription,
  });
});

const resumeSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await SubscriptionService.resumeUserSubscription(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.subscription,
  });
});

const getPortalUrl = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const result = await SubscriptionService.getCustomerPortalUrl(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer portal URL retrieved successfully',
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SubscriptionService.getMySubscription(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription retrieved successfully',
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getAllSubscriptions();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All subscriptions retrieved successfully',
    data: result,
  });
});

export const SubscriptionController = {
  getCheckoutUrl,
  cancelSubscription,
  resumeSubscription,
  getPortalUrl,
  getMySubscription,
  getAllSubscriptions,
};
