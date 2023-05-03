/* @refresh reload */
import { ErrorBoundary, render } from 'solid-js/web';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-solid';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(
  () => (
    <ErrorBoundary fallback={e => <div class='text-3xl font-bold text-red-500'>error: {e.message}</div>}>
      <ClerkProvider publishableKey={import.meta.env['VITE_CLERK_PUBLISHABLE_KEY']}>
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  ),
  root!,
);
