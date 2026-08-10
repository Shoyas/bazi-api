import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BaziService } from './bazi.service';
import { IBaziResponseData } from './bazi.interface';
import { prisma } from '../../../shared/prisma';

const calculateBazi = catchAsync(async (req: Request, res: Response) => {
  const userId = req.apiKeyUser?.userId;
  
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
  }

  const result = await BaziService.calculateBazi(req.body, user);

  sendResponse<IBaziResponseData>(res, {
    statusCode: 200,
    success: true,
    message: 'BaZi calculated successfully.',
    data: result,
  });
});

export const BaziController = {
  calculateBazi,
};
