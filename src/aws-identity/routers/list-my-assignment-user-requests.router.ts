import { Router } from 'express';

import { asyncErrorHandler, authMiddleware } from '../../__middlewares__';
import { IAuthRequest } from '../../__shared__/interfaces';
import { listMyAssignmentUserRequestsService } from '../services/list-my-assignment-user-requests.service';

export const listMyAssignmentUserRequestsRouter = Router();
listMyAssignmentUserRequestsRouter.get(
  '/assignment-user-requests.my-list',
  authMiddleware,
  asyncErrorHandler(async (req: IAuthRequest, res) => {
    const result = await listMyAssignmentUserRequestsService(req.user!);

    res.status(200).send({
      ok: true,
      ...result,
    });
  })
);
