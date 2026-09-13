import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { WorldBoundary } from './components/WorldBoundary';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><WorldBoundary><App /></WorldBoundary></React.StrictMode>);
