import { sendEmail } from '../../__shared__/mailer';
import { createLog } from '../../__shared__/utils';
import { db } from '../../db';
import { OperationFailedError } from '../errors';
import {
  describeAllPermissionSetsInMap,
  describeAwsAccount,
  describeGroup,
  sendEmailToApprovers,
} from '../helper';
import { RequestAssignmentData } from '../validations';

export const requestAssignmentService = async (data: RequestAssignmentData) => {
  const { requesterId, principalGroupId, awsAccountId, ...rest } = data;
  const requester = await db.user.findUnique({
    where: {
      id: requesterId,
    },
  });

  if (!requester) {
    throw new OperationFailedError(['Requester not found']);
  }

  const permissionSetsInMapPromise = describeAllPermissionSetsInMap();
  const detailGroupPromise = describeGroup(data.principalGroupId);
  const awsAccountPromise = describeAwsAccount(data.awsAccountId);

  const [permissionSetsInMap, detailGroup, awsAccount] = await Promise.all([
    permissionSetsInMapPromise,
    detailGroupPromise,
    awsAccountPromise,
  ]);

  const permissionSetsName = data.permissionSetArns.map((ps) => {
    const detail = permissionSetsInMap.get(ps)?.name ?? ps;

    return detail;
  });
  const awsAccountName = awsAccount?.name;
  const groupName = detailGroup?.displayName ?? 'Unkown Group';
  const requesterName = requester.name;
  const opsText = data.operation === 'ATTACH' ? 'memberi' : 'menghapus';

  const logMessage = `
    ${requesterName} mengajukan permintaan untuk ${opsText} akses ${permissionSetsName?.join(
    ', '
  )} pada grup ${groupName} di AWS akun ${awsAccountName}
  `;

  const result = await db.assignmentRequest.create({
    data: {
      ...rest,
      requestedAt: new Date(),
      principalId: principalGroupId,
      awsAccountId,
      requesterId,
    },
    select: {
      id: true,
    },
  });

  const approvers = await db.user.findMany({
    where: {
      isApprover: true,
    },
    select: {
      email: true,
    },
  });

  await createLog(logMessage);
  await sendEmailToApprovers({
    approverEmails: approvers
      .filter((app) => !!app.email)
      .map((approver) => approver.email) as string[],
    groupName,
    operation: data.operation,
    permissionSetNames: permissionSetsName,
    requesterName,
    id: result.id,
    type: 'GROUP',
  }).catch(() => {});

  return { result };
};
