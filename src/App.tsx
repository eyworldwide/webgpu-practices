import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { main } from './demo/computation';

function App() {
  useEffect(() => {
    main();
  }, [])

  return (
    <div className="App">
      <canvas></canvas>
    </div>
  );
}

export default App;
