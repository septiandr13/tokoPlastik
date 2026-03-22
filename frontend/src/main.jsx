import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import 'antd/dist/reset.css';

const el = document.getElementById('root');
createRoot(el).render(<App />);
