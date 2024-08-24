import {
  describeAllPermissionSetsInMap,
  describeGroupsInMap,
  getUserMemberships,
  listAccountAssignmentsforPrincipal,
  listAccountsInMap,
} from '../helper';
import { db } from '../../db';
import { UserNotFoundError } from '../../user/errors';
import { PrincipalType } from '@prisma/client';

type Result = {
  principalId: string;
  principalType: PrincipalType;
  permissionSets: {
    arn: string;
    name: string | null;
  }[];
  awsAccountId: string;
  awsAccountName: string | null;
  principalDisplayName: string | null;
}[];

type ReturendAss = Awaited<
  ReturnType<typeof listAccountAssignmentsforPrincipal>
>;

export const listMyPermissionSetsService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || !user.principalUserId) {
    throw new UserNotFoundError();
  }

  const identityInstance = await db.identityInstance.findFirst();

  const memberships = await getUserMemberships(user.principalUserId);

  const groupAssignments: ReturendAss[] = [];

  for (const membership of memberships) {
    groupAssignments.push(
      await listAccountAssignmentsforPrincipal(
        membership.groupId,
        PrincipalType.GROUP,
        true,
        identityInstance?.instanceArn,
        300
      )
    );
  }

  groupAssignments.push(
    await listAccountAssignmentsforPrincipal(
      user.principalUserId,
      PrincipalType.USER,
      true,
      identityInstance?.instanceArn,
      0
    )
  );

  const awsAccountsMap = await listAccountsInMap();
  const permissionSetsMapPromise = describeAllPermissionSetsInMap(
    identityInstance?.instanceArn
  );
  const groupDetailsPromise = describeGroupsInMap(
    memberships.map((membership) => membership.groupId),
    identityInstance?.identityStoreId
  );

  const [permissionSetsMap, groupDetails] = await Promise.all([
    permissionSetsMapPromise,
    groupDetailsPromise,
  ]);

  const permissionSetsInPrincipalMap: Record<
    string,
    Result[0]['permissionSets']
  > = {};

  groupDetails.set(user.principalUserId, {
    displayName: user.name,
    id: user.principalUserId,
  });

  for (const assignments of groupAssignments) {
    for (const assignment of assignments) {
      const permissionSet = permissionSetsMap.get(assignment.permissionSetArn);
      const key = `${assignment.principalId}#${assignment.accountId}`;
      const psMap = permissionSetsInPrincipalMap[key];

      if (!psMap) {
        permissionSetsInPrincipalMap[key] = [];
      }

      if (permissionSet) {
        permissionSetsInPrincipalMap[key].push({
          arn: assignment.permissionSetArn,
          name: permissionSet.name,
        });
      }
    }
  }

  const result: Result = [];

  Object.entries(permissionSetsInPrincipalMap).forEach(([key, value]) => {
    const [principalId, awsAccountId] = key.split('#');
    const awsAccount = awsAccountsMap.get(awsAccountId);
    const principal = groupDetails.get(principalId);

    if (principal && awsAccount) {
      result.push({
        principalId,
        principalType:
          principalId === user.principalUserId
            ? PrincipalType.USER
            : PrincipalType.GROUP,
        permissionSets: value,
        awsAccountId,
        awsAccountName: awsAccount.name,
        principalDisplayName: principal.displayName,
      });
    }
  });

  return { result };
};
