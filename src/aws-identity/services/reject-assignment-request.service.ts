import { AssignmentRequestStatus } from '@prisma/client';
import { changeAssignmentStatusService } from './change-assignment-status.service';

export const rejectAssignmentRequestService = async (
  responderId: string,
  id: string,
  responderNote?: string
) => {
  await changeAssignmentStatusService(
    responderId,
    id,
    AssignmentRequestStatus.REJECTED,
    responderNote
  );
};
