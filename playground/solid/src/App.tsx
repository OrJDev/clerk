import { SingleClerkContext } from '@clerk/clerk-solid';
import { Component, createEffect, untrack, useContext } from 'solid-js';
import styles from './App.module.css';

let count = 0;
const App: Component = () => {
  const session = useContext(SingleClerkContext);
  createEffect(() => {
    const cnt = count++ + 1;
    if (session) {
      const s = session();
      const newValue: {
        [K in keyof typeof s]: typeof s[K] extends (...args: any) => any ? ReturnType<typeof s[K]> : typeof s[K];
      } = s as any;
      for (const key in s) {
        if (typeof (s as any)[key] === 'function') {
          (newValue as any)[key] = untrack(() => (s as any)[key]());
        }
      }
      console.log(`sess - #${cnt}`, newValue);
    } else {
      console.log(`sess - #${cnt}`, 'no session');
    }
  });
  return (
    <div class={styles.App}>
      <h1>solid</h1>
    </div>
  );
};

export default App;
