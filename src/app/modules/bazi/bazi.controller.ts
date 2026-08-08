import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BaziService } from './bazi.service';
import { IBaziResponseData } from './bazi.interface';

const calculateBazi = catchAsync(async (req: Request, res: Response) => {
  const result = await BaziService.calculateBazi(req.body);

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
