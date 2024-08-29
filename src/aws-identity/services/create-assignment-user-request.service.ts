import { AssignmentOperation } from '@prisma/client';
import { db } from '../../db';
import { describePermissionSet, sendEmailToApprovers } from '../helper';
import { CreateAssignmentUserRequestData } from '../validations';
import { PermissionSetNotFoundError } from '../errors';

export const createAssignmentUserRequestService = async (
  data: CreateAssignmentUserRequestData,
  requesterId: string
) => {
  const { timeInHour } = data;

  const ps = await describePermissionSet(data.permissionSetArn);

  if (!ps) {
    throw new PermissionSetNotFoundError();
  }

  const me = await db.user.findUniqueOrThrow({
    where: {
      id: requesterId,
    },
    select: {
      principalUserId: true,
      name: true,
      email: true,
    },
  });

  await db.timeInHour.findUniqueOrThrow({
    where: {
      timeInHour,
    },
  });

  const d = await db.assignmentUserRequest.create({
    data: {
      ...data,
      requesterId,
      principalId: me.principalUserId!,
    },
  });

  const approvers = await db.user.findMany({
    where: {
      OR: [
        {
          isApprover: true,
        },
        {
          isRoot: true,
        },
      ],
    },
    select: {
      email: true,
      username: true,
    },
  });

  await sendEmailToApprovers({
    approverEmails: approvers
      .filter(({ email, username }) => {
        if (email && email.includes('@')) return true;
        if (username.includes('@')) return true;
        return false;
      })
      .map((approver) => {
        if (approver.email && approver.email.includes('@'))
          return approver.email;
        return approver.username;
      }) as string[],
    groupName: me?.name ?? 'Unknown User',
    operation: AssignmentOperation.ATTACH,
    permissionSetNames: [ps?.name ?? ''],
    requesterName: me.name,
    howLong: `${timeInHour}`,
    id: d.id,
    type: 'USER',
  }).catch(() => {});
};
