import { AssignmentOperation } from '@prisma/client';
import { db } from '../../db';
import { describePermissionSet, sendEmailToRequester } from '../helper';
import { RejectAssignmentUserRequestData } from '../validations';

export const rejectAssignmentUserRequestService = async (
  data: RejectAssignmentUserRequestData,
  responderId: string
) => {
  await db.assignmentUserRequest.update({
    where: {
      id: data.id,
    },
    data: {
      status: 'REJECTED',
      responderId,
      responderNote: data.responderNote,
    },
  });

  const res = await db.assignmentUserRequest.findUnique({
    where: {
      id: data.id,
    },
    select: {
      permissionSetArn: true,
      requester: {
        select: {
          email: true,
          name: true,
          username: true,
        },
      },

      responder: {
        select: {
          name: true,
        },
      },
      status: true,
    },
  });

  const ps = await describePermissionSet(res?.permissionSetArn ?? '');

  if (res && ps) {
    let requesterEmail = res.requester.email;
    if (!requesterEmail || !requesterEmail.includes('@')) {
      if (res.requester.username.includes('@')) {
        requesterEmail = res.requester.username;
      } else {
        return;
      }
    }

    await sendEmailToRequester({
      approverName: res.responder?.name ?? '',
      groupName: res.requester?.name ?? '',
      operation: AssignmentOperation.ATTACH,
      permissionSetNames: [ps.name ?? ''],
      requesterEmail,
      status: res.status,
      requesterName: res.requester.name ?? '',
    }).catch(console.error);
  }
};
