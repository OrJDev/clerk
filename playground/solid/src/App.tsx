import { SingleClerkContext } from '@clerk/clerk-solid';
import { Component, createEffect, useContext } from 'solid-js';
import styles from './App.module.css';

let count = 0;
const App: Component = () => {
  const session = useContext(SingleClerkContext);
  createEffect(() => {
    const cnt = count++ + 1;
    if (session) {
      const s = session();
      console.log(`sess - #${cnt}`, s.clerk());
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
