/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ClientResource, InitialState, Resources } from '@clerk/types';
import { isLegacyFrontendApiKey, isPublishableKey } from '@clerk/utils';
import { type Accessor, type ParentComponent, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js';

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

  createEffect(() =>
    console.log({
      derivedState: derivedState(),
    }),
  );

  console.log(`#2 got here with ${JSON.stringify(props)}`);

  return (
    <SingleClerkContext.Provider
      value={{
        // @ts-expect-error its fine
        clerk: () => thisClerk.isomorphicClerk(),
        client: () => state().client,
        session: () => state().session,
        user: () => state().user,
        organization: () => ({
          organization: state().organization,
          lastOrganizationInvitation: state().lastOrganizationInvitation,
          lastOrganizationMember: state().lastOrganizationMember,
        }),
        auth: () => derivedState(),
      }}
    >
      {props.children}
    </SingleClerkContext.Provider>
  );
};

export { ClerkProvider, __internal__setErrorThrowerOptions };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unsafeAction = async (action: () => any, name: string) => {
  console.log(`Running ${name} action`);
  try {
    const result = await action();
    console.log(`Finished ${name} action`, result);
  } catch (e) {
    console.error(`Error in ${name}:`, e);
  }
};

const createLoadedIsomorphicClerk = (_options: IsomorphicClerkOptions | Accessor<IsomorphicClerkOptions>) => {
  const [loaded, setLoaded] = createSignal(false);
  const options = () => (typeof _options === 'function' ? _options() : _options);
  const isomorphicClerk = () => IsomorphicClerk.getOrCreateInstance(options());

  createEffect(
    on(
      () => options().appearance,
      () => {
        void unsafeAction(
          () => isomorphicClerk().__unstable__updateProps({ appearance: options().appearance }),
          'appearance',
        );
      },
    ),
  );

  createEffect(
    on(
      () => options().localization,
      () => {
        void unsafeAction(() => isomorphicClerk().__unstable__updateProps({ options: options() }), 'options');
      },
    ),
  );

  onMount(() => {
    void unsafeAction(() => isomorphicClerk().addOnLoaded(() => setLoaded(true)), 'addOnLoaded');
  });

  return { isomorphicClerk, loaded };
};
