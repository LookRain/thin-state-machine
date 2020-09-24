import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {useMachine, Machine} from 'thin-state-machine';

const machine = Machine({
  initialContext: {counter: 1},
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD: 'loading',
      },
    },
    loading: {
      on: {
        RESET: 'idle',
      },
    },
  },
  actions: {
    test: (eventName: string, payload: any) => {},
  },
});

function App() {
  const [count, setCount] = useState(0);
  const [a, b] = useMachine(machine);
  alert(a.value);
  React.useEffect(() => {
    b({
      type: 'LOAD',
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
