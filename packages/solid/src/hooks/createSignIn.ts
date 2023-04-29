/* eslint-disable simple-import-sort/imports */
import type { SetActive, SetSession, SignInResource } from '@clerk/types';
import type { Accessor } from 'solid-js';
import { useClerkInstanceContext, useClientContext } from '../shared';

type UseSignInReturn =
  | { isLoaded: false; signIn: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signIn: SignInResource; setSession: SetSession; setActive: SetActive };

type CreateSignIn = () => Accessor<UseSignInReturn>;

export const createSignIn: CreateSignIn = () => {
  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientContext();
  return () => {
    const c = client();
    if (!c) {
      return { isLoaded: false, signIn: undefined, setSession: undefined, setActive: undefined };
    }
    return {
      isLoaded: true,
      signIn: c.signIn,
      setSession: isomorphicClerk().setSession,
      setActive: isomorphicClerk().setActive,
    };
  };
};
