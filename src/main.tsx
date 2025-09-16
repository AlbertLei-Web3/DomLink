import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Web3Provider } from "./providers/web3-providers.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { BrowserRouter } from "react-router";
import AppProvider from "./providers/app-provider.tsx";
import App from "./App.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppProvider>
            <App />
          </AppProvider>
        </ThemeProvider>
      </Web3Provider>
    </BrowserRouter>
  </StrictMode>
);
