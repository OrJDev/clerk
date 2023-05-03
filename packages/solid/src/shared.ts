import type {
  ActiveSessionResource,
  ClientResource,
  LoadedClerk,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import type { ActJWTClaim, MembershipRole } from '@clerk/types';
import { type Accessor, createContext, useContext } from 'solid-js';

interface ClerkContext {
  clerk: Accessor<LoadedClerk>;
  user: Accessor<UserResource | null | undefined>;
  client: Accessor<ClientResource | null | undefined>;
  session: Accessor<ActiveSessionResource | null | undefined>;
  organization: Accessor<{
    organization: OrganizationResource | null | undefined;
    lastOrganizationInvitation: OrganizationInvitationResource | null | undefined;
    lastOrganizationMember: OrganizationMembershipResource | null | undefined;
  }>;
  auth: Accessor<{
    userId: string | null | undefined;
    sessionId: string | null | undefined;
    actor: ActJWTClaim | null | undefined;
    orgId: string | null | undefined;
    orgRole: MembershipRole | null | undefined;
    orgSlug: string | null | undefined;
  }>;
}
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SingleClerkContext = createContext<Accessor<ClerkContext>>(null!);
export type ContextOf<T> = Accessor<{ value: T }> | undefined;

export const createUseHook = <K extends keyof ClerkContext>(name: K): (() => ClerkContext[K]) => {
  return () => {
    const ctx = useContext(SingleClerkContext);
    console.log(`ctx ${name}`, typeof ctx === 'function' ? ctx() : ctx);
    if (!ctx) {
      throw new Error(`${name} must be used within a ClerkProvider`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => ctx()[name]() as any;
  };
};

export const useClerkInstanceContext = createUseHook('clerk');
export const useUserContext = createUseHook('user');
export const useClientContext = createUseHook('client');
export const useSessionContext = createUseHook('session');
export const useOrganizationContext = createUseHook('organization');
export const useAuthContext = createUseHook('auth');
