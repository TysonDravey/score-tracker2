import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ScoreTracker from './components/ScoreTracker';

console.log('React app starting...');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScoreTracker />
  </React.StrictMode>
);

console.log('React render called');