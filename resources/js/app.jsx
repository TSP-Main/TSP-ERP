import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Home';

const rootElement = document.getElementById('app');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Home />);
} else {
    console.error("Root element with id 'app' not found!");
}
