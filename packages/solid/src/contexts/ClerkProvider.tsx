/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientResource, InitialState, Resources } from '@clerk/types';
import { isLegacyFrontendApiKey, isPublishableKey } from '@clerk/utils';
import { type Accessor, type ParentComponent, createEffect, createSignal, on, onCleanup } from 'solid-js';

import IsomorphicClerk from '../isomorphicClerk';
import { SingleClerkContext } from '../shared';
import type { IsomorphicClerkOptions } from '../types';
import { __internal__setErrorThrowerOptions, errorThrower } from '../utils';
import { deriveState } from '../utils/deriveState';

__internal__setErrorThrowerOptions({
  packageName: '@clerk/clerk-solid',
});

export type ClerkContextProviderState = Resources;

export type ClerkProviderProps = IsomorphicClerkOptions & {
  initialState?: InitialState;
};

const ClerkProvider: ParentComponent<ClerkProviderProps> = props => {
  console.log(`#1 got here with ${JSON.stringify(props)}`);

  if (!props.Clerk) {
    if (!props.publishableKey && !props.frontendApi) {
      console.log(`throwing missing publishable key error with ${props.publishableKey} and ${props.frontendApi}`);
      errorThrower.throwMissingPublishableKeyError();
    } else if (props.publishableKey && !isPublishableKey(props.publishableKey)) {
      console.log(`throwing invalid publishable key error with ${props.publishableKey}`);
      errorThrower.throwInvalidPublishableKeyError({ key: props.publishableKey });
    } else if (props.publishableKey && props.frontendApi && !isLegacyFrontendApiKey((props as any).frontendApi)) {
      console.log(`throwing invalid frontend api error with ${(props as any).frontendApi}`);
      errorThrower.throwInvalidFrontendApiError({ key: (props as any).frontendApi });
    }
  }

  const thisClerk = createLoadedIsomorphicClerk(props);

  const [state, setState] = createSignal<ClerkContextProviderState>({
    client: thisClerk.isomorphicClerk().client as ClientResource,
    session: thisClerk.isomorphicClerk().session,
    user: thisClerk.isomorphicClerk().user,
    organization: thisClerk.isomorphicClerk().organization,
    lastOrganizationInvitation: null,
    lastOrganizationMember: null,
  });

  createEffect(
    on(
      () => thisClerk.isomorphicClerk(),
      () => {
        const unsub = thisClerk.isomorphicClerk().addListener(e => setState({ ...e }));
        console.log(`got here with ${JSON.stringify(thisClerk.isomorphicClerk())}`);
        if (typeof unsub === 'function') {
          onCleanup(unsub);
        }
      },
    ),
  );

  const derivedState = () => deriveState(thisClerk.loaded(), state(), props.initialState);

  console.log(`#2 got here with ${JSON.stringify(props)}`);

  const clerkValue = {
    clerk: () => thisClerk.isomorphicClerk() as any,
    client: () => state().client,
    session: () => state().session,
    user: () => state().user,
    organization: () => ({
      organization: state().organization,
      lastOrganizationInvitation: state().lastOrganizationInvitation,
      lastOrganizationMember: state().lastOrganizationMember,
    }),
    auth: () => derivedState(),
  };

  createEffect(() => console.log(clerkValue));

  return <SingleClerkContext.Provider value={clerkValue}>{props.children}</SingleClerkContext.Provider>;
};

export { ClerkProvider, __internal__setErrorThrowerOptions };

const createLoadedIsomorphicClerk = (_options: IsomorphicClerkOptions | Accessor<IsomorphicClerkOptions>) => {
  const [loaded, setLoaded] = createSignal(false);
  const options = () => (typeof _options === 'function' ? _options() : _options);
  const isomorphicClerk = () => IsomorphicClerk.getOrCreateInstance(options());

  createEffect(
    on(
      () => options()?.appearance,
      () => {
        isomorphicClerk().__unstable__updateProps({ appearance: options()?.appearance });
      },
    ),
  );

  createEffect(
    on(
      () => options()?.localization,
      () => {
        isomorphicClerk().__unstable__updateProps({ options: options() });
      },
    ),
  );

  void isomorphicClerk().addOnLoaded(() => setLoaded(true));

  return { isomorphicClerk, loaded };
};
