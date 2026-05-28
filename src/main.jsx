import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppProvider from './context/AppContext';
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
    <AppProvider>
      <App />
      </AppProvider>
    </StrictMode>
  </BrowserRouter>
);
