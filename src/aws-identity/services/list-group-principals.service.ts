import { HttpError } from '../../__shared__/errors';
import { db } from '../../db';
import { listGroups, listGroupsWithDetail, listUsersInGroups } from '../helper';
import { ListGroupPrincipalsData } from '../validations';

export const listGroupPrincipalsService = async ({
  mode,
}: ListGroupPrincipalsData) => {
  const identity = await db.identityInstance.findFirst();

  if (!identity) {
    throw new HttpError(500, 'Identity instance not found');
  }

  const data = await listGroupsWithDetail(
    identity.identityStoreId,
    mode === 'withMemberships'
  );

  return {
    result: data,
  };
  // const [groups, groupMemberships] = await Promise.all([
  //   listGroups(identity?.identityStoreId),
  //   mode === 'withMemberships'
  //     ? listUsersInGroups(identity?.identityStoreId)
  //     : null,
  // ]);

  // groups.sort((a, b) => {
  //   if (a.displayName && b.displayName) {
  //     return a.displayName.localeCompare(b.displayName);
  //   }

  //   return 0;
  // });

  // return {
  //   result: groups.map((group) => {
  //     const memberships = groupMemberships
  //       ? groupMemberships.get(group.id) || []
  //       : [];
  //     memberships.sort((a, b) => {
  //       if (a.userDisplayName && b.userDisplayName) {
  //         return a.userDisplayName.localeCompare(b.userDisplayName);
  //       }

  //       return 0;
  //     });

  //     return {
  //       ...group,
  //       memberships,
  //     };
  //   }),
  // };
};
