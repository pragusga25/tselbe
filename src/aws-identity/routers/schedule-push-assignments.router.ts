import { Router } from 'express';
import { schedulePushAssignmentsService } from '../services';
import { apiKeyMiddleware, asyncErrorHandler } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';

export const schedulePushAssignmentsRouter = Router();
schedulePushAssignmentsRouter.post(
  '/assignments.rollback',
  apiKeyMiddleware,
  asyncErrorHandler(async (_req: IAuthRequest, res) => {
    await schedulePushAssignmentsService(res);
    // res.on('finish', async () => {
    //   await schedulePushAssignmentsService();
    // });
    res.status(200).send({
      ok: true,
    });
  })
);
