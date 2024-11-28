// src/App.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import RoutesComponent from "./Routes.jsx"; // Import RoutesComponent
import '../css/app.css'


// Main App Component
function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <RoutesComponent />
            </BrowserRouter>
        </Provider>
    );
}

// Render App component to the root element
const rootElement = document.getElementById("app");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
} else {
    console.error("Root element with id 'app' not found!");
}
