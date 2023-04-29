import type { ActiveSessionResource, InitialState, OrganizationResource, Resources, UserResource } from '@clerk/types';
import type { MembershipRole } from '@clerk/types';

export const deriveState = (clerkLoaded: boolean, state: Resources, initialState: InitialState | undefined) => {
  if (!clerkLoaded && initialState) {
    return deriveFromSsrInitialState(clerkLoaded, initialState);
  }
  return deriveFromClientSideState(clerkLoaded, state);
};

const deriveFromSsrInitialState = (clerkLoaded: boolean, initialState: InitialState) => {
  const userId = initialState.userId;
  const user = initialState.user as unknown as UserResource;
  const sessionId = initialState.sessionId;
  const session = initialState.session as unknown as ActiveSessionResource;
  const organization = initialState.organization as unknown as OrganizationResource;
  const orgId = initialState.orgId;
  const orgRole = initialState.orgRole as MembershipRole;
  const orgSlug = initialState.orgSlug;
  const actor = initialState.actor;

  return {
    userId,
    user,
    sessionId,
    session,
    organization,
    orgId,
    orgRole,
    orgSlug,
    actor,
    lastOrganizationInvitation: null,
    lastOrganizationMember: null,
    clerkLoaded,
  };
};

const deriveFromClientSideState = (clerkLoaded: boolean, state: Resources) => {
  const userId: string | null | undefined = state.user ? state.user.id : state.user;
  const user = state.user;
  const sessionId: string | null | undefined = state.session ? state.session.id : state.session;
  const session = state.session;
  const actor = session?.actor;
  const organization = state.organization;
  const orgId: string | null | undefined = state.organization ? state.organization.id : state.organization;
  const orgSlug = organization?.slug;
  const membership = organization
    ? user?.organizationMemberships?.find(om => om.organization.id === orgId)
    : organization;
  const orgRole = membership ? membership.role : membership;

  const lastOrganizationInvitation = state.lastOrganizationInvitation;
  const lastOrganizationMember = state.lastOrganizationMember;

  return {
    userId,
    user,
    sessionId,
    session,
    organization,
    orgId,
    orgRole,
    orgSlug,
    actor,
    lastOrganizationInvitation,
    lastOrganizationMember,
    clerkLoaded,
  };
};
