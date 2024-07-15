import { Response } from 'express';
import { db } from '../../db';
import { OperationFailedError } from '../errors';
import { pushAssignmentsService } from './push-assignments.service';
import { createLog } from '../../__shared__/utils';

export const schedulerRollbackAssignmentsService = async (
  name: string,
  res?: Response
) => {
  const assignmentsPromise = db.accountAssignment.findMany();

  const freezeTimePromise = db.freezeTime.findUnique({
    where: {
      name,
    },
  });

  const [dbAssignments, freezeTime] = await Promise.all([
    assignmentsPromise,
    freezeTimePromise,
  ]);

  if (dbAssignments.length === 0) {
    throw new OperationFailedError([
      'No account assignments found. Please pull account assignments first.',
    ]);
  }

  if (!freezeTime) {
    throw new OperationFailedError([
      `No freeze time found with name ${name}. Please create freeze time first.`,
    ]);
  }

  const executeEnd = async () => {
    await db.freezeTime.update({
      where: {
        name,
      },
      data: {
        isExecutedAtEnd: true,
      },
    });
  };

  if (res) {
    res.on('finish', async () => {
      await pushAssignmentsService();
      await executeEnd();
      await createLog('Sistem melakukan rollback');
    });
  } else {
    await pushAssignmentsService();
    await executeEnd();
    await createLog('Sistem melakukan rollback');
  }
};
