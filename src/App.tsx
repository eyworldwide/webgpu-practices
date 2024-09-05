import React, { useEffect } from 'react';
import './App.css';
import { main } from './demo/triangle';

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
