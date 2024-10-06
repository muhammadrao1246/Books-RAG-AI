import React from "react";
import ReactDOM from "react-dom/client";
import App from "src/App";

import { BrowserRouter } from "react-router-dom";

import { persistor, store } from "src/services/store";
import { Provider } from "react-redux";

import { SnackbarProvider } from "notistack";

import { PersistGate } from "redux-persist/integration/react";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
            <SnackbarProvider maxSnack={3}>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </SnackbarProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
