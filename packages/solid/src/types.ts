/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  DomainOrProxyUrl,
  LoadedClerk,
  MultiDomainAndOrProxy,
  PublishableKeyOrFrontendApi,
  RedirectOptions,
  SessionResource,
  UserResource,
} from '@clerk/types';
import type { JSXElement } from 'solid-js';

declare global {
  interface Window {
    __clerk_frontend_api?: string;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: Clerk['proxyUrl'];
    __clerk_domain?: Clerk['domain'];
  }
}

export type IsomorphicClerkOptions = Omit<ClerkOptions, 'isSatellite'> & {
  Clerk?: ClerkProp;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
} & PublishableKeyOrFrontendApi &
  MultiDomainAndOrProxy;

export interface BrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): BrowserClerk;
}

export interface HeadlessBrowserClerkConstrutor {
  new (publishableKey: string, options?: DomainOrProxyUrl): HeadlessBrowserClerk;
}

export type WithClerkProp<T = unknown> = T & { clerk: LoadedClerk };

export type WithUserProp<T = unknown> = T & { user: UserResource };

export type WithSessionProp<T = unknown> = T & { session: SessionResource };

// Clerk object
export interface MountProps {
  mount: (node: HTMLDivElement, props: any) => void;
  unmount: (node: HTMLDivElement) => void;
  updateProps: (props: any) => void;
  props?: any;
}

export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: Omit<ClerkOptions, 'isSatellite'>) => Promise<void>;
  updateClient: (client: ClientResource) => void;
}

export interface BrowserClerk extends HeadlessBrowserClerk {
  onComponentsReady: Promise<void>;
  components: any;
}

export type ClerkProp =
  | BrowserClerkConstructor
  | BrowserClerk
  | HeadlessBrowserClerk
  | HeadlessBrowserClerkConstrutor
  | undefined
  | null;

type ButtonProps = {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  redirectUrl?: string;
  mode?: 'redirect' | 'modal';
  children?: JSXElement;
};

export type SignInButtonProps = ButtonProps;
export type SignUpButtonProps = ButtonProps;

export type SignInWithMetamaskButtonProps = Pick<ButtonProps, 'redirectUrl' | 'children'>;

export type RedirectToProps = RedirectOptions;