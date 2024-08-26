import { Role } from '@prisma/client';
import { IJwtPayload } from '../../__shared__/interfaces';
import { db } from '../../db';
import { describeAllPermissionSetsInMap, listAccountsInMap } from '../helper';
import { HttpError } from '../../__shared__/errors';

export const listAssignmentUserRequestsService = async (
  currentUser: IJwtPayload
) => {
  const { id } = currentUser;
  const u = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (!u) {
    throw new HttpError(404, 'current-user/not-found', [
      'Current user not found',
    ]);
  }

  if (!u.isRoot && !u.isApprover) {
    throw new HttpError(403, 'auth/forbidden', [
      'You are not root or approver',
    ]);
  }

  const data = await db.assignmentUserRequest.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      requester: {
        select: {
          name: true,
        },
      },
      responder: {
        select: {
          name: true,
        },
      },
    },
  });

  const identity = await db.identityInstance.findFirst();

  const pss = await describeAllPermissionSetsInMap(identity?.instanceArn);
  const awsAcc = await listAccountsInMap();

  const result = data.map(
    ({ permissionSetArn, awsAccountId, responderId, requesterId, ...rest }) => {
      const permissionSetName = pss.get(permissionSetArn)?.name;
      const awsAccountName = awsAcc.get(awsAccountId)?.name;

      return {
        ...rest,
        permissionSetName,
        awsAccountName,
      };
    }
  );

  // result.sort((a, b) => {
  //   if (a.status === 'PENDING') return -1;
  //   if (b.status === 'PENDING') return 1;
  //   return 0;
  // });

  return { result };
};
