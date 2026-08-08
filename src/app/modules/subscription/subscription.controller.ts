import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionService } from './subscription.service';

const getCheckoutUrl = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { plan } = req.body;

  const result = await SubscriptionService.getCheckoutUrl(userId, plan);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Checkout URL generated successfully',
    data: result,
  });
});

export const SubscriptionController = {
  getCheckoutUrl,
};
