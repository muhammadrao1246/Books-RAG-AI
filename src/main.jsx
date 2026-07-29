import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "src/App.jsx";
import "src/index.css";

import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { persistor, store } from "src/services/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { VITE_SOCIAL_AUTH_GOOGLE_OAUTH2_KEY } from "./config";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider
          clientId={VITE_SOCIAL_AUTH_GOOGLE_OAUTH2_KEY}
          // onScriptLoadSuccess={(r) => console.info(r)}
          // onScriptLoadError={(r) => console.error(r)}
        >
          <SnackbarProvider maxSnack={3}>
            <App />
          </SnackbarProvider>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
