import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/_base.scss";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Globalstate from "./components/globalState/Globalstate";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/error/ErrorFallback";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <Globalstate />
        <Home />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
