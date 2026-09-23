import './App.css';
import React from 'react';
import Allroutes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Allroutes />
    </ErrorBoundary>
  );
}

export default App;
