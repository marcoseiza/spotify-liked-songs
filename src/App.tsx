import type { Component } from 'solid-js';

import styles from './App.module.css';

const App: Component = () => {

  return (
    <div class={styles.App}>
      <button>Login with spotify</button>
    </div>
  );
};

export default App;
