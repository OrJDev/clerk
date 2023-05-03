import { createSession, SingleClerkContext } from '@clerk/clerk-solid';
import { Component, createEffect, useContext } from 'solid-js';
import styles from './App.module.css';

const App: Component = () => {
  const session = useContext(SingleClerkContext);
  createEffect(() => {
    console.log(`sess`, session);
  });
  return (
    <div class={styles.App}>
      <h1>solid</h1>
    </div>
  );
};

export default App;
