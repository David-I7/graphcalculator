import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/_base.scss";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./state/store";
import Globalstate from "./components/globalState/Globalstate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Globalstate />
      <Home />
    </Provider>
  </StrictMode>
);
