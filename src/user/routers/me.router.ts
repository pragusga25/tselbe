import { Router } from 'express';
import { asyncErrorHandler, authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { meService } from '../services';

export const meRouter = Router();
meRouter.get(
  '/me',
  authMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await meService(req.user!.id);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
